import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Calendar, Clock, Video, MessageSquare, Phone, AlertCircle as AlertCircle, X } from 'lucide-react-native';

const SESSION_TYPES = [
  { id: 'video', icon: Video, label: 'Video Call' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'call', icon: Phone, label: 'Phone Call' }
];

// Generate time slots from 6 AM to 10 PM
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6; // Start from 6 AM
  return `${hour.toString().padStart(2, '0')}:00`;
});

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface AvailabilityMap {
  [date: string]: TimeSlot[];
}

export default function BookSessionScreen() {
  const { mentorId, rate } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('video');
  const [problemDescription, setProblemDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailabilityMap>({});
  const [hasCustomAvailability, setHasCustomAvailability] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    fetchAvailability();
  }, [mentorId]);

  const fetchAvailability = async () => {
    try {
      const { data: availabilityData, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_available', true);

      if (error) throw error;

      // Generate next 30 days
      const nextThirtyDays = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
      });

      const slots: AvailabilityMap = {};

      if (availabilityData && availabilityData.length > 0) {
        setHasCustomAvailability(true);
        nextThirtyDays.forEach(date => {
          const dayOfWeek = date.getDay();
          const daySlots = availabilityData
            .filter(slot => slot.day_of_week === dayOfWeek)
            .map(slot => ({
              start_time: slot.start_time,
              end_time: slot.end_time
            }));

          if (daySlots.length > 0) {
            slots[date.toISOString().split('T')[0]] = daySlots;
          }
        });
      } else {
        setHasCustomAvailability(false);
        nextThirtyDays.forEach(date => {
          slots[date.toISOString().split('T')[0]] = TIME_SLOTS.map(time => ({
            start_time: time,
            end_time: time
          }));
        });
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      Alert.alert('Error', 'Failed to load mentor\'s availability');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = (date: Date): string[] => {
    const dateStr = date.toISOString().split('T')[0];
    const slots = availableSlots[dateStr] || [];
    
    if (!hasCustomAvailability) {
      return TIME_SLOTS;
    }
    
    return slots.reduce((times: string[], slot) => {
      const start = new Date(`2000-01-01T${slot.start_time}`);
      const end = new Date(`2000-01-01T${slot.end_time}`);
      
      while (start < end) {
        times.push(start.toTimeString().slice(0, 5));
        start.setHours(start.getHours() + 1);
      }
      
      return times;
    }, []);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !session?.user || !problemDescription.trim()) {
      return;
    }

    router.push({
      pathname: '/book-session/confirmation',
      params: {
        mentorId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        type: selectedType,
        rate,
        description: problemDescription.trim()
      }
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const availableDates = Object.keys(availableSlots).map(date => new Date(date));
  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Session</Text>
        <Text style={styles.subtitle}>Select your preferred date and time</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What would you like to discuss?</Text>
        <View style={styles.descriptionContainer}>
          <TextInput
            style={styles.descriptionInput}
            multiline
            numberOfLines={4}
            placeholder="Describe your problem or what you'd like to learn..."
            value={problemDescription}
            onChangeText={setProblemDescription}
            textAlignVertical="top"
          />
          {!problemDescription.trim() && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>Please provide a brief description of your needs</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Type</Text>
        <View style={styles.typeContainer}>
          {SESSION_TYPES.map(({ id, icon: Icon, label }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.typeOption,
                selectedType === id && styles.selectedType
              ]}
              onPress={() => setSelectedType(id)}>
              <Icon
                size={24}
                color={selectedType === id ? '#0891b2' : '#64748b'}
              />
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === id && styles.selectedTypeLabel
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContainer}>
          {availableDates.map((date, index) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateOption,
                  isSelected && styles.selectedDate,
                  isToday && styles.todayDate
                ]}
                onPress={() => setSelectedDate(date)}>
                <Text
                  style={[
                    styles.dateDay,
                    isSelected && styles.selectedDateText,
                    isToday && styles.todayDateText
                  ]}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    isSelected && styles.selectedDateText,
                    isToday && styles.todayDateText
                  ]}>
                  {date.getDate()}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    isSelected && styles.selectedDateText,
                    isToday && styles.todayDateText
                  ]}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        {!hasCustomAvailability && (
          <Text style={styles.defaultAvailabilityNote}>
            This mentor is using default availability. They may update their schedule later.
          </Text>
        )}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeScrollContainer}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeOption,
                selectedTime === time && styles.selectedTime
              ]}
              onPress={() => setSelectedTime(time)}>
              <Clock
                size={16}
                color={selectedTime === time ? '#0891b2' : '#64748b'}
              />
              <Text
                style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedTimeText
                ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
          {timeSlots.length === 0 && (
            <Text style={styles.noSlotsText}>
              No available time slots for this date
            </Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>60 minutes</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate</Text>
            <Text style={styles.summaryValue}>${rate}/hr</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryTotal}>${rate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || !problemDescription.trim() || loading) && styles.bookButtonDisabled
          ]}
          onPress={handleBooking}
          disabled={!selectedDate || !selectedTime || !problemDescription.trim() || loading}>
          <Text style={styles.bookButtonText}>
            {loading ? 'Loading...' : 'Continue to Payment'}
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
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    color: '#0f172a',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#92400e',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  selectedType: {
    borderColor: '#0891b2',
    backgroundColor: '#f0f9ff',
  },
  typeLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
  selectedTypeLabel: {
    color: '#0891b2',
  },
  dateScrollContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 12,
  },
  dateOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
  },
  selectedDate: {
    borderColor: '#0891b2',
    backgroundColor: '#0891b2',
  },
  todayDate: {
    borderColor: '#0891b2',
    borderWidth: 2,
  },
  dateDay: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayDateText: {
    color: '#0891b2',
  },
  timeScrollContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 100,
    gap: 8,
  },
  selectedTime: {
    borderColor: '#0891b2',
    backgroundColor: '#f0f9ff',
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedTimeText: {
    color: '#0891b2',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  defaultAvailabilityNote: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#0f172a',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  bookButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
});