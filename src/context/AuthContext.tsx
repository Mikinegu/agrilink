import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types/index.ts';
import { signOutSupabase, getSupabase, isSupabaseConfigured, signInWithSupabase } from '../lib/supabase.ts';

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { phoneOrEmail: string; pin?: string; password?: string }) => Promise<{ success: boolean; user?: User; error?: string; requiresEmailVerification?: boolean }>;
  logout: () => Promise<void>;
  switchPersona: (userId: number) => Promise<User | null>;
  refreshUser: () => Promise<User | null>;
  checkEmailVerification: (email: string) => Promise<{ success: boolean; verified: boolean; user?: User; message?: string }>;
  getRoleDashboardPath: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'agrilink_auth_token';
const USER_KEY = 'agrilink_auth_user';

export const getRoleDashboardPath = (role?: UserRole): string => {
  switch (role) {
    case 'FARMER':
      return '/farmer/dashboard';
    case 'BUYER':
    case 'BUSINESS_BUYER':
      return '/buyer/dashboard';
    case 'DRIVER':
    case 'LOGISTICS_ADMIN':
    case 'HUB_OPERATOR':
      return '/logistics/dashboard';
    case 'INPUT_SUPPLIER':
      return '/supplier/dashboard';
    case 'FINANCIAL_INSTITUTION':
      return '/finance/dashboard';
    case 'PLATFORM_ADMIN':
      return '/admin/overview';
    default:
      return '/';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setCurrentUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const res = await fetch('/api/auth/current', {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        const user = userData.user || userData;
        setCurrentUser(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } else {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setCurrentUser(null);
        return null;
      }
    } catch (err) {
      console.error('Failed to rehydrate session:', err);
      // Fallback to cached user if offline
      const cached = localStorage.getItem(USER_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCurrentUser(parsed);
          return parsed;
        } catch {}
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for Supabase email confirmation link redirect and session changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    try {
      const client = getSupabase();
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          const sbUser = session.user;
          const isConfirmed = Boolean(sbUser.email_confirmed_at || sbUser.confirmed_at);
          if (isConfirmed) {
            try {
              const syncRes = await fetch('/api/auth/supabase-sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  supabaseUid: sbUser.id,
                  email: sbUser.email,
                  fullName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
                  phone: sbUser.user_metadata?.phone,
                  role: sbUser.user_metadata?.role || 'FARMER',
                  isEmailVerified: true,
                }),
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                const user = syncData.user;
                if (user) {
                  const authToken = `agrilink-token-${user.id}-${Date.now()}`;
                  localStorage.setItem(TOKEN_KEY, authToken);
                  localStorage.setItem(USER_KEY, JSON.stringify(user));
                  localStorage.setItem('agrilink_authenticated', 'true');
                  setToken(authToken);
                  setCurrentUser(user);
                }
              }
            } catch (syncErr) {
              console.warn('[AgriLink Auth] Supabase callback sync notice:', syncErr);
            }
          }
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn('[AgriLink Auth] Listener setup error:', e);
    }
  }, []);

  const checkEmailVerification = async (email: string): Promise<{ success: boolean; verified: boolean; user?: User; message?: string }> => {
    try {
      const res = await fetch('/api/auth/check-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.verified && data.user) {
        const authToken = data.token || `agrilink-token-${data.user.id}-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem('agrilink_authenticated', 'true');
        setToken(authToken);
        setCurrentUser(data.user);
        return { success: true, verified: true, user: data.user, message: data.message };
      }
      return { success: false, verified: false, message: data.message };
    } catch (err: any) {
      return { success: false, verified: false, message: err.message };
    }
  };

  const login = async (credentials: {
    phoneOrEmail: string;
    pin?: string;
    password?: string;
  }): Promise<{ success: boolean; user?: User; error?: string; requiresEmailVerification?: boolean }> => {
    setIsLoading(true);
    const cleanInput = credentials.phoneOrEmail.trim();
    const isEmail = cleanInput.includes('@');
    const pass = credentials.password || credentials.pin || '123456';

    try {
      // 1. Try Supabase Auth first if input is an email and Supabase is configured
      if (isEmail && isSupabaseConfigured()) {
        try {
          const sbResult = await signInWithSupabase({
            email: cleanInput,
            password: pass,
          });

          if (sbResult.success && sbResult.user) {
            const authToken = `agrilink-token-${sbResult.user.id}-${Date.now()}`;
            localStorage.setItem(TOKEN_KEY, authToken);
            localStorage.setItem(USER_KEY, JSON.stringify(sbResult.user));
            localStorage.setItem('agrilink_authenticated', 'true');

            setToken(authToken);
            setCurrentUser(sbResult.user);
            setIsLoading(false);
            return { success: true, user: sbResult.user };
          }

          if (sbResult.requiresEmailVerification) {
            setIsLoading(false);
            return {
              success: false,
              requiresEmailVerification: true,
              error: 'Email verification required. Please verify your email address before signing in.',
            };
          }
        } catch (sbErr) {
          console.warn('[AgriLink Auth] Supabase direct auth skipped to backend:', sbErr);
        }
      }

      // 2. Local backend login endpoint (which also auto-checks Supabase verification)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return {
          success: false,
          requiresEmailVerification: data.requiresEmailVerification,
          error: data.error || 'Authentication failed. Please check your credentials.',
        };
      }

      const authToken = data.token || `agrilink-token-${data.user.id}-${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem('agrilink_authenticated', 'true');

      setToken(authToken);
      setCurrentUser(data.user);
      setIsLoading(false);

      return {
        success: true,
        user: data.user,
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'An unexpected network error occurred.',
      };
    }
  };

  const switchPersona = async (userId: number): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const switchData = await res.json();
        const targetId = switchData?.user?.id || userId;
        const curRes = await fetch('/api/auth/current', {
          headers: {
            'x-user-id': String(targetId),
          },
        });

        if (curRes.ok) {
          const resData = await curRes.json();
          const user = resData?.user || resData;
          const newToken = `agrilink-token-${user.id}-${Date.now()}`;
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          localStorage.setItem('agrilink_authenticated', 'true');

          setToken(newToken);
          setCurrentUser(user);
          setIsLoading(false);
          return user;
        }
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
    setIsLoading(false);
    return null;
  };

  const logout = async (): Promise<void> => {
    try {
      await signOutSupabase();
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('agrilink_authenticated');
    setToken(null);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    token,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    switchPersona,
    refreshUser,
    checkEmailVerification,
    getRoleDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
