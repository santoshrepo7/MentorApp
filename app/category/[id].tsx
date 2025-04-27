import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { categories, getCategoryIcon } from '@/data/categories';
import { useState } from 'react';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const category = categories.find(c => c.id === id);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const CategoryIcon = category ? getCategoryIcon(category.icon) : null;

  const handleSubcategoryPress = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    router.push({
      pathname: '/category/mentors',
      params: { categoryId: id, subcategoryId }
    });
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Category not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {CategoryIcon && <CategoryIcon size={32} color="#0f172a" style={styles.icon} />}
        <Text style={styles.title}>{category.name}</Text>
        <Text style={styles.description}>{category.description}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select a Specialization</Text>
        <FlatList
          data={category.subcategories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.subcategoryCard,
                selectedSubcategory === item.id && styles.selectedCard
              ]}
              onPress={() => handleSubcategoryPress(item.id)}>
              <Text style={styles.subcategoryName}>{item.name}</Text>
              <Text style={styles.subcategoryDescription}>{item.description}</Text>
            </TouchableOpacity>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  listContainer: {
    gap: 16,
  },
  subcategoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0891b2',
    borderWidth: 1,
  },
  subcategoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  subcategoryDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});
