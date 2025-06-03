import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { useCategories } from '@/providers/CategoriesProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function CategoriesScreen() {
  const { categories, loading, error } = useCategories();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Browse Categories</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>Find mentors by your area of interest</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/category/${item.id}`} asChild>
            <Pressable style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.categoryImage}
              />
              <View style={styles.categoryContent}>
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.categoryDescription, { color: theme.colors.subtitle }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.subcategoriesContainer}>
                  {item.subcategories.slice(0, 2).map((sub) => (
                    <View key={sub.id} style={[styles.subcategoryTag, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.subcategoryText, { color: theme.colors.primary }]}>{sub.name}</Text>
                    </View>
                  ))}
                  {item.subcategories.length > 2 && (
                    <Text style={[styles.moreText, { color: theme.colors.subtitle }]}>
                      +{item.subcategories.length - 2} more
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          </Link>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 160,
  },
  categoryContent: {
    padding: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  subcategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  subcategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
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
  },
});