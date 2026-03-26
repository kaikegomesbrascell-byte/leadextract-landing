# Exemplos de Uso do Middleware de Autenticação

Este documento fornece exemplos práticos de como usar o middleware `verifyToken` em diferentes cenários.

## 1. Proteger uma Rota Específica

```javascript
const { verifyToken } = require('./middleware/auth');

// Rota protegida - requer autenticação
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    // req.user contém os dados do usuário autenticado
    const userId = req.user.id;
    
    // Buscar dados adicionais do usuário
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      profile: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil'
    });
  }
});
```

## 2. Proteger Múltiplas Rotas com Prefixo

```javascript
const { verifyToken } = require('./middleware/auth');

// Todas as rotas que começam com /api/protected/* requerem autenticação
app.use('/api/protected', verifyToken);

// Estas rotas estão automaticamente protegidas
app.get('/api/protected/dashboard', (req, res) => {
  res.json({ message: 'Dashboard', user: req.user });
});

app.get('/api/protected/settings', (req, res) => {
  res.json({ message: 'Settings', user: req.user });
});

app.post('/api/protected/update', (req, res) => {
  res.json({ message: 'Update', user: req.user });
});
```

## 3. Combinar com Outros Middlewares

```javascript
const { verifyToken } = require('./middleware/auth');
const { checkPaymentStatus } = require('./middleware/payment'); // A ser implementado

// Primeiro verifica autenticação, depois verifica pagamento
app.get('/api/lead-extractor/search', 
  verifyToken,           // Valida token
  checkPaymentStatus,    // Verifica se pagamento está ativo
  async (req, res) => {
    // Usuário está autenticado E tem pagamento ativo
    res.json({
      success: true,
      message: 'Acesso autorizado ao Lead Extractor'
    });
  }
);
```

## 4. Rotas Opcionalmente Autenticadas

```javascript
const { verifyToken } = require('./middleware/auth');

// Middleware que tenta autenticar mas não bloqueia se falhar
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Sem token, continua sem autenticação
    req.user = null;
    return next();
  }
  
  // Tem token, tenta validar
  return verifyToken(req, res, next);
};

// Rota que funciona com ou sem autenticação
app.get('/api/content', optionalAuth, (req, res) => {
  if (req.user) {
    // Usuário autenticado - retorna conteúdo premium
    res.json({
      content: 'Premium content',
      user: req.user
    });
  } else {
    // Usuário não autenticado - retorna conteúdo básico
    res.json({
      content: 'Basic content'
    });
  }
});
```

## 5. Verificar Permissões Específicas

```javascript
const { verifyToken } = require('./middleware/auth');

// Middleware para verificar role do usuário
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação necessária'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissão negada',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

// Rota apenas para administradores
app.delete('/api/users/:id', 
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    // Apenas admins chegam aqui
    const { id } = req.params;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar usuário'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  }
);
```

## 6. Logging de Acessos

```javascript
const { verifyToken } = require('./middleware/auth');

// Middleware para registrar acessos
const logAccess = async (req, res, next) => {
  if (req.user) {
    try {
      await supabase
        .from('access_logs')
        .insert({
          user_id: req.user.id,
          endpoint: req.path,
          method: req.method,
          ip_address: req.ip,
          user_agent: req.get('user-agent'),
          success: true
        });
    } catch (error) {
      console.error('Erro ao registrar acesso:', error);
    }
  }
  next();
};

// Aplicar logging em rotas protegidas
app.get('/api/sensitive-data', 
  verifyToken,
  logAccess,
  (req, res) => {
    res.json({
      success: true,
      data: 'Sensitive information'
    });
  }
);
```

## 7. Tratamento de Erros Personalizado

```javascript
const { verifyToken } = require('./middleware/auth');

// Wrapper para customizar mensagens de erro
const customVerifyToken = async (req, res, next) => {
  // Criar um wrapper para res.json
  const originalJson = res.json.bind(res);
  
  res.json = (data) => {
    if (data.code === 'TOKEN_EXPIRED') {
      // Customizar mensagem de token expirado
      return originalJson({
        ...data,
        message: 'Sua sessão expirou. Por favor, faça login novamente.',
        redirectTo: '/login'
      });
    }
    return originalJson(data);
  };
  
  return verifyToken(req, res, next);
};

app.get('/api/custom-protected', customVerifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
```

## 8. Refresh Token Pattern

```javascript
const { verifyToken } = require('./middleware/auth');

// Endpoint para refresh do token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token não fornecido'
      });
    }
    
    // Usar Supabase para renovar o token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });
    
    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      });
    }
    
    res.json({
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao renovar token'
    });
  }
});
```

## 9. Rate Limiting por Usuário

