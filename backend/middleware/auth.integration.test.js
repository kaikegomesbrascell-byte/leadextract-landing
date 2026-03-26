/**
 * Integration Tests for Token Verification Middleware
 * 
 * These tests demonstrate the middleware working in a real Express app context
 */

const express = require('express');
const request = require('supertest');
const { verifyToken } = require('./auth');

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

describe('verifyToken Middleware Integration', () => {
  let app;
  let mockSupabase;

  beforeEach(() => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Add protected route
    app.get('/api/protected', verifyToken, (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });

    // Get mocked Supabase
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should reject request without authorization header', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Token de autenticação não fornecido',
      code: 'NO_TOKEN'
    });
  });

  test('should reject request with invalid token format', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'InvalidFormat token123')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Formato de token inválido. Use: Bearer <token>',
      code: 'INVALID_TOKEN_FORMAT'
    });
  });

  test('should reject request with expired token', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' }
    });

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer expired_token')
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      message: 'Token expirado. Faça login novamente.',
      code: 'TOKEN_EXPIRED'
    });
  });

  test('should allow request with valid token and attach user data', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
      email_confirmed_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z'
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer valid_token')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        email_confirmed_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z'
      }
    });
  });

  test('should handle multiple protected routes', async () => {
    // Add another protected route
    app.get('/api/protected/profile', verifyToken, (req, res) => {
      res.json({
        success: true,
        profile: {
          userId: req.user.id,
          email: req.user.email
        }
      });
    });

    const mockUser = {
      id: 'user-456',
      email: 'another@example.com',
      role: 'admin',
      email_confirmed_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z'
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const response = await request(app)
      .get('/api/protected/profile')
      .set('Authorization', 'Bearer valid_token')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      profile: {
        userId: 'user-456',
        email: 'another@example.com'
      }
    });
  });
});
