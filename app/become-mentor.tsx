import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  category_id: string;
}

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

export default function BecomeMentorScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState({ name: '', categoryId: '' });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();
  const { session } = useAuth();

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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          id: newCategory.toLowerCase().replace(/\s+/g, '-'),
          name: newCategory,
          icon: 'Briefcase', // Default icon
          image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg' // Default image
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewCategory('');
      setShowNewCategoryInput(false);
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) return;

    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert({
          id: `${newSubcategory.categoryId}-${newSubcategory.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: newSubcategory.name,
          category_id: newSubcategory.categoryId
        })
        .select()
        .single();

      if (error) throw error;

      setSubcategories([...subcategories, data]);
      setNewSubcategory({ name: '', categoryId: '' });
      setShowNewSubcategoryInput(false);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      Alert.alert('Error', 'Failed to add subcategory');
    }
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

  return (
    <ScrollView style={styles.container}>
      {/* Categories Section */}
      <View style={styles.field}>
        <Text style={styles.label}>Categories*</Text>
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
        
        {showNewCategoryInput ? (
          <View style={styles.newItemContainer}>
            <TextInput
              style={styles.newItemInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Enter new category name"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddCategory}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowNewCategoryInput(false)}>
              <X size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setShowNewCategoryInput(true)}>
            <Plus size={20} color="#0891b2" />
            <Text style={styles.addNewButtonText}>Add New Category</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Subcategories Section */}
      {selectedCategories.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.label}>Specializations*</Text>
          <View style={styles.categoriesGrid}>
            {subcategories
              .filter(sub => selectedCategories.includes(sub.category_id))
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

          {showNewSubcategoryInput ? (
            <View style={styles.newItemContainer}>
              <View style={styles.newSubcategoryInputs}>
                <TextInput
                  style={[styles.newItemInput, { flex: 2 }]}
                  value={newSubcategory.name}
                  onChangeText={(text) => setNewSubcategory(prev => ({ ...prev, name: text }))}
                  placeholder="Enter new specialization name"
                />
                <View style={[styles.newItemInput, { flex: 1 }]}>
                  <Picker
                    selectedValue={newSubcategory.categoryId}
                    onValueChange={(itemValue) => 
                      setNewSubcategory(prev => ({ ...prev, categoryId: itemValue }))
                    }>
                    <Picker.Item label="Select Category" value="" />
                    {selectedCategories.map(catId => {
                      const category = categories.find(c => c.id === catId);
                      return category ? (
                        <Picker.Item 
                          key={category.id} 
                          label={category.name} 
                          value={category.id} 
                        />
                      ) : null;
                    })}
                  </Picker>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSubcategory}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNewSubcategoryInput(false)}>
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => setShowNewSubcategoryInput(true)}>
              <Plus size={20} color="#0891b2" />
              <Text style={styles.addNewButtonText}>Add New Specialization</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  newItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  newItemInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  newSubcategoryInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0891b2',
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 8,
  },
  addButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#0891b2',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '500',
  },
});