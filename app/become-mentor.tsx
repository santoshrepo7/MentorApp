import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useCategories } from '@/providers/CategoriesProvider';
import { Check, Camera, Plus, X } from 'lucide-react-native';
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

  // Previous code remains the same...

  const handleShowSubcategoryModal = () => {
    if (selectedCategories.length === 1) {
      setNewSubcategory(prev => ({ ...prev, category_id: selectedCategories[0] }));
    }
    setShowSubcategoryModal(true);
  };

  // Rest of the code remains the same until the JSX part where the button is updated

  return (
    <ScrollView style={styles.container}>
      {/* Previous JSX remains the same */}
      
      {/* Update the Add Specialization button */}
      <TouchableOpacity
        style={styles.addCategoryButton}
        onPress={handleShowSubcategoryModal}>
        <Plus size={20} color="#0891b2" />
        <Text style={styles.addCategoryText}>Add Specialization</Text>
      </TouchableOpacity>

      {/* In the subcategory modal */}
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

              {/* Rest of the modal content remains the same */}
            </View>
          </View>
        </View>
      </Modal>

      {/* Rest of the JSX remains the same */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Styles remain unchanged
});