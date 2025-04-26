import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Trash2 } from 'lucide-react-native';

interface LanguageInfo {
  languages: string[];
}

export default function LanguagesScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<LanguageInfo>({
    languages: [],
  });
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    fetchLanguageInfo();
  }, []);

  async function fetchLanguageInfo() {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('languages')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setInfo(data);
    } catch (error) {
      console.error('Error fetching language info:', error);
      Alert.alert('Error', 'Failed to load language information');
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
          languages: info.languages,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Language information updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating language info:', error);
      Alert.alert('Error', 'Failed to update language information');
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = () => {
    setInfo(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const updateLanguage = (index: number, value: string) => {
    setInfo(prev => ({
      ...prev,
      languages: prev.languages.map((item, i) => i === index ? value : item)
    }));
  };

  const removeLanguage = (index: number) => {
    setInfo(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
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
        <Text style={styles.title}>Languages</Text>
        <Text style={styles.subtitle}>Update your language proficiency</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addLanguage}>
              <Plus size={20} color="#0891b2" />
              <Text style={styles.addButtonText}>Add Language</Text>
            </TouchableOpacity>
          </View>

          {info.languages.map((lang, index) => (
            <View key={index} style={styles.itemContainer}>
              <TextInput
                style={styles.input}
                value={lang}
                onChangeText={(text) => updateLanguage(index, text)}
                placeholder="e.g., English (Native), Spanish (Fluent)"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLanguage(index)}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          {info.languages.length === 0 && (
            <Text style={styles.emptyText}>
              Add the languages you speak and your proficiency level
            </Text>
          )}
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
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginTop: 20,
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