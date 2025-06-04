import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Calendar, Clock, Video, MessageSquare, Phone, AlertCircle as CircleAlert, CreditCard as Edit } from 'lucide-react-native';

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: 'video' | 'chat' | 'call';
  status: 'pending' | 'confirmed' | 'cancelled' | 'postponed';
  payment_status: string;
  problem_description: string;
  mentor_id: string;
  user_id: string;
  mentor: {
    id: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  };
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { session } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    }
  }, [session]);

  /* TODO : Subscribe to changes in appointments table */
  // useEffect(() => {
  //   const subscription = supabase
  //   .from('appointments')
  //  .on('*', payload => {
  //    console.log('Change received!', payload);
  //    fetchAppointments();
  //
  async function fetchAppointments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          mentor:mentor_id(
            id,
            profiles (
              full_name,
              avatar_url
            )
          ),
          user:user_id(
            full_name,
            avatar_url
          )
        `)
        .or(`mentor_id.eq.${session?.user.id},user_id.eq.${session?.user.id}`)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
      console.log('Appointments fetched:', data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (appointment: Appointment) => {
    if (appointment.status === 'cancelled') {
      Alert.alert('Error', 'Cannot edit cancelled appointments');
      return;
    }

    router.push({
      pathname: '/appointments/edit',
      params: {
        id: appointment.id,
        currentDate: appointment.date,
        currentTime: appointment.time,
        currentType: appointment.type,
        currentDescription: appointment.problem_description
      }
    });
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .eq('mentor_id', session?.user.id);

      if (error) throw error;
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus as Appointment['status'] }
            : apt
        )
      );

      Alert.alert(
        'Success',
        `Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'Failed to update appointment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleChat = (appointment: Appointment) => {
    router.push({
      pathname: '/chat',
      params: {
        appointmentId: appointment.id,
        otherPartyId: appointment.mentor_id === session?.user.id ? appointment.user_id : appointment.mentor_id
      }
    });
  };

  const confirmAppointment = (appointmentId: string) => {
    Alert.alert(
      'Confirm Appointment',
      'Are you sure you want to confirm this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm',
          onPress: () => handleStatusUpdate(appointmentId, 'confirmed')
        }
      ]
    );
  };

  const cancelAppointment = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => handleStatusUpdate(appointmentId, 'cancelled')
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      case 'postponed':
        return '#d97706';
      default:
        return theme.colors.primary;
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'chat':
        return MessageSquare;
      case 'call':
        return Phone;
      default:
        return Video;
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const isMentor = item.mentor_id === session?.user.id;
    const otherParty = isMentor ? item.user : item.mentor.profiles;
    const SessionIcon = getSessionIcon(item.type);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={[styles.appointmentCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.appointmentHeader}>
          <View style={styles.sessionInfo}>
            <SessionIcon size={20} color={theme.colors.subtitle} />
            <Text style={[styles.sessionType, { color: theme.colors.text }]}>
              {item.type} Session
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.participantText, { color: theme.colors.text }]}>
              {isMentor ? 'Student' : 'Mentor'}: {otherParty.full_name}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={16} color={theme.colors.subtitle} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={theme.colors.subtitle} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailText, { color: theme.colors.text }]} numberOfLines={2}>
              {item.problem_description}
            </Text>
          </View>
        </View>

        <View style={[styles.actionButtons, { borderTopColor: theme.colors.border }]}>
          {item.status === 'pending' && isMentor && !updating && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                onPress={() => confirmAppointment(item.id)}>
                <Text style={styles.actionButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'transparent', borderColor: theme.colors.error, borderWidth: 1 }]}
                onPress={() => cancelAppointment(item.id)}>
                <Text style={{ color: theme.colors.error, fontSize: 16, fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
          {!isMentor && item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
              onPress={() => cancelAppointment(item.id)}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleChat(item)}>
            <MessageSquare size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {updating && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.subtitle }]}>
              Updating status...
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Appointments</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>Manage your upcoming sessions</Text>
      </View>
      <ScrollView>
        <View style={{ padding: 16 }}>

      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.subtitle }]}>
              {loading ? 'Loading appointments...' : 'No appointments found'}
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchAppointments}
      />
        </View>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  appointmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  participantText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
});