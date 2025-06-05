import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, Alert, Dimensions, Platform } from 'react-native';
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
  MapPin
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';

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

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const { signOut, session } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (session?.user) {
      fetchProfiles();
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

  const handleChangePhoto = async () => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to change your photo.');
          return;
        }
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const file = result.assets[0];

        // Upload to Supabase Storage
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${session?.user.id}/${fileName}`;

        // Convert uri to blob
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // Upload image
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', session?.user.id);

        if (updateError) throw updateError;

        // Update local state
        setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
        Alert.alert('Success', 'Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Error changing photo:', error);
      Alert.alert('Error', 'Failed to update profile photo');
    } finally {
      setUploadingImage(false);
    }
  };

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

  const handleLanguageChange = () => {
    Alert.alert(
      'Change Language',
      'Select your preferred language',
      [
        { text: 'English', onPress: () => console.log('English selected') },
        { text: 'Spanish', onPress: () => console.log('Spanish selected') },
        { text: 'French', onPress: () => console.log('French selected') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCurrencyChange = () => {
    Alert.alert(
      'Change Currency',
      'Select your preferred currency',
      [
        { text: 'USD ($)', onPress: () => console.log('USD selected') },
        { text: 'EUR (€)', onPress: () => console.log('EUR selected') },
        { text: 'GBP (£)', onPress: () => console.log('GBP selected') },
        { text: 'Cancel', style: 'cancel' }
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
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Image
          source={{ 
            uri: profile?.avatar_url || 
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
          }}
          style={styles.avatar}
        />
        <TouchableOpacity 
          style={styles.changePhotoButton}
          onPress={handleChangePhoto}
          disabled={uploadingImage}>
          <Camera size={20} color={theme.colors.primary} />
          <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
            {uploadingImage ? 'Uploading...' : 'Change Photo'}
          </Text>
        </TouchableOpacity>
      </View>

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
            onPress={handleLanguageChange}>
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
            onPress={handleCurrencyChange}>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsList: {
    marginTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    marginBottom: 4,
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