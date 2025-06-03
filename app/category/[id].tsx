import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import BackHeader from '@/components/BackHeader';
import { useTheme } from '@/providers/ThemeProvider';
import { useCategories } from '@/providers/CategoriesProvider';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { categories, loading, error } = useCategories();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const category = categories.find(c => c.id === id);

  const handleSubcategoryPress = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    router.push({
      pathname: '/category/mentors',
      params: { categoryId: id, subcategoryId }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <BackHeader />
        <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>Loading...</Text>
      </View>
    );
  }

  if (error || !category) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <BackHeader />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error || 'Category not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BackHeader title={category.name} subtitle="Select a specialization" />
      
      <View style={styles.content}>
        <FlatList
          data={category.subcategories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.subcategoryCard,
                { backgroundColor: theme.colors.card },
                selectedSubcategory === item.id && styles.selectedCard
              ]}
              onPress={() => handleSubcategoryPress(item.id)}>
              <Text style={[styles.subcategoryName, { color: theme.colors.text }]}>{item.name}</Text>
              <Text style={[styles.subcategoryDescription, { color: theme.colors.subtitle }]}>
                {item.description}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  listContainer: {
    gap: 16,
  },
  subcategoryCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#0891b2',
    borderWidth: 1,
  },
  subcategoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subcategoryDescription: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#ef4444',
  },
});