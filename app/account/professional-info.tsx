import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

interface ProfessionalInfo {
  bio: string;
  years_of_experience: number;
  hourly_rate: number;
  expertise: string[];
  teaching_style: string;
  company: string;
  position: string;
  industry: string;
}

export default function ProfessionalInfoScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<ProfessionalInfo>({
    bio: '',
    years_of_experience: 0,
    hourly_rate: 0,
    expertise: [],
    teaching_style: '',
    company: '',
    position: '',
    industry: '',
  });
  const [newExpertise, setNewExpertise] = useState('');
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    fetchProfessionalInfo();
  }, []);

  async function fetchProfessionalInfo() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setInfo(data);
    } catch (error) {
      console.error('Error fetching professional info:', error);
      Alert.alert('Error', 'Failed to load professional information');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!session?.user?.id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('professionals')
        .update({
          bio: info.bio,
          years_of_experience: info.years_of_experience,
          hourly_rate: info.hourly_rate,
          expertise: info.expertise,
          teaching_style: info.teaching_style,
          company: info.company,
          position: info.position,
          industry: info.industry,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Professional information updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating professional info:', error);
      Alert.alert('Error', 'Failed to update professional information');
    } finally {
      setSaving(false);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setInfo(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const removeExpertise = (index: number) => {
    setInfo(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Professional Details</Text>
        <Text style={styles.subtitle}>Update your professional information</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Professional Bio</Text>
          <TextInput
            style={styles.textArea}
            value={info.bio}
            onChangeText={(text) => setInfo(prev => ({ ...prev, bio: text }))}
            placeholder="Write about your professional background and expertise"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
              style={styles.input}
              value={info.years_of_experience.toString()}
              onChangeText={(text) => setInfo(prev => ({ ...prev, years_of_experience: parseInt(text) || 0 }))}
              keyboardType="numeric"
              placeholder="e.g., 5"
            />
          </View>

          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.label}>Hourly Rate (USD)</Text>
            <TextInput
              style={styles.input}
              value={info.hourly_rate.toString()}
              onChangeText={(text) => setInfo(prev => ({ ...prev, hourly_rate: parseFloat(text) || 0 }))}
              keyboardType="numeric"
              placeholder="e.g., 50"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Current Position</Text>
          <TextInput
            style={styles.input}
            value={info.position}
            onChangeText={(text) => setInfo(prev => ({ ...prev, position: text }))}
            placeholder="e.g., Senior Software Engineer"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            value={info.company}
            onChangeText={(text) => setInfo(prev => ({ ...prev, company: text }))}
            placeholder="e.g., Tech Corp"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Industry</Text>
          <TextInput
            style={styles.input}
            value={info.industry}
            onChangeText={(text) => setInfo(prev => ({ ...prev, industry: text }))}
            placeholder="e.g., Technology"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Areas of Expertise</Text>
          <View style={styles.expertiseContainer}>
            {info.expertise.map((item, index) => (
              <View key={index} style={styles.expertiseItem}>
                <Text style={styles.expertiseText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => removeExpertise(index)}
                  style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addExpertise}>
            <TextInput
              style={[styles.input, styles.expertiseInput]}
              value={newExpertise}
              onChangeText={setNewExpertise}
              placeholder="Add new expertise"
              onSubmitEditing={addExpertise}
            />
            <TouchableOpacity
              style={[styles.addButton, !newExpertise.trim() && styles.addButtonDisabled]}
              onPress={addExpertise}
              disabled={!newExpertise.trim()}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Teaching Style</Text>
          <TextInput
            style={styles.textArea}
            value={info.teaching_style}
            onChangeText={(text) => setInfo(prev => ({ ...prev, teaching_style: text }))}
            placeholder="Describe your approach to teaching and mentoring"
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    padding: 20,
  },
  field: {
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 8,
  },
  expertiseText: {
    fontSize: 14,
    color: '#0891b2',
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  addExpertise: {
    flexDirection: 'row',
    gap: 12,
  },
  expertiseInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0891b2',
    padding: 16,
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