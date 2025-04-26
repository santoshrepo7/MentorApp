import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Camera, Mail, Phone, MapPin, Globe, Briefcase, Building2 } from 'lucide-react-native';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  company: string;
  position: string;
  website: string;
}

export default function PersonalInfoScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!profile || !session?.user?.id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          company: profile.company,
          position: profile.position,
          website: profile.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ 
            uri: profile?.avatar_url || 
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
          }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.changePhotoButton}>
          <Camera size={20} color="#0891b2" />
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile?.full_name}
            onChangeText={(text) => setProfile(prev => ({ ...prev!, full_name: text }))}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWithIcon}>
            <Mail size={20} color="#64748b" />
            <TextInput
              style={styles.inputIcon}
              value={profile?.email || session?.user?.email}
              editable={false}
              placeholder="Your email address"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWithIcon}>
            <Phone size={20} color="#64748b" />
            <TextInput
              style={styles.inputIcon}
              value={profile?.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev!, phone: text }))}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color="#64748b" />
            <TextInput
              style={styles.inputIcon}
              value={profile?.location}
              onChangeText={(text) => setProfile(prev => ({ ...prev!, location: text }))}
              placeholder="Enter your location"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company</Text>
          <View style={styles.inputWithIcon}>
            <Building2 size={20} color="#64748b" />
            <TextInput
              style={styles.inputIcon}
              value={profile?.company}
              onChangeText={(text) => setProfile(prev => ({ ...prev!, company: text }))}
              placeholder="Enter your company name"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Position</Text>
          <View style={styles.inputWithIcon}>
            <Briefcase size={20} color="#64748b" />
            <TextInput
              style={styles.inputIcon}
              value={profile?.position}
              onChangeText={(text) => setProfile(prev => ({ ...prev!, position: text }))}
              placeholder="Enter your job title"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <View style={styles.inputWithIcon}>
            <Globe size={20} color="#64748b" />
            <TextInput
              style={styles.inputIcon}
              value={profile?.website}
              onChangeText={(text) => setProfile(prev => ({ ...prev!, website: text }))}
              placeholder="Enter your website URL"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.textArea}
            value={profile?.bio}
            onChangeText={(text) => setProfile(prev => ({ ...prev!, bio: text }))}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});