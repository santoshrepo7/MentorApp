import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Search, ChevronRight, Star, Calendar, Clock, UserPlus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useCategories } from '@/providers/CategoriesProvider';

interface Professional {
  id: string;
  full_name: string;
  avatar_url: string;
  position: string;
  rating: number;
  expertise: string[];
  bio: string;
  hourly_rate: number;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  mentor: {
    profiles: {
      full_name: string;
    }
  };
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [isMentor, setIsMentor] = useState(false);
  const router = useRouter();
  const { requireAuth, session } = useAuth();
  const { theme } = useTheme();
  const { categories, loading: categoriesLoading } = useCategories();

  // Get first 6 categories
  const featuredCategories = categories.slice(0, 6);

  useEffect(() => {
    fetchMentors();
    if (session?.user) {
      fetchNextAppointment();
      checkMentorStatus();
    }
  }, [session]);

  async function checkMentorStatus() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsMentor(!!data);
    } catch (error) {
      console.error('Error checking mentor status:', error);
    }
  }

  async function fetchNextAppointment() {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          type,
          status,
          mentor:mentor_id(
            profiles (
              full_name
            )
          )
        `)
        .eq('user_id', session?.user.id)
        .eq('status', 'confirmed')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(1);

      if (error) throw error;
      setNextAppointment(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error('Error fetching next appointment:', error);
    }
  }

  async function fetchMentors() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          id,
          bio,
          hourly_rate,
          rating,
          expertise,
          position,
          profiles!professionals_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('rating', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from the query');
      }

      const formattedMentors = data.map(mentor => ({
        id: mentor.id,
        full_name: mentor.profiles.full_name,
        avatar_url: mentor.profiles.avatar_url,
        position: mentor.position,
        rating: mentor.rating,
        expertise: mentor.expertise,
        bio: mentor.bio,
        hourly_rate: mentor.hourly_rate
      }));

      setMentors(formattedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to load mentors. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search-results',
        params: { query: searchQuery }
      });
    }
  };

  const handleBecomeMentor = async () => {
    const isAuthenticated = await requireAuth();
    if (isAuthenticated) {
      router.push('/become-mentor');
    }
  };

  if (categoriesLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Z</Text>
        <Text style={styles.headerTitle1}>Mentor</Text>
        <View style={{ flex: 2 }} />
        {!isMentor && (
          <Pressable
            style={styles.becomeMentorButton}
            onPress={handleBecomeMentor}>
            <UserPlus size={20} color="#fff" />
            <Text style={styles.becomeMentorText}>Become a Mentor</Text>
          </Pressable>
        )}
      </View>

      {/* Next Appointment Card */}
      {nextAppointment && (
        <Pressable 
          style={[styles.appointmentCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/appointments')}>
          <View style={styles.appointmentHeader}>
            <Text style={[styles.appointmentTitle, { color: theme.colors.text }]}>Next Session</Text>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
          </View>
          <View style={styles.appointmentDetails}>
            <View style={styles.appointmentInfo}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={[styles.appointmentText, { color: theme.colors.text }]}>
                {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={[styles.appointmentText, { color: theme.colors.text }]}>{nextAppointment.time}</Text>
            </View>
            <Text style={[styles.mentorName, { color: theme.colors.subtitle }]}>
              with {nextAppointment.mentor.profiles.full_name}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Hero Section */}
      <View style={styles.hero}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Find Your Perfect Mentor</Text>
          <Text style={styles.heroSubtitle}>Connect with experts who can guide you to success</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
          <Search size={20} color={theme.colors.subtitle} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search mentors, categories, or skills..."
            placeholderTextColor={theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Categories Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Popular Categories</Text>
        <View style={styles.categoriesGrid}>
          {featuredCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push(`/category/${category.id}`)}>
              <Image
                source={{ uri: category.image_url }}
                style={styles.categoryImage}
              />
              <View style={[styles.categoryContent, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category.name}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={[styles.categorySubtext, { color: theme.colors.subtitle }]}>
                    {category.subcategories.length} subcategories
                  </Text>
                  <ChevronRight size={16} color={theme.colors.subtitle} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        <Link href="/categories" asChild>
          <Pressable style={[styles.viewAllButton, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.viewAllButtonText, { color: theme.colors.primary }]}>View All Categories</Text>
          </Pressable>
        </Link>
      </View>

      {/* Featured Mentors */}
      <View style={[styles.section, styles.featuredSection, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Mentors</Text>
          <Link href="/category/mentors1" asChild>
            <Pressable>
              <Text style={[styles.seeAllLink, { color: theme.colors.primary }]}>See All</Text>
            </Pressable>
          </Link>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mentorsScroll}>
          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={fetchMentors}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {mentors.map((mentor) => (
                <Link
                  key={mentor.id}
                  href={`/mentor/${mentor.id}`}
                  asChild>
                  <Pressable style={[styles.mentorCard, { backgroundColor: theme.colors.card }]}>
                    <Image
                      source={{ uri: mentor.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
                      style={styles.mentorAvatar}
                    />
                    <Text style={[styles.mentorName, { color: theme.colors.text }]}>{mentor.full_name}</Text>
                    <Text style={[styles.mentorPosition, { color: theme.colors.subtitle }]}>{mentor.position}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <Text style={[styles.ratingText, { color: theme.colors.subtitle }]}>{mentor.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={[styles.mentorBio, { color: theme.colors.subtitle }]} numberOfLines={2}>
                      {mentor.bio.length > 30 ? `${mentor.bio.slice(0, 30)}...` : mentor.bio}
                    </Text>
                    <View style={styles.mentorTags}>
                      {mentor.expertise.slice(0, 2).map((skill, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                          <Text style={[styles.tagText, { color: theme.colors.primary }]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                </Link>
              ))}
              {loading && (
                <View style={[styles.loadingCard, { backgroundColor: theme.colors.card }]}>
                  <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>Loading mentors...</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fEf',
  },
  headerTitle1: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  becomeMentorButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(244, 255, 234, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  becomeMentorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentCard: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentDetails: {
    gap: 8,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentText: {
    fontSize: 16,
  },
  mentorName: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  hero: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  searchContainer: {
    padding: 16,
    marginTop: -20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryContent: {
    padding: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySubtext: {
    fontSize: 12,
  },
  featuredSection: {
    marginVertical: 8,
  },
  mentorsScroll: {
    paddingRight: 16,
  },
  mentorCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mentorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
  },
  mentorPosition: {
    fontSize: 14,
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
  },
  rateText: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
  },
  mentorBio: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  mentorTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
  },
  loadingCard: {
    width: 260,
    height: 230,
    marginRight: 12,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    width: 260,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});