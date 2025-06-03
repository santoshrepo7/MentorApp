import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface BackHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function BackHeader({ title, subtitle }: BackHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}>
        <ChevronLeft size={24} color={theme.colors.primary} />
      </Pressable>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>{subtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});