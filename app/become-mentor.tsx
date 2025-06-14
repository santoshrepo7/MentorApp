import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useCategories } from '@/providers/CategoriesProvider';
import { Plus, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface FormData {
  bio: string;
  years_of_experience: string;
  hourly_rate: string;
  categories: string[];
  subcategories: string[];
  expertise: string[];
  education: string[];
  certifications: string[];
  languages: string[];
  achievements: string[];
  teaching_style: string;
  session_format: string[];
  time_zone: string;
  linkedin_url: string;
  website_url: string;
  company: string;
  position: string;
  industry: string;
  skills: string[];
  work_experience: string[];
}

interface NewCategoryForm {
  name: string;
  description: string;
  icon: string;
  image_url: string;
}

interface NewSubcategoryForm {
  name: string;
  description: string;
  category_id: string;
}

export default function BecomeMentorScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { categories, loading: categoriesLoading, refreshCategories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    name: '',
    description: '',
    icon: 'Briefcase',
    image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
  });
  const [newSubcategory, setNewSubcategory] = useState<NewSubcategoryForm>({
    name: '',
    description: '',
    category_id: ''
  });

  const [formData, setFormData] = useState<FormData>({
    bio: '',
    years_of_experience: '',
    hourly_rate: '',
    categories: [],
    subcategories: [],
    expertise: [],
    education: [''],
    certifications: [''],
    languages: [''],
    achievements: [''],
    teaching_style: '',
    session_format: ['video', 'chat', 'call'],
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    linkedin_url: '',
    website_url: '',
    company: '',
    position: '',
    industry: '',
    skills: [],
    work_experience: [''],
  });

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setProfileImage(file.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session?.user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      if (!formData.bio || !formData.years_of_experience || !formData.hourly_rate) {
        throw new Error('Please fill in all required fields');
      }

      let avatarUrl = null;
      if (profileImage) {
        avatarUrl = await uploadImage(profileImage);
        if (!avatarUrl) {
          throw new Error('Failed to upload profile image');
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', session.user.id);

        if (profileError) throw profileError;
      }

      const { error: insertError } = await supabase
        .from('professionals')
        .insert({
          id: session.user.id,
          ...formData,
          years_of_experience: parseInt(formData.years_of_experience),
          hourly_rate: parseFloat(formData.hourly_rate),
          is_verified: false,
          online_status: false,
        });

      if (insertError) throw insertError;

      router.replace('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field: keyof FormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayField = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index),
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      const newCategories = isSelected
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      setFormData(prev => ({
        ...prev,
        categories: newCategories,
      }));
      
      return newCategories;
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories(prev => {
      const isSelected = prev.includes(subcategoryId);
      const newSubcategories = isSelected
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId];
      
      setFormData(prev => ({
        ...prev,
        subcategories: newSubcategories,
      }));
      
      return newSubcategories;
    });
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim() || !newCategory.description.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert(newCategory);

      if (error) throw error;

      await refreshCategories();
      setShowCategoryModal(false);
      setNewCategory({
        name: '',
        description: '',
        icon: 'Briefcase',
        image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
      });
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleAddSubcategory = async () => {
    try {
      if (!newSubcategory.name.trim() || !newSubcategory.description.trim() || !newSubcategory.category_id) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('subcategories')
        .insert(newSubcategory);

      if (error) throw error;

      await refreshCategories();
      setShowSubcategoryModal(false);
      setNewSubcategory({
        name: '',
        description: '',
        category_id: ''
      });
    } catch (error) {
      console.error('Error adding subcategory:', error);
      Alert.alert('Error', 'Failed to add subcategory');
    }
  };

  const handleShowSubcategoryModal = () => {
    if (selectedCategories.length === 1) {
      setNewSubcategory(prev => ({ ...prev, category_id: selectedCategories[0] }));
    }
    setShowSubcategoryModal(true);
  };

  if (categoriesLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#f8fafc' }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Become a Mentor</Text>
        <Text style={styles.subtitle}>Share your expertise and help others grow</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Camera size={40} color="#64748b" />
                <Text style={styles.placeholderText}>Add Profile Picture</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <View style={styles.field}>
          <Text style={styles.label}>Professional Bio*</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={formData.bio}
            onChangeText={(value) => setFormData(prev => ({ ...prev, bio: value }))}
            placeholder="Tell us about your professional background and expertise"
          />
        </View>

        {/* Basic Info */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.label}>Years of Experience*</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.years_of_experience}
              onChangeText={(value) => setFormData(prev => ({ ...prev, years_of_experience: value }))}
              placeholder="e.g., 5"
            />
          </View>
          <View style={[styles.field, styles.halfWidth]}>
            <Text style={styles.label}>Hourly Rate (USD)*</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.hourly_rate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, hourly_rate: value }))}
              placeholder="e.g., 50"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.field}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Categories*</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCategoryModal(true)}>
              <Plus size={20} color="#0891b2" />
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category.id) && styles.selectedChip
                ]}
                onPress={() => toggleCategory(category.id)}>
                <Text style={[
                  styles.chipText,
                  selectedCategories.includes(category.id) && styles.selectedChipText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subcategories */}
        {selectedCategories.length > 0 && (
          <View style={styles.field}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Specializations*</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleShowSubcategoryModal}>
                <Plus size={20} color="#0891b2" />
                <Text style={styles.addButtonText}>Add Specialization</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesGrid}>
              {categories
                .filter(cat => selectedCategories.includes(cat.id))
                .map(category => category.subcategories)
                .flat()
                .map(subcategory => (
                  <TouchableOpacity
                    key={subcategory.id}
                    style={[
                      styles.categoryChip,
                      selectedSubcategories.includes(subcategory.id) && styles.selectedChip
                    ]}
                    onPress={() => toggleSubcategory(subcategory.id)}>
                    <Text style={[
                      styles.chipText,
                      selectedSubcategories.includes(subcategory.id) && styles.selectedChipText
                    ]}>
                      {subcategory.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* Professional Details */}
        <View style={styles.field}>
          <Text style={styles.label}>Current Position*</Text>
          <TextInput
            style={styles.input}
            value={formData.position}
            onChangeText={(value) => setFormData(prev => ({ ...prev, position: value }))}
            placeholder="e.g., Senior Software Engineer"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Company*</Text>
          <TextInput
            style={styles.input}
            value={formData.company}
            onChangeText={(value) => setFormData(prev => ({ ...prev, company: value }))}
            placeholder="e.g., Tech Corp"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Industry*</Text>
          <TextInput
            style={styles.input}
            value={formData.industry}
            onChangeText={(value) => setFormData(prev => ({ ...prev, industry: value }))}
            placeholder="e.g., Technology"
          />
        </View>

        {/* Education */}
        <View style={styles.field}>
          <Text style={styles.label}>Education</Text>
          {formData.education.map((edu, index) => (
            <View key={index} style={styles.arrayField}>
              <TextInput
                style={[styles.input, styles.arrayInput]}
                value={edu}
                onChangeText={(value) => handleArrayInput('education', index, value)}
                placeholder="e.g., MS Computer Science, Stanford University"
              />
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeArrayField('education', index)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addArrayField('education')}>
            <Text style={styles.addButtonText}>+ Add Education</Text>
          </TouchableOpacity>
        </View>

        {/* Certifications */}
        <View style={styles.field}>
          <Text style={styles.label}>Certifications</Text>
          {formData.certifications.map((cert, index) => (
            <View key={index} style={styles.arrayField}>
              <TextInput
                style={[styles.input, styles.arrayInput]}
                value={cert}
                onChangeText={(value) => handleArrayInput('certifications', index, value)}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeArrayField('certifications', index)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addArrayField('certifications')}>
            <Text style={styles.addButtonText}>+ Add Certification</Text>
          </TouchableOpacity>
        </View>

        {/* Teaching Style */}
        <View style={styles.field}>
          <Text style={styles.label}>Teaching Style*</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={formData.teaching_style}
            onChangeText={(value) => setFormData(prev => ({ ...prev, teaching_style: value }))}
            placeholder="Describe your approach to mentoring and teaching"
          />
        </View>

        {/* Languages */}
        <View style={styles.field}>
          <Text style={styles.label}>Languages</Text>
          {formData.languages.map((lang, index) => (
            <View key={index} style={styles.arrayField}>
              <TextInput
                style={[styles.input, styles.arrayInput]}
                value={lang}
                onChangeText={(value) => handleArrayInput('languages', index, value)}
                placeholder="e.g., English (Native)"
              />
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeArrayField('languages', index)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addArrayField('languages')}>
            <Text style={styles.addButtonText}>+ Add Language</Text>
          </TouchableOpacity>
        </View>

        {/* Social Links */}
        <View style={styles.field}>
          <Text style={styles.label}>LinkedIn Profile</Text>
          <TextInput
            style={styles.input}
            value={formData.linkedin_url}
            onChangeText={(value) => setFormData(prev => ({ ...prev, linkedin_url: value }))}
            placeholder="https://linkedin.com/in/yourprofile"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Personal Website</Text>
          <TextInput
            style={styles.input}
            value={formData.website_url}
            onChangeText={(value) => setFormData(prev => ({ ...prev, website_url: value }))}
            placeholder="https://yourwebsite.com"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Name*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCategory.name}
                  onChangeText={(value) => setNewCategory(prev => ({ ...prev, name: value }))}
                  placeholder="Enter category name"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Description*</Text>
                <TextInput
                  style={styles.modalTextArea}
                  multiline
                  numberOfLines={4}
                  value={newCategory.description}
                  onChangeText={(value) => setNewCategory(prev => ({ ...prev, description: value }))}
                  placeholder="Enter category description"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!newCategory.name.trim() || !newCategory.description.trim()) && styles.modalSubmitButtonDisabled
                ]}
                onPress={handleAddCategory}
                disabled={!newCategory.name.trim() || !newCategory.description.trim()}>
                <Text style={styles.modalSubmitButtonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        visible={showSubcategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubcategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Specialization</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSubcategoryModal(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Category*</Text>
                <View style={styles.categoriesGrid}>
                  {categories
                    .filter(category => selectedCategories.includes(category.id))
                    .map(category => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          newSubcategory.category_id === category.id && styles.selectedChip
                        ]}
                        onPress={() => setNewSubcategory(prev => ({ ...prev, category_id: category.id }))}>
                        <Text style={[
                          styles.chipText,
                          newSubcategory.category_id === category.id && styles.selectedChipText
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Name*</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSubcategory.name}
                  onChangeText={(value) => setNewSubcategory(prev => ({ ...prev, name: value }))}
                  placeholder="Enter specialization name"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Description*</Text>
                <TextInput
                  style={styles.modalTextArea}
                  multiline
                  numberOfLines={4}
                  value={newSubcategory.description}
                  onChangeText={(value) => setNewSubcategory(prev => ({ ...prev, description: value }))}
                  placeholder="Enter specialization description"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!newSubcategory.name.trim() || !newSubcategory.description.trim() || !newSubcategory.category_id) && styles.modalSubmitButtonDisabled
                ]}
                onPress={handleAddSubcategory}
                disabled={!newSubcategory.name.trim() || !newSubcategory.description.trim() || !newSubcategory.category_id}>
                <Text style={styles.modalSubmitButtonText}>Add Specialization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    margin: 20,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
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
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  selectedChip: {
    backgroundColor: '#0891b2',
  },
  chipText: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedChipText: {
    color: '#fff',
  },
  arrayField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrayInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 14,
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
  submitButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    gap: 16,
  },
  modalField: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalTextArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalSubmitButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitButtonDisabled: {
    opacity: 0.7,
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});