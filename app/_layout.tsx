import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { CategoriesProvider } from '@/providers/CategoriesProvider';

function RootLayoutNav() {
  const { theme, isDarkMode } = useTheme();

  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <AuthProvider>
        <CategoriesProvider>
          <RootLayoutNav />
        </CategoriesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}