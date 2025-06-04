import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Search, ChevronRight, Star, Calendar, Clock, Video, MessageSquare, Phone, UserPlus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useCategories } from '@/providers/CategoriesProvider';

interface SearchResult {
  type: 'category' | 'subcategory' | 'mentor';
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_category?: string;
}

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mentors, setMentors] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isMentor, setIsMentor] = useState(false);
  const router = useRouter();
  const { requireAuth, session } = useAuth();
  const { theme } = useTheme();
  const { categories, loading: categoriesLoading } = useCategories();

  const featuredCategories = categories.slice(0, 6);

  useEffect(() => {
    fetchMentors();
    if (session?.user) {
      fetchUpcomingAppointments();
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

  async function fetchUpcomingAppointments() {
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
        .limit(3);

      if (error) throw error;
      setUpcomingAppointments(data || []);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
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

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setShowSearchResults(true);
    const searchTerm = text.toLowerCase();

    try {
      // Search categories
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, description, image_url')
        .ilike('name', `%${searchTerm}%`)
        .or(`description.ilike.%${searchTerm}%`);

      // Search subcategories
      const { data: subcategoryData } = await supabase
        .from('subcategories')
        .select(`
          id, 
          name, 
          description,
          categories!inner (
            name
          )
        `)
        .ilike('name', `%${searchTerm}%`)
        .or(`description.ilike.%${searchTerm}%`);

      // Search mentors
      const { data: mentorData } = await supabase
        .from('professionals')
        .select(`
          id,
          bio,
          expertise,
          position,
          company,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .or(`bio.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
        .textSearch('search_text', searchTerm);

      const results: SearchResult[] = [
        ...(categoryData?.map(cat => ({
          type: 'category' as const,
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image_url: cat.image_url
        })) || []),
        ...(subcategoryData?.map(sub => ({
          type: 'subcategory' as const,
          id: sub.id,
          name: sub.name,
          description: sub.description,
          parent_category: sub.categories.name
        })) || []),
        ...(mentorData?.map(mentor => ({
          type: 'mentor' as const,
          id: mentor.id,
          name: mentor.profiles.full_name,
          description: mentor.bio,
          image_url: mentor.profiles.avatar_url
        })) || [])
      ];

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSearchResultPress = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    switch (result.type) {
      case 'category':
        router.push(`/category/${result.id}`);
        break;
      case 'subcategory':
        // Find parent category
        const category = categories.find(cat => 
          cat.subcategories.some(sub => sub.id === result.id)
        );
        if (category) {
          router.push({
            pathname: '/category/mentors',
            params: { categoryId: category.id, subcategoryId: result.id }
          });
        }
        break;
      case 'mentor':
        router.push(`/mentor/${result.id}`);
        break;
    }
  };

  const handleBecomeMentor = async () => {
    const isAuthenticated = await requireAuth();
    if (isAuthenticated) {
      router.push('/become-mentor');
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'chat':
        return MessageSquare;
      case 'call':
        return Phone;
      default:
        return Video;
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

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming Sessions</Text>
            <Link href="/appointments" asChild>
              <Pressable>
                <Text style={[styles.seeAllLink, { color: theme.colors.primary }]}>See All</Text>
              </Pressable>
            </Link>
          </View>
          {upcomingAppointments.map((appointment) => {
            const SessionIcon = getSessionIcon(appointment.type);
            return (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.sessionInfo}>
                    <SessionIcon size={20} color={theme.colors.subtitle} />
                    <Text style={[styles.sessionType, { color: theme.colors.text }]}>
                      {appointment.type} Session with {appointment.mentor.profiles.full_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color={theme.colors.subtitle} />
                    <Text style={[styles.detailText, { color: theme.colors.text }]}>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={16} color={theme.colors.subtitle} />
                    <Text style={[styles.detailText, { color: theme.colors.text }]}>{appointment.time}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
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
            onChangeText={handleSearch}
          />
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={[styles.searchResults, { backgroundColor: theme.colors.card }]}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={`${result.type}-${result.id}`}
                style={[
                  styles.searchResultItem,
                  index < searchResults.length - 1 && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }
                ]}
                onPress={() => handleSearchResultPress(result)}>
                {result.type === 'mentor' && result.image_url && (
                  <Image
                    source={{ uri: result.image_url }}
                    style={styles.resultImage}
                  />
                )}
                <View style={styles.resultContent}>
                  <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                    {result.name}
                  </Text>
                  {result.type === 'subcategory' && (
                    <Text style={[styles.resultSubtitle, { color: theme.colors.subtitle }]}>
                      in {result.parent_category}
                    </Text>
                  )}
                  {result.description && (
                    <Text 
                      style={[styles.resultDescription, { color: theme.colors.subtitle }]}
                      numberOfLines={1}>
                      {result.description}
                    </Text>
                  )}
                </View>
                <View style={[styles.resultType, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.resultTypeText, { color: theme.colors.primary }]}>
                    {result.type}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
                source={{ 
                  uri: category.image_url || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
                }}
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
                      source={{ 
                        uri: mentor.avatar_url || 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg'
                      }}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '500',
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
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
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
    zIndex: 1000,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  resultDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  resultType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultTypeText: {
    fontSize: 12,
    fontWeight: '500',
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