import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Chat',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}