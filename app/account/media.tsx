import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Camera, Trash2, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface MediaItem {
  id: string;
  media_url: string;
  caption: string;
}

export default function MediaScreen() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { session } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_media')
        .select('*')
        .eq('mentor_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      Alert.alert('Error', 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const file = result.assets[0];

        // Upload to Supabase Storage
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${session?.user.id}/media/${fileName}`;

        // Convert uri to blob
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // Upload image
        const { error: uploadError } = await supabase.storage
          .from('mentor_media')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('mentor_media')
          .getPublicUrl(filePath);

        // Add to mentor_media table
        const { error: dbError } = await supabase
          .from('mentor_media')
          .insert({
            mentor_id: session?.user.id,
            media_url: publicUrl,
          });

        if (dbError) throw dbError;

        // Refresh media list
        fetchMedia();
        Alert.alert('Success', 'Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string, url: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage
              const filePath = url.split('/').pop();
              if (filePath) {
                await supabase.storage
                  .from('mentor_media')
                  .remove([`${session?.user.id}/media/${filePath}`]);
              }

              // Delete from database
              const { error } = await supabase
                .from('mentor_media')
                .delete()
                .eq('id', id);

              if (error) throw error;

              // Update local state
              setMedia(prev => prev.filter(item => item.id !== id));
              Alert.alert('Success', 'Image deleted successfully');
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Failed to delete image');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Media Gallery</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>
          Add photos to showcase your work
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddImage}
        disabled={uploading}>
        <Plus size={24} color="#fff" />
        <Text style={styles.addButtonText}>
          {uploading ? 'Uploading...' : 'Add Image'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={media}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={[styles.imageContainer, { backgroundColor: theme.colors.card }]}>
            <Image source={{ uri: item.media_url }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteImage(item.id, item.media_url)}>
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.mediaGrid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.subtitle }]}>
              {loading ? 'Loading media...' : 'No images added yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaGrid: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});