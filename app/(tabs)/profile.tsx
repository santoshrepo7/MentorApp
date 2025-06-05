import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, Alert, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { 
  Settings, 
  User,
  CreditCard,
  Bell,
  Moon,
  Globe,
  DollarSign,
  Shield,
  LogOut,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Camera,
  MapPin,
  Image as ImageIcon
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');
const HEADER_HEIGHT = screenWidth * 0.8; // 80% of screen width for aspect ratio

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
}

interface ProfessionalProfile {
  id: string;
  bio: string;
  years_of_experience: number;
  hourly_rate: number;
  expertise: string[];
  education: string[];
  certifications: string[];
  languages: string[];
  teaching_style: string;
  company: string;
  position: string;
  industry: string;
}

interface MediaItem {
  id: string;
  media_url: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { signOut, session } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (session?.user) {
      fetchProfiles();
      fetchMedia();
    }
  }, [session]);

  async function fetchProfiles() {
    try {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (userError) throw userError;
      setProfile(userData);

      // Fetch professional profile if exists
      const { data: profData, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (profError && profError.code !== 'PGRST116') throw profError;
      setProfessionalProfile(profData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMedia() {
    try {
      const { data, error } = await supabase
        .from('mentor_media')
        .select('*')
        .eq('mentor_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/sign-in');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Image
          source={{ 
            uri: profile?.avatar_url || 
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
          }}
          style={styles.coverPhoto}
        />
        <View style={[styles.headerOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        
        <View style={styles.profileInfo}>
          <Image
            source={{ 
              uri: profile?.avatar_url || 
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
            }}
            style={styles.avatar}
          />
          
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || session?.user?.email}</Text>
            
            {professionalProfile && (
              <View style={styles.badgeContainer}>
                <View style={styles.mentorBadge}>
                  <Award size={16} color="#fff" />
                  <Text style={styles.mentorBadgeText}>Mentor</Text>
                </View>
                {professionalProfile.position && (
                  <View style={[styles.positionBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Briefcase size={16} color={theme.colors.primary} />
                    <Text style={[styles.positionText, { color: theme.colors.primary }]}>
                      {professionalProfile.position}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Camera size={20} color="#fff" />
            <Text style={styles.editButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      {professionalProfile && (
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {professionalProfile.years_of_experience}+
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.subtitle }]}>Years</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {professionalProfile.expertise?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.subtitle }]}>Skills</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ${professionalProfile.hourly_rate}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.subtitle }]}>Per Hour</Text>
          </View>
        </View>
      )}

      {/* Media Gallery Preview */}
      {professionalProfile && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Media Gallery</Text>
            <Link href="/account/media" asChild>
              <TouchableOpacity>
                <Text style={[styles.seeAllLink, { color: theme.colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.mediaGrid}>
            {media.map((item) => (
              <Image
                key={item.id}
                source={{ uri: item.media_url }}
                style={styles.mediaImage}
              />
            ))}
            {media.length === 0 && (
              <TouchableOpacity
                style={[styles.addMediaButton, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push('/account/media')}>
                <ImageIcon size={24} color={theme.colors.subtitle} />
                <Text style={[styles.addMediaText, { color: theme.colors.subtitle }]}>Add Media</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Account Settings */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => router.push('/account/personal-info')}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <User size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Personal Information</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Update your profile details</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtitle} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => router.push('/account/payment-methods')}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <CreditCard size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Payment Methods</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Manage your payment options</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtitle} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <Bell size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Configure notification preferences</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtitle} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mentor Settings */}
      {professionalProfile && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mentor Profile</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => router.push('/account/professional-info')}>
              <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
                <Briefcase size={20} color={theme.colors.subtitle} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Professional Details</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Update your expertise and rates</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.subtitle} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => router.push('/account/education')}>
              <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
                <GraduationCap size={20} color={theme.colors.subtitle} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Education & Certifications</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Manage your qualifications</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.subtitle} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => router.push('/account/availability')}>
              <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
                <Languages size={20} color={theme.colors.subtitle} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Availability Slot</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Update your preferred date and timeproblem_description</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.subtitle} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => router.push('/account/languages')}>
              <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
                <Languages size={20} color={theme.colors.subtitle} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Languages</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Update your language proficiency</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.subtitle} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Appearance Settings */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
        <View style={styles.settingsList}>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <Moon size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Toggle dark theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]} 
            onPress={() => Alert.alert('Coming Soon', 'Language settings will be available soon!')}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <Globe size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Language</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>English (US)</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtitle} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]} 
            onPress={() => Alert.alert('Coming Soon', 'Currency settings will be available soon!')}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <DollarSign size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Currency</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>USD ($)</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtitle} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Settings */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => router.push('/account/security')}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <Shield size={20} color={theme.colors.subtitle} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Security Settings</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.subtitle }]}>Manage password and security</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.subtitle} />
          </TouchableOpacity>


          <TouchableOpacity 
            style={[styles.settingItem, styles.signOutButton]} 
            onPress={handleSignOut}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <LogOut size={20} color={theme.colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.signOutText, { color: theme.colors.error }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
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
  header: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 16,
  },
  nameContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mentorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  mentorBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    padding: 20,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaImage: {
    width: (screenWidth - 56) / 2,
    height: (screenWidth - 56) / 2,
    borderRadius: 8,
  },
  addMediaButton: {
    width: (screenWidth - 56) / 2,
    height: (screenWidth - 56) / 2,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaText: {
    marginTop: 8,
    fontSize: 14,
  },
  settingsList: {
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ef4444',
  },
});