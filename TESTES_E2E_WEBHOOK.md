# Guia de Testes End-to-End - Webhook SigiloPay

Este documento explica como executar os testes de integração end-to-end para o sistema de webhook do SigiloPay.

## 📋 Visão Geral

Os testes E2E validam três aspectos críticos do sistema:

### Task 13.1: Fluxo Completo
✅ Checkout → Subscription Pending → Webhook → Subscription Active
- Cria usuário, subscription e payment
- Simula webhook payment.approved
- Verifica ativação da subscription

### Task 13.2: Integridade Referencial
✅ Validação de ON DELETE SET NULL
- Testa que payment.subscription_id vira NULL quando subscription é deletada
- Testa que payment.customer_id vira NULL quando customer é deletado

### Task 13.3: Segurança HMAC
✅ Validação de assinatura criptográfica
- Aceita webhooks com assinatura válida
- Rejeita webhooks com assinatura inválida
- Rejeita webhooks sem header de assinatura
- Rejeita webhooks com payload modificado

## 🚀 Configuração Rápida

### 1. Verificar Variáveis de Ambiente

Os testes usam as variáveis do arquivo `.env`. Certifique-se de que as seguintes variáveis estão configuradas:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SIGILOPAY_SECRET_KEY=your-secret-key
```

⚠️ **IMPORTANTE**: Para testes, use uma instância Supabase de **teste/staging**, NUNCA produção!

### 2. Verificar Schema do Banco

Certifique-se de que as tabelas estão criadas no banco de teste:

```sql
-- Tabela customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  document TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sigilopay_id TEXT UNIQUE,
  pix_qr_code TEXT,
  pix_key TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela subscriptions (modificada)
ALTER TABLE subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_status_check 
  CHECK (status IN ('active', 'expired', 'cancelled', 'pending'));

ALTER TABLE subscriptions 
  ALTER COLUMN started_at DROP NOT NULL;
```

### 3. Executar os Testes

```bash
# Executar todos os testes E2E
npm test

# Executar apenas os testes de webhook
npm test webhook-integration.e2e.test.js

# Executar em modo watch (re-executa ao salvar)
npm run test:watch
```

## 📊 Estrutura dos Testes

```
api/__tests__/
├── webhook-integration.e2e.test.js  # Testes E2E principais
└── README.md                         # Documentação dos testes
```

### Arquivo Principal: `webhook-integration.e2e.test.js`

```javascript
// Task 13.1: Fluxo completo
describe('Task 13.1: Teste de fluxo completo end-to-end', () => {
  it('deve completar fluxo: checkout → subscription pending → webhook → subscription active')
  it('deve manter subscription pending quando payment é rejeitado')
});

// Task 13.2: Integridade referencial
describe('Task 13.2: Teste de integridade referencial', () => {
  it('deve definir payment.subscription_id como NULL quando subscription é deletada')
  it('deve manter payment quando customer é deletado')
});

// Task 13.3: Segurança HMAC
describe('Task 13.3: Testes de segurança HMAC', () => {
  it('deve aceitar webhook com assinatura HMAC válida')
  it('deve rejeitar webhook com assinatura HMAC inválida')
  it('deve rejeitar webhook sem header de assinatura')
  it('deve rejeitar webhook com secret key incorreta')
  it('deve rejeitar webhook com payload modificado após assinatura')
});
```

## 🔧 Helpers Disponíveis

Os testes incluem funções auxiliares para facilitar a criação de mocks:

### `createMockRequest(method, body, headers)`
Cria um mock de requisição HTTP para testar o webhook handler.

```javascript
const req = createMockRequest('POST', webhookPayload, {
  'x-sigilopay-signature': signature
});
```

### `createMockResponse()`
Cria um mock de resposta HTTP que captura status e body.

```javascript
const res = createMockResponse();
await webhookHandler(req, res);
expect(res.statusCode).toBe(200);
```

### `calculateHMAC(payload, secretKey)`
Calcula a assinatura HMAC-SHA256 de um payload.

```javascript
const signature = calculateHMAC(webhookPayload, sigilopaySecretKey);
```

### `cleanupTestData(email)`
Limpa dados de teste do banco de dados.

```javascript
await cleanupTestData('test@example.com');
```

## 🧪 Exemplo de Execução

```bash
$ npm test webhook-integration.e2e.test.js

 RUN  v3.2.4

 ✓ api/__tests__/webhook-integration.e2e.test.js (9)
   ✓ Task 13.1: Teste de fluxo completo end-to-end (2)
     ✓ deve completar fluxo: checkout → subscription pending → webhook → subscription active
     ✓ deve manter subscription pending quando payment é rejeitado
   ✓ Task 13.2: Teste de integridade referencial (2)
     ✓ deve definir payment.subscription_id como NULL quando subscription é deletada
     ✓ deve manter payment quando customer é deletado
   ✓ Task 13.3: Testes de segurança HMAC (5)
     ✓ deve aceitar webhook com assinatura HMAC válida
     ✓ deve rejeitar webhook com assinatura HMAC inválida
     ✓ deve rejeitar webhook sem header de assinatura
     ✓ deve rejeitar webhook com secret key incorreta
     ✓ deve rejeitar webhook com payload modificado após assinatura

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  15:30:00
   Duration  12.5s
