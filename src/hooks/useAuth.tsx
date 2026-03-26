import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService, subscriptionService, supabase, type Subscription } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: Subscription | null;
  loading: boolean;
  isSubscriptionActive: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sessão inicial
    authService.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSubscription(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadSubscription(session.user.id);
        } else {
          setSubscription(null);
          setIsSubscriptionActive(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const loadSubscription = async (userId: string) => {
    try {
      const { data, error } = await subscriptionService.getUserSubscription(userId);
      
      if (!error && data) {
        setSubscription(data);
        
        // Verificar se está ativa
        const active = await subscriptionService.isSubscriptionActive(userId);
        setIsSubscriptionActive(active);
      } else {
        setSubscription(null);
        setIsSubscriptionActive(false);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
      setSubscription(null);
      setIsSubscriptionActive(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.signIn(email, password);
    if (error) throw error;
    if (data.user) {
      await loadSubscription(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await authService.signUp(email, password, name);
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setSubscription(null);
    setIsSubscriptionActive(false);
    navigate('/login');
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription(user.id);
    }
  };

  const value = {
    user,
    session,
    subscription,
    loading,
    isSubscriptionActive,
    signIn,
    signUp,
    signOut,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Componente para proteger rotas
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, isSubscriptionActive } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isSubscriptionActive) {
        navigate('/subscription-required');
      }
    }
  }, [user, loading, isSubscriptionActive, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user || !isSubscriptionActive) {
    return null;
  }

  return <>{children}</>;
}