```javascript
const { verifyToken } = require('./middleware/auth');

// Armazenar contadores de requisições (em produção, usar Redis)
const requestCounts = new Map();

const rateLimitByUser = (maxRequests, windowMs) => {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requestCounts.get(userId) || [];
    
    // Remover requisições antigas
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(userId, recentRequests);
    
    next();
  };
};

// Limitar a 10 requisições por minuto por usuário
app.get('/api/expensive-operation',
  verifyToken,
  rateLimitByUser(10, 60000),
  (req, res) => {
    res.json({
      success: true,
      message: 'Operação executada'
    });
  }
);
```

## 10. Teste Manual com cURL

```bash
# Sem token (deve retornar 401)
curl http://localhost:3001/api/protected/profile

# Com token inválido (deve retornar 401)
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3001/api/protected/profile

# Com token válido (deve retornar 200)
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3001/api/protected/profile
```

## Como Obter um Token Válido para Testes

```javascript
// No frontend ou em um script de teste
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://blodznzrdzjsvaqabsvj.supabase.co',
  'sua-anon-key'
);

// Fazer login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@example.com',
  password: 'senha123'
});

if (data.session) {
  console.log('Token:', data.session.access_token);
  // Use este token no header Authorization: Bearer <token>
}
```


---

## 11. Usando checkPaymentStatus Middleware (Task 3.2)

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

// Rota protegida que requer autenticação E pagamento ativo
app.get('/api/lead-extractor/extract', 
  verifyToken,           // Primeiro: valida token
  checkPaymentStatus,    // Segundo: verifica pagamento
  async (req, res) => {
    // req.user e req.subscription estão disponíveis aqui
    
    res.json({
      success: true,
      message: 'Acesso autorizado',
      user: {
        id: req.user.id,
        email: req.user.email
      },
      subscription: {
        plan: req.subscription.plan_id,
        limit: req.subscription.extraction_limit || 'ilimitado',
        used: req.subscription.extractions_used
      }
    });
  }
);
```

## 12. Verificar Limite de Uso com checkPaymentStatus

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

app.post('/api/lead-extractor/extract', 
  verifyToken,
  checkPaymentStatus,
  async (req, res) => {
    const { subscription } = req;
    
    // Verificar se atingiu o limite (apenas para plano Start)
    if (subscription.extraction_limit !== null) {
      const remaining = subscription.extraction_limit - subscription.extractions_used;
      
      if (remaining <= 0) {
        return res.status(403).json({
          success: false,
          message: 'Limite de extrações atingido',
          code: 'LIMIT_REACHED',
          limit: subscription.extraction_limit,
          used: subscription.extractions_used
        });
      }
      
      // Avisar quando estiver próximo do limite
      if (remaining <= 5) {
        res.set('X-Limit-Warning', `Restam apenas ${remaining} extrações`);
      }
    }
    
    // Processar extração...
    const extractionResult = await performExtraction(req.body);
    
    // Incrementar contador de uso
    await supabase
      .from('subscriptions')
      .update({ 
        extractions_used: subscription.extractions_used + 1 
      })
      .eq('id', subscription.id);
    
    res.json({
      success: true,
      data: extractionResult,
      remaining: subscription.extraction_limit 
        ? subscription.extraction_limit - subscription.extractions_used - 1
        : 'ilimitado'
    });
  }
);
```

## 13. Proteger Todas as Rotas do Lead Extractor

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

// Aplicar ambos middlewares em todas as rotas do Lead Extractor
app.use('/api/lead-extractor', verifyToken, checkPaymentStatus);

// Todas essas rotas agora requerem autenticação + pagamento ativo
app.get('/api/lead-extractor/dashboard', (req, res) => {
  res.json({
    user: req.user,
    subscription: req.subscription
  });
});

app.get('/api/lead-extractor/companies', (req, res) => {
  res.json({ companies: [] });
});

app.post('/api/lead-extractor/extract', (req, res) => {
  res.json({ success: true });
});
```

## 14. Recurso Exclusivo para Plano Sovereign

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

// Middleware para verificar plano específico
const requirePlan = (planId) => {
  return (req, res, next) => {
    if (!req.subscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription não encontrada',
        code: 'NO_SUBSCRIPTION'
      });
    }
    
    if (req.subscription.plan_id !== planId) {
      return res.status(403).json({
        success: false,
        message: `Este recurso está disponível apenas para o plano ${planId}`,
        code: 'PLAN_UPGRADE_REQUIRED',
        current_plan: req.subscription.plan_id,
        required_plan: planId
      });
    }
    
    next();
  };
};

// Recurso premium apenas para Sovereign
app.get('/api/lead-extractor/whatsapp-direct',
  verifyToken,
  checkPaymentStatus,
  requirePlan('sovereign'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Acesso ao WhatsApp direto dos decisores',
      data: {
        // dados premium
      }
    });
  }
);
```

## 15. Endpoint de Status da Subscription

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

