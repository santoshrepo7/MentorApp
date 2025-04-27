import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Star, MapPin, Clock, Calendar, ChevronRight, Globe as Globe2, Mail, Languages, MessageSquare, Phone } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface MentorProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  position: string;
  company: string;
  bio: string;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  total_students: number;
  expertise: string[];
  education: string[];
  certifications: string[];
  languages: string[];
  achievements: string[];
  teaching_style: string;
  time_zone: string;
  linkedin_url: string;
  website_url: string;
  availability: any;
  online_status: boolean;
  last_seen: string;
}

export default function MentorProfileScreen() {
  const { id } = useLocalSearchParams();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { requireAuth, session } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    fetchMentorProfile();

    const subscription = supabase
      .channel('professionals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'professionals',
        filter: `id=eq.${id}`,
      }, () => {
        fetchMentorProfile();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  async function fetchMentorProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setMentor({
        ...data,
        full_name: data.profiles.full_name,
        avatar_url: data.profiles.avatar_url
      });
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleBookSession = async () => {
    const isAuthenticated = await requireAuth();
    if (isAuthenticated && mentor) {
      router.push({
        pathname: '/book-session',
        params: { 
          mentorId: mentor.id,
          mentorName: mentor.full_name,
          rate: mentor.hourly_rate
        }
      });
    }
  };

  const handleSendMessage = async () => {
    if (!session?.user?.id || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          receiver_id: id,
          content: message.trim()
        });

      if (error) throw error;

      setMessage('');
      setShowChatModal(false);
      Alert.alert('Success', 'Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleCall = () => {
    Alert.alert(
      'Start Call',
      'Would you like to start a call with this mentor?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call',
          onPress: () => Alert.alert('Coming Soon', 'Call feature will be available soon!')
        }
      ]
    );
  };

  const handleEmail = () => {
    Alert.alert(
      'Send Email',
      'Would you like to send an email to this mentor?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email',
          onPress: () => Alert.alert('Coming Soon', 'Email feature will be available soon!')
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

  if (!mentor) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Mentor not found</Text>
      </View>
    );
  }

  const getLastSeenText = () => {
    if (mentor.online_status) return 'Online';
    
    const lastSeen = new Date(mentor.last_seen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Last seen ${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `Last seen ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `Last seen ${lastSeen.toLocaleDateString()}`;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: theme.colors.card }]}>
        <Image
          source={{ uri: mentor.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.colors.text }]}>{mentor.full_name}</Text>
        <Text style={[styles.position, { color: theme.colors.subtitle }]}>
          {mentor.position} at {mentor.company}
        </Text>
        

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{mentor.rating.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.subtitle }]}>Rating</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{mentor.total_sessions}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.subtitle }]}>Sessions</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{mentor.total_students}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.subtitle }]}>Students</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      {/*
      <View style={[styles.quickActions, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.background }]} 
            onPress={() => setShowChatModal(true)}>
            <MessageSquare size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.background }]} 
            onPress={handleCall}>
            <Phone size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.background }]} 
            onPress={handleEmail}>
            <Mail size={24} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
      */}
      <TouchableOpacity 
        style={[styles.bookButton, { backgroundColor: theme.colors.primary }]} 
        onPress={handleBookSession}>
        <Text style={styles.bookButtonText}>Book Session (${mentor.hourly_rate}/hr)</Text>
      </TouchableOpacity>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
        <Text style={[styles.bio, { color: theme.colors.text }]}>{mentor.bio}</Text>
      </View>

      {/* Expertise Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expertise</Text>
        <View style={styles.tagsContainer}>
          {mentor.expertise.map((skill, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Education & Certifications */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Education & Certifications</Text>
        {mentor.education.map((edu, index) => (
          <Text key={`edu-${index}`} style={[styles.listItem, { color: theme.colors.text }]}>• {edu}</Text>
        ))}
        {mentor.certifications.map((cert, index) => (
          <Text key={`cert-${index}`} style={[styles.listItem, { color: theme.colors.text }]}>• {cert}</Text>
        ))}
      </View>

      {/* Teaching Style */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Teaching Approach</Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>{mentor.teaching_style}</Text>
      </View>

      {/* Languages */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Languages</Text>
        <View style={styles.infoRow}>
          <Languages size={20} color={theme.colors.subtitle} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>{mentor.languages.join(', ')}</Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
        {mentor.achievements.map((achievement, index) => (
          <Text key={index} style={[styles.listItem, { color: theme.colors.text }]}>• {achievement}</Text>
        ))}
      </View>

      {/* Additional Info */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Additional Information</Text>
        <View style={styles.infoRow}>
          <MapPin size={20} color={theme.colors.subtitle} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>Time Zone: {mentor.time_zone}</Text>
        </View>
        {mentor.website_url && (
          <View style={styles.infoRow}>
            <Globe2 size={20} color={theme.colors.subtitle} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{mentor.website_url}</Text>
          </View>
        )}
      </View>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Send Message</Text>
            <TextInput
              style={[styles.messageInput, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              multiline
              numberOfLines={4}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.placeholder}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setShowChatModal(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.colors.subtitle }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  hero: {
    flex: 3,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatar: {
    width: '100%',
    height: 256,
    marginTop: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    marginBottom: 12,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  onlineDot: {
    backgroundColor: '#059669',
  },
  offlineDot: {
    backgroundColor: '#94a3b8',
  },
  statusText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 10,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 10,
  },
  quickActions: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#0891b2',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
