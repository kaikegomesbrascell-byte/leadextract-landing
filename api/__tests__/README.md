# Testes de Integração End-to-End - SigiloPay Webhook

Este diretório contém os testes de integração end-to-end para o sistema de webhook do SigiloPay.

## Estrutura dos Testes

### Task 13.1: Teste de Fluxo Completo
Valida o fluxo completo desde o checkout até a ativação da assinatura:
1. Criação de usuário no Supabase Auth
2. Criação de subscription com status 'pending'
3. Criação de payment vinculado à subscription
4. Processamento de webhook payment.approved
5. Verificação de subscription ativada e payment aprovado

**Valida Requirements:** 1.1, 1.5, 4.6, 4.7, 4.10

### Task 13.2: Teste de Integridade Referencial
Valida que as foreign keys com ON DELETE SET NULL funcionam corretamente:
- Quando subscription é deletada, payment.subscription_id deve ser NULL
- Quando customer é deletado, payment.customer_id deve ser NULL

**Valida Requirements:** 11.6

### Task 13.3: Testes de Segurança HMAC
Valida a segurança da validação HMAC:
- Aceita webhooks com assinatura válida
- Rejeita webhooks com assinatura inválida
- Rejeita webhooks sem header de assinatura
- Rejeita webhooks com secret key incorreta
- Rejeita webhooks com payload modificado após assinatura

**Valida Requirements:** 3.1, 3.4, 3.5

## Pré-requisitos

1. **Banco de Dados de Teste**: Configure uma instância Supabase de teste/staging
2. **Variáveis de Ambiente**: Configure as variáveis no arquivo `.env.test`
3. **Schema do Banco**: Execute as migrations para criar as tabelas necessárias

## Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.test.example .env.test
```

2. Preencha as variáveis de ambiente no `.env.test`:
```env
VITE_SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SIGILOPAY_SECRET_KEY=your-test-secret-key
```

3. Execute as migrations no banco de teste:
```sql
-- Criar tabelas customers, payments, subscriptions
-- Ver arquivos em /sql/
```

## Executando os Testes

### Executar todos os testes E2E:
```bash
npm test
```

### Executar apenas os testes de webhook:
```bash
npm test webhook-integration.e2e.test.js
```

### Executar em modo watch:
```bash
npm run test:watch
```

### Executar com cobertura:
```bash
npm test -- --coverage
```

## Estrutura dos Testes

```javascript
describe('Task 13.1: Teste de fluxo completo end-to-end', () => {
  // Testa o fluxo completo de checkout → webhook → ativação
});

describe('Task 13.2: Teste de integridade referencial', () => {
  // Testa ON DELETE SET NULL nas foreign keys
});

describe('Task 13.3: Testes de segurança HMAC', () => {
  // Testa validação de assinatura HMAC
});
```

## Helpers Disponíveis

- `createMockRequest(method, body, headers)`: Cria mock de requisição HTTP
- `createMockResponse()`: Cria mock de resposta HTTP
- `calculateHMAC(payload, secretKey)`: Calcula assinatura HMAC
- `cleanupTestData(email)`: Limpa dados de teste do banco

## Limpeza de Dados

Os testes automaticamente limpam os dados criados usando:
- `beforeEach`: Limpa antes de cada teste
- `afterAll`: Limpa após todos os testes do suite

## Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"
- Verifique se o arquivo `.env.test` existe e está preenchido
- Certifique-se de que as variáveis estão corretas

### Erro: "Payment not found"
- Verifique se as migrations foram executadas no banco de teste
- Verifique se o banco de teste está acessível

### Erro: "HMAC validation failed"
- Verifique se a SIGILOPAY_SECRET_KEY está correta
- Certifique-se de usar a mesma secret key no teste e no webhook handler

### Testes lentos
- Os testes E2E podem levar 10-30 segundos devido a operações de banco de dados
- Considere usar um banco de teste local para melhor performance

## Notas Importantes

⚠️ **NUNCA use credenciais de produção nos testes!**

✅ Use sempre uma instância Supabase de teste/staging

✅ Os testes criam e limpam seus próprios dados

✅ Cada teste é independente e pode ser executado isoladamente