app.get('/api/subscriptions/status', 
  verifyToken,
  checkPaymentStatus,
  (req, res) => {
    const { subscription } = req;
    
    // Calcular dias até expiração
    let daysUntilExpiration = null;
    if (subscription.expires_at) {
      const expirationDate = new Date(subscription.expires_at);
      const now = new Date();
      const diffTime = expirationDate - now;
      daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan_id,
        status: subscription.status,
        activated_at: subscription.activated_at,
        expires_at: subscription.expires_at,
        days_until_expiration: daysUntilExpiration,
        usage: {
          limit: subscription.extraction_limit || 'ilimitado',
          used: subscription.extractions_used,
          remaining: subscription.extraction_limit 
            ? subscription.extraction_limit - subscription.extractions_used
            : 'ilimitado',
          percentage: subscription.extraction_limit
            ? Math.round((subscription.extractions_used / subscription.extraction_limit) * 100)
            : 0
        }
      }
    });
  }
);
```

## 16. Tratamento de Diferentes Status de Pagamento

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

// Middleware customizado para lidar com status específicos
const handlePaymentStatus = async (req, res, next) => {
  // Primeiro tenta verificar o pagamento
  await checkPaymentStatus(req, res, (err) => {
    if (err) return next(err);
    
    // Se chegou aqui, o pagamento está ativo
    next();
  });
};

// Rota que trata erros de pagamento de forma customizada
app.get('/api/lead-extractor/custom',
  verifyToken,
  async (req, res, next) => {
    try {
      // Tentar verificar pagamento
      await new Promise((resolve, reject) => {
        checkPaymentStatus(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Pagamento ativo - continuar
      next();
      
    } catch (error) {
      // Pagamento inativo - redirecionar para página de upgrade
      res.status(403).json({
        success: false,
        message: 'Acesso negado',
        redirectTo: '/pricing',
        action: 'upgrade'
      });
    }
  },
  (req, res) => {
    res.json({ success: true });
  }
);
```

## 17. Teste Manual com cURL - checkPaymentStatus

```bash
# 1. Fazer login e obter token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"senha123"}'

# 2. Usar token para acessar rota protegida (deve verificar pagamento)
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:3001/api/lead-extractor/dashboard

# Respostas esperadas:

# Se pagamento ativo (200):
# {
#   "success": true,
#   "user": {...},
#   "subscription": {...}
# }

# Se pagamento expirado (403):
# {
#   "success": false,
#   "message": "Sua assinatura expirou. Renove para continuar acessando a plataforma.",
#   "code": "PAYMENT_INACTIVE",
#   "status": "expirado"
# }

# Se sem subscription (403):
# {
#   "success": false,
#   "message": "Nenhuma assinatura encontrada. Adquira um plano para acessar a plataforma.",
#   "code": "NO_SUBSCRIPTION"
# }
```

## 18. Logging de Verificações de Pagamento

```javascript
const { verifyToken, checkPaymentStatus } = require('./middleware/auth');

// Middleware para registrar verificações de pagamento
const logPaymentCheck = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = async (data) => {
    // Registrar no access_logs
    try {
      await supabase
        .from('access_logs')
        .insert({
          user_id: req.user?.id,
          endpoint: req.path,
          method: req.method,
          ip_address: req.ip,
          user_agent: req.get('user-agent'),
          success: res.statusCode === 200,
          status_code: res.statusCode,
          payment_status_checked: req.subscription?.status || 'not_checked',
          payment_status_result: data.code || 'success'
        });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
    
    return originalJson(data);
  };
  
  next();
};

// Aplicar logging em rotas protegidas
app.get('/api/lead-extractor/extract',
  verifyToken,
  checkPaymentStatus,
  logPaymentCheck,
  (req, res) => {
    res.json({ success: true });
  }
);
```

## Resumo de Uso dos Middlewares

### Ordem Correta dos Middlewares

```javascript
// ✅ CORRETO - verifyToken sempre primeiro
app.get('/api/protected', 
  verifyToken,           // 1º: Valida token e popula req.user
  checkPaymentStatus,    // 2º: Verifica pagamento usando req.user.id
  handler
);

// ❌ ERRADO - checkPaymentStatus precisa de req.user
app.get('/api/protected', 
  checkPaymentStatus,    // Vai falhar: req.user não existe
  verifyToken,
  handler
);
```

### Casos de Uso Comuns

| Cenário | Middlewares | Exemplo |
|---------|-------------|---------|
| Rota pública | Nenhum | `/api/pricing` |
| Rota autenticada | `verifyToken` | `/api/profile` |
| Rota com pagamento | `verifyToken` + `checkPaymentStatus` | `/api/lead-extractor/*` |
| Rota admin | `verifyToken` + `requireRole('admin')` | `/api/admin/*` |
| Rota premium | `verifyToken` + `checkPaymentStatus` + `requirePlan('sovereign')` | `/api/premium/*` |
