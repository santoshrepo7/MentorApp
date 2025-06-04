import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Clock, Plus, Trash2, Copy, Calendar } from 'lucide-react-native';

interface TimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export default function AvailabilityScreen() {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { session } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    fetchAvailability();
  }, []);

  const getNextSevenDays = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  async function fetchAvailability() {
    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', session?.user.id)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  }

  const addTimeSlot = async (date: Date) => {
    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .insert({
          mentor_id: session?.user.id,
          day_of_week: date.getDay(),
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        })
        .select()
        .single();

      if (error) throw error;
      setAvailability(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding time slot:', error);
      Alert.alert('Error', 'Failed to add time slot');
    }
  };

  const removeTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAvailability(prev => prev.filter(slot => slot.id !== id));
    } catch (error) {
      console.error('Error removing time slot:', error);
      Alert.alert('Error', 'Failed to remove time slot');
    }
  };

  const updateTimeSlot = async (id: string, updates: Partial<TimeSlot>) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setAvailability(prev =>
        prev.map(slot =>
          slot.id === id ? { ...slot, ...updates } : slot
        )
      );
    } catch (error) {
      console.error('Error updating time slot:', error);
      Alert.alert('Error', 'Failed to update time slot');
    }
  };

  const copyTimeSlots = async (fromDate: Date, toDate: Date) => {
    try {
      const fromDaySlots = availability.filter(
        slot => slot.day_of_week === fromDate.getDay()
      );

      const newSlots = fromDaySlots.map(slot => ({
        mentor_id: session?.user.id,
        day_of_week: toDate.getDay(),
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: true
      }));

      if (newSlots.length > 0) {
        const { data, error } = await supabase
          .from('mentor_availability')
          .insert(newSlots)
          .select();

        if (error) throw error;
        setAvailability(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Error copying time slots:', error);
      Alert.alert('Error', 'Failed to copy time slots');
    }
  };

  const copyToAllDays = async (fromDate: Date) => {
    try {
      const nextDays = getNextSevenDays().filter(
        date => date.getDay() !== fromDate.getDay()
      );

      for (const date of nextDays) {
        await copyTimeSlots(fromDate, date);
      }

      Alert.alert('Success', 'Time slots copied to all days');
    } catch (error) {
      console.error('Error copying to all days:', error);
      Alert.alert('Error', 'Failed to copy time slots to all days');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading availability settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Availability Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>
          Set your preferred working hours
        </Text>
      </View>

      {/* Date Selection */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.dateSelector, { backgroundColor: theme.colors.card }]}>
        {getNextSevenDays().map((date) => (
          <TouchableOpacity
            key={date.toISOString()}
            style={[
              styles.dateButton,
              selectedDate.toDateString() === date.toDateString() && styles.selectedDate,
              { backgroundColor: theme.colors.background }
            ]}
            onPress={() => setSelectedDate(date)}>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.daySection, { backgroundColor: theme.colors.card }]}>
        <View style={styles.daySectionHeader}>
          <Text style={[styles.dayTitle, { color: theme.colors.text }]}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric' 
            })}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => copyToAllDays(selectedDate)}>
              <Copy size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Copy to All Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => addTimeSlot(selectedDate)}>
              <Plus size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Add Time Slot
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {availability
          .filter(slot => slot.day_of_week === selectedDate.getDay())
          .map(slot => (
            <View key={slot.id} style={styles.timeSlot}>
              <View style={styles.timeInputs}>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => {
                    Alert.alert(
                      'Select Start Time',
                      '',
                      TIME_SLOTS.map(time => ({
                        text: time,
                        onPress: () => updateTimeSlot(slot.id, { start_time: time })
                      }))
                    );
                  }}>
                  <Clock size={16} color={theme.colors.subtitle} />
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {slot.start_time}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.toText, { color: theme.colors.subtitle }]}>to</Text>

                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => {
                    Alert.alert(
                      'Select End Time',
                      '',
                      TIME_SLOTS.map(time => ({
                        text: time,
                        onPress: () => updateTimeSlot(slot.id, { end_time: time })
                      }))
                    );
                  }}>
                  <Clock size={16} color={theme.colors.subtitle} />
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {slot.end_time}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTimeSlot(slot.id)}>
                  <Trash2 size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {availability.filter(slot => slot.day_of_week === selectedDate.getDay()).length === 0 && (
          <Text style={[styles.noSlotsText, { color: theme.colors.subtitle }]}>
            No time slots set for this day
          </Text>
        )}
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  dateSelector: {
    padding: 16,
    marginBottom: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedDate: {
    backgroundColor: '#0891b2',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  daySection: {
    marginTop: 8,
    padding: 16,
  },
  daySectionHeader: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noSlotsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  timeSlot: {
    marginBottom: 12,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
  },
  toText: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
});