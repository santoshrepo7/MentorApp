import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Trash2 } from 'lucide-react-native';

interface EducationInfo {
  education: string[];
  certifications: string[];
}

export default function EducationScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<EducationInfo>({
    education: [],
    certifications: [],
  });
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    fetchEducationInfo();
  }, []);

  async function fetchEducationInfo() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('education, certifications')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setInfo(data);
    } catch (error) {
      console.error('Error fetching education info:', error);
      Alert.alert('Error', 'Failed to load education information');
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
          education: info.education,
          certifications: info.certifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Education information updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating education info:', error);
      Alert.alert('Error', 'Failed to update education information');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setInfo(prev => ({
      ...prev,
      education: [...prev.education, '']
    }));
  };

  const updateEducation = (index: number, value: string) => {
    setInfo(prev => ({
      ...prev,
      education: prev.education.map((item, i) => i === index ? value : item)
    }));
  };

  const removeEducation = (index: number) => {
    setInfo(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setInfo(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setInfo(prev => ({
      ...prev,
      certifications: prev.certifications.map((item, i) => i === index ? value : item)
    }));
  };

  const removeCertification = (index: number) => {
    setInfo(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
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
        <Text style={styles.title}>Education & Certifications</Text>
        <Text style={styles.subtitle}>Update your qualifications</Text>
      </View>

      <View style={styles.form}>
        {/* Education Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addEducation}>
              <Plus size={20} color="#0891b2" />
              <Text style={styles.addButtonText}>Add Education</Text>
            </TouchableOpacity>
          </View>

          {info.education.map((edu, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={edu}
                onChangeText={(text) => updateEducation(index, text)}
                placeholder="e.g., MS Computer Science, Stanford University"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeEducation(index)}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCertification}>
              <Plus size={20} color="#0891b2" />
              <Text style={styles.addButtonText}>Add Certification</Text>
            </TouchableOpacity>
          </View>

          {info.certifications.map((cert, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={cert}
                onChangeText={(text) => updateCertification(index, text)}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeCertification(index)}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
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
  section: {
    marginBottom: 24,
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
    color: '#0f172a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  addButtonText: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '500',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  removeButton: {
    padding: 8,
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