import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}