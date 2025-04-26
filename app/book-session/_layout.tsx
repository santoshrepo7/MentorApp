import { Stack } from 'expo-router';

export default function BookSessionLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="confirmation" 
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="receipt" 
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: false
        }}
      />
    </Stack>
  );
}