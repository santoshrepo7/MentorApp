import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requireAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// List of protected routes that require authentication
const PROTECTED_ROUTES = [
  'become-mentor',
  'book-session',
  'profile',
  'messages',
  'appointments'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      segments.some(segment => segment.includes(route))
    );

    if (!session && isProtectedRoute) {
      router.replace('/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, loading, segments]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (fullname: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullname,
      }).execute();

    if (profileError) throw profileError;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const requireAuth = async () => {
    if (!session) {
      router.push('/sign-in');
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
