import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function AccountLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: theme.colors.text,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="personal-info"
        options={{
          title: 'Personal Information',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="payment-methods"
        options={{
          title: 'Payment Methods',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="professional-info"
        options={{
          title: 'Professional Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="education"
        options={{
          title: 'Education & Certifications',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="languages"
        options={{
          title: 'Languages',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="availability"
        options={{
          title: 'Availability Settings',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}