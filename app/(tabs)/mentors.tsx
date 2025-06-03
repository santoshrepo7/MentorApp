import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, ChevronRight, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { 
  Gesture,
  GestureDetector,
  GestureHandlerRootView 
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface Mentor {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  rating: number;
  expertise: string[];
  position: string;
  company: string;
  hourly_rate: number;
}

export default function MentorsScreen() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();
  const router = useRouter();
  
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

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
          position as title,
          expertise,
          rating,
          position,
          company,
          hourly_rate,
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
        title: mentor.title || 'Professional Mentor',
        bio: mentor.bio || '',
        avatar_url: mentor.profiles.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        rating: mentor.rating || 0,
        expertise: mentor.expertise || [],
        position: mentor.position || '',
        company: mentor.company || '',
        hourly_rate: mentor.hourly_rate || 0
      }));

      setMentors(formattedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  }

  const navigateToProfile = (mentorId: string) => {
    router.push(`/mentor/${mentorId}`);
  };

  const nextProfile = () => {
    if (currentIndex < mentors.length - 1) {
      setCurrentIndex(prev => prev + 1);
      translateX.value = 0;
    }
  };

  const previousProfile = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      translateX.value = 0;
    }
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value.x;
    })
    .onEnd((event) => {
      if (Math.abs(event.velocityX) < 500) {
        if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
          if (translateX.value > 0) {
            translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
              runOnJS(previousProfile)();
            });
          } else {
            translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
              runOnJS(nextProfile)();
            });
          }
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        if (event.velocityX > 0) {
          translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
            runOnJS(previousProfile)();
          });
        } else {
          translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
            runOnJS(nextProfile)();
          });
        }
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>Loading mentors...</Text>
      </View>
    );
  }

  if (mentors.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyText, { color: theme.colors.subtitle }]}>No mentors found</Text>
      </View>
    );
  }

  const currentMentor = mentors[currentIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Featured Mentors</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>
          {currentIndex + 1} of {mentors.length}
        </Text>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.mentorContainer, rStyle]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigateToProfile(currentMentor.id)}
            style={styles.mentorCard}>
            <Image
              source={{ uri: currentMentor.avatar_url }}
              style={styles.mentorImage}
            />
            <View style={styles.overlay}>
              <View style={styles.mentorInfo}>
                <Text style={styles.mentorName}>{currentMentor.full_name}</Text>
                <Text style={styles.mentorPosition}>
                  {currentMentor.position} at {currentMentor.company}
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.ratingContainer}>
                    <Star size={20} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>{currentMentor.rating.toFixed(1)}</Text>
                  </View>

                  <View style={styles.rateContainer}>
                    <DollarSign size={20} color="#22c55e" />
                    <Text style={styles.rateText}>${currentMentor.hourly_rate}/hr</Text>
                  </View>
                </View>

                <Text style={styles.bioText} numberOfLines={3}>
                  {currentMentor.bio}
                </Text>

                <View style={styles.expertiseContainer}>
                  {currentMentor.expertise.slice(0, 3).map((exp, index) => (
                    <View key={index} style={styles.expertiseTag}>
                      <Text style={styles.expertiseText}>{exp}</Text>
                    </View>
                  ))}
                  {currentMentor.expertise.length > 3 && (
                    <View style={styles.expertiseTag}>
                      <Text style={styles.expertiseText}>+{currentMentor.expertise.length - 3} more</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.viewProfileButton}
                  onPress={() => navigateToProfile(currentMentor.id)}>
                  <Text style={styles.viewProfileText}>View Full Profile</Text>
                  <ChevronRight size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <View style={styles.instructions}>
        <Text style={[styles.instructionText, { color: theme.colors.subtitle }]}>
          Swipe left or right to browse mentors
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
  },
  mentorContainer: {
    flex: 1,
  },
  mentorCard: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 180,
    position: 'relative',
  },
  mentorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  mentorInfo: {
    gap: 12,
  },
  mentorName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  mentorPosition: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '600',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rateText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    opacity: 0.9,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  expertiseTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expertiseText: {
    color: '#fff',
    fontSize: 14,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});