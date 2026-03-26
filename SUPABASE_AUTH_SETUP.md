# 🔐 Sistema de Autenticação e Assinatura - LeadExtract

Sistema completo de login e gerenciamento de assinaturas integrado ao Supabase com planos Standard e Premium.

## 📋 Funcionalidades

✅ **Autenticação Completa**
- Login com email e senha
- Registro de novos usuários
- Recuperação de senha
- Logout seguro
- Proteção de rotas

✅ **Sistema de Assinatura**
- Plano Standard (R$ 97/mês)
- Plano Premium (R$ 1.000/mês)
- Controle manual de expiração
- Status: ativo, expirado, cancelado, pendente

✅ **Painel Administrativo**
- Visualizar todas as assinaturas
- Alterar plano (Standard ↔ Premium)
- Definir data de expiração
- Remover expiração (controle manual)
- Expirar assinatura manualmente
- Renovar assinaturas

## 🚀 Configuração

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute o script `sql/create_auth_tables.sql`
3. Copie as credenciais em **Project Settings > API**

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

### 3. Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### 4. Configurar Rotas

Atualize o `src/App.tsx` ou seu arquivo de rotas:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@/hooks/useAuth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import SubscriptionRequired from '@/pages/SubscriptionRequired';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subscription-required" element={<SubscriptionRequired />} />
          
          {/* Rotas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Rota Admin */}
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 📊 Estrutura do Banco de Dados

### Tabela: `user_profiles`
```sql
- id (UUID)
- user_id (UUID) → auth.users
- name (TEXT)
- phone (TEXT)
- document (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `subscriptions`
```sql
- id (UUID)
- user_id (UUID) → auth.users
- plan (TEXT) → 'standard' | 'premium'
- status (TEXT) → 'active' | 'expired' | 'cancelled' | 'pending'
- started_at (TIMESTAMP)
- expires_at (TIMESTAMP) → NULL = nunca expira
- cancelled_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🎯 Como Usar

### No Frontend

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, subscription, isSubscriptionActive, signOut } = useAuth();

  return (
    <div>
      <p>Usuário: {user?.email}</p>
      <p>Plano: {subscription?.plan}</p>
      <p>Status: {subscription?.status}</p>
      <p>Ativo: {isSubscriptionActive ? 'Sim' : 'Não'}</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### Criar Assinatura Após Pagamento

```tsx
import { subscriptionService } from '@/lib/supabase';

// Após pagamento aprovado
const userId = 'user-uuid';
const plan = 'standard'; // ou 'premium'
const expiresAt = null; // null = controle manual

await subscriptionService.createSubscription(userId, plan, expiresAt);
```

### Verificar Assinatura Ativa

```tsx
import { subscriptionService } from '@/lib/supabase';

const isActive = await subscriptionService.isSubscriptionActive(userId);
```

## 🔧 Gerenciamento Manual

### Criar Admin

Execute no SQL Editor do Supabase:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### Expiração Automática (Cron)

Configure um cron job no Supabase:

```sql
SELECT cron.schedule(
  'expire-subscriptions',
  '0 0 * * *', -- Todo dia à meia-noite
  $$ SELECT expire_subscriptions(); $$
);
```

## 📱 Páginas Criadas

1. **`/login`** - Página de login
2. **`/register`** - Página de registro
3. **`/subscription-required`** - Página quando assinatura é necessária
4. **`/admin/subscriptions`** - Painel administrativo de assinaturas
5. **`/dashboard`** - Dashboard protegido (exemplo)

## 🎨 Componentes UI Necessários

Certifique-se de ter os componentes shadcn/ui instalados:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
```

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Usuários só veem seus próprios dados
- ✅ Senhas criptografadas pelo Supabase Auth
- ✅ Tokens JWT seguros
- ✅ Proteção contra SQL Injection

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Supabase
2. Teste as queries SQL manualmente
3. Verifique as variáveis de ambiente
4. Confirme que o RLS está configurado corretamente

## 🎉 Pronto!

Seu sistema de autenticação e assinatura está configurado e pronto para uso!
