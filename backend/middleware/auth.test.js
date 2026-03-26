/**
 * Tests for Token Verification Middleware
 * 
 * These tests verify the verifyToken middleware functionality:
 * - Token validation
 * - User data extraction
 * - Error handling for expired/invalid tokens
 */

const { verifyToken } = require('./auth');

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

describe('verifyToken Middleware', () => {
  let req, res, next;
  let mockSupabase;

  beforeEach(() => {
    // Reset mocks
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Get mocked Supabase instance
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 when no authorization header is provided', async () => {
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token de autenticação não fornecido',
      code: 'NO_TOKEN'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token format is invalid', async () => {
    req.headers.authorization = 'InvalidFormat token123';

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Formato de token inválido. Use: Bearer <token>',
      code: 'INVALID_TOKEN_FORMAT'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is expired', async () => {
    req.headers.authorization = 'Bearer expired_token';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' }
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token expirado. Faça login novamente.',
      code: 'TOKEN_EXPIRED'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid JWT' }
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should attach user data to request and call next() when token is valid', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
      email_confirmed_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z'
    };

    req.headers.authorization = 'Bearer valid_token';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    await verifyToken(req, res, next);

    expect(req.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
      email_confirmed_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 when user is not found', async () => {
    req.headers.authorization = 'Bearer valid_token';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Usuário não encontrado',
      code: 'USER_NOT_FOUND'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 500 when an unexpected error occurs', async () => {
    req.headers.authorization = 'Bearer valid_token';
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Database connection failed'));

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erro interno ao verificar autenticação',
      code: 'INTERNAL_ERROR'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