```

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

**Problema**: As variáveis de ambiente necessárias não estão definidas.

**Solução**:
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Certifique-se de que as variáveis estão preenchidas:
   ```env
   VITE_SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   SIGILOPAY_SECRET_KEY=...
   ```

### Erro: "Payment not found"

**Problema**: As tabelas não existem no banco de dados de teste.

**Solução**:
1. Execute as migrations SQL no banco de teste
2. Verifique a conexão com o Supabase
3. Confirme que está usando a URL correta

### Erro: "HMAC validation failed"

**Problema**: A secret key está incorreta ou diferente entre teste e handler.

**Solução**:
1. Verifique se `SIGILOPAY_SECRET_KEY` está correta no `.env`
2. Certifique-se de usar a mesma secret key em todos os lugares
3. Verifique se não há espaços extras na variável

### Testes Lentos

**Problema**: Testes E2E levam muito tempo (>30 segundos).

**Explicação**: Isso é normal para testes E2E que fazem operações reais no banco.

**Otimizações**:
- Use um banco de teste local (Supabase local)
- Execute apenas os testes necessários durante desenvolvimento
- Use `npm run test:watch` para re-executar apenas testes modificados

### Erro: "Connection timeout"

**Problema**: Não consegue conectar ao Supabase.

**Solução**:
1. Verifique sua conexão com a internet
2. Confirme que a URL do Supabase está correta
3. Verifique se o projeto Supabase está ativo
4. Tente aumentar o timeout no `vitest.config.js`

## 📝 Notas Importantes

### Segurança
⚠️ **NUNCA use credenciais de produção nos testes!**
- Use sempre uma instância Supabase de teste/staging
- Mantenha as credenciais de teste separadas das de produção
- Não commite arquivos `.env` no Git

### Limpeza de Dados
✅ Os testes automaticamente limpam os dados criados:
- `beforeEach`: Limpa antes de cada teste
- `afterAll`: Limpa após todos os testes do suite
- Cada teste usa emails únicos com timestamp

### Independência
✅ Cada teste é independente:
- Pode ser executado isoladamente
- Não depende da ordem de execução
- Cria seus próprios dados de teste

### Performance
⏱️ Tempo esperado de execução:
- Teste individual: 2-5 segundos
- Suite completa: 10-30 segundos
- Depende da latência do banco de dados

## 🎯 Cobertura de Requirements

Os testes E2E cobrem os seguintes requirements:

### Task 13.1 - Fluxo Completo
- ✅ Requirement 1.1: Subscription criada com status 'pending'
- ✅ Requirement 1.5: Subscription permanece pending até webhook
- ✅ Requirement 4.6: Buscar subscription associada
- ✅ Requirement 4.7: Ativar subscription e definir started_at
- ✅ Requirement 4.10: Retornar 200 OK

### Task 13.2 - Integridade Referencial
- ✅ Requirement 11.6: ON DELETE SET NULL funciona corretamente

### Task 13.3 - Segurança HMAC
- ✅ Requirement 3.1: Extrair assinatura do header
- ✅ Requirement 3.4: Rejeitar assinaturas inválidas
- ✅ Requirement 3.5: Rejeitar quando header ausente

## 📚 Recursos Adicionais

- [Documentação Vitest](https://vitest.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Design Document](/.kiro/specs/sigilopay-webhook-integration/design.md)
- [Requirements Document](/.kiro/specs/sigilopay-webhook-integration/requirements.md)

## 🤝 Contribuindo

Ao adicionar novos testes:
1. Siga a estrutura existente
2. Use helpers para reduzir duplicação
3. Documente o que o teste valida
4. Inclua comentário com requirements validados
5. Garanta limpeza de dados após o teste
