import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    test: {
      globals: true,
      environment: 'node',
      setupFiles: [],
      testTimeout: 30000, // 30 segundos para testes E2E
      hookTimeout: 30000,
      include: [
        '**/__tests__/**/*.test.js',
        '**/*.test.js'
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**'
      ],
      env: {
        // Disponibilizar variáveis de ambiente para os testes
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
        SIGILOPAY_SECRET_KEY: env.SIGILOPAY_SECRET_KEY,
        SIGILOPAY_WEBHOOK_SECRET: env.SIGILOPAY_WEBHOOK_SECRET,
        SIGILOPAY_PUBLIC_KEY: env.SIGILOPAY_PUBLIC_KEY,
      }
    }
  };
});
