import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullname: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requireAuth: () => Promise<boolean>;
  signInWithProvider: (provider: 'google' | 'linkedin' | 'twitter') => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error: any) {
        // If we get a refresh token error, sign out to clear any stale session data
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
          setSession(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      segments.some(segment => segment.includes(route))
    );

    if (!session && isProtectedRoute) {
      router.replace('/(auth)/sign-in');
    } else if (session && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/(tabs)');
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

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.session?.user.id,
        full_name: fullname,
      });

    if (profileError) throw profileError;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const requireAuth = async () => {
    if (!session) {
      router.push('/(auth)/sign-in');
      return false;
    }
    return true;
  };

  const signInWithProvider = async (provider: 'google' | 'linkedin' | 'twitter') => {
    const redirectUrl = makeRedirectUri({
      path: '/(auth)/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success') {
        const { url } = result;
        await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: url } });
      }
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) throw error;
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      signIn,
      signUp,
      signOut,
      requireAuth,
      signInWithProvider,
      signInWithPhone,
      verifyOtp
    }}>
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