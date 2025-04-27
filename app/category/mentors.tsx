import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react-native';

interface Mentor {
  id: string; // Changed from number to string for UUID
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  rating: number;
  expertise: string[];
}

export default function MentorsScreen() {
  const {categoryId, subcategoryId} = useLocalSearchParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          id,
          bio,
          position,
          expertise,
          rating,
          profiles!professionals_id_fkey (
            full_name,
            avatar_url
          )
        `);

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from the query');
      }

      const formattedMentors = data.map(mentor => ({
        id: mentor.id,
        full_name: mentor.profiles.full_name,
        title: mentor.position || 'Professional Mentor',
        bio: mentor.bio || '',
        avatar_url: mentor.profiles.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        rating: mentor.rating || 0,
        expertise: mentor.expertise || []
      }));

      setMentors(formattedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Mentors</Text>
        <Text style={styles.subtitle}>Connect with experienced professionals</Text>
      </View>

      <FlatList
        data={mentors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/mentor/${item.id}`} asChild>
            <TouchableOpacity style={styles.mentorCard}>
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.mentorAvatar}
              />
              <View style={styles.mentorInfo}>
                <Text style={styles.mentorName}>{item.full_name}</Text>
                <Text style={styles.mentorTitle}>{item.title}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.expertiseContainer}>
                  {item.expertise.slice(0, 3).map((exp, index) => (
                    <View key={index} style={styles.expertiseTag}>
                      <Text style={styles.expertiseText}>{exp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={styles.listContainer}
      />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  listContainer: {
    padding: 16,
  },
  mentorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mentorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  mentorTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748b',
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  expertiseText: {
    fontSize: 12,
    color: '#0891b2',
  },
});
