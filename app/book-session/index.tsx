import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Calendar, Clock, Video, MessageSquare, Phone, CircleAlert as AlertCircle } from 'lucide-react-native';

const SESSION_TYPES = [
  { id: 'video', icon: Video, label: 'Video Call' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'call', icon: Phone, label: 'Phone Call' }
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function BookSessionScreen() {
  const { mentorId, rate } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('video');
  const [problemDescription, setProblemDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session } = useAuth();

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Session</Text>
        <Text style={styles.subtitle}>Select your preferred date and time</Text>
      </View>

      {/* Problem Description */}
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
              <AlertCircle size={16} color="#f59e0b" />
              <Text style={styles.warningText}>Please provide a brief description of your needs</Text>
            </View>
          )}
        </View>
      </View>

      {/* Session Type Selection */}
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

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.dateContainer}>
          {[...Array(7)].map((_, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);
            const isSelected = selectedDate.toDateString() === date.toDateString();

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateOption,
                  isSelected && styles.selectedDate
                ]}
                onPress={() => setSelectedDate(date)}>
                <Text
                  style={[
                    styles.dateDay,
                    isSelected && styles.selectedDateText
                  ]}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text
                  style={[
                    styles.dateNum,
                    isSelected && styles.selectedDateText
                  ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeContainer}>
          {TIME_SLOTS.map((time) => (
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
        </View>
      </View>

      {/* Summary */}
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

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || !problemDescription.trim() || loading) && styles.bookButtonDisabled
          ]}
          onPress={handleBooking}
          disabled={!selectedDate || !selectedTime || !problemDescription.trim() || loading}>
          <Text style={styles.bookButtonText}>
            {loading ? 'Booking...' : 'Continue to Payment'}
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedDate: {
    borderColor: '#0891b2',
    backgroundColor: '#0891b2',
  },
  dateDay: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  selectedDateText: {
    color: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: '45%',
  },
  selectedTime: {
    borderColor: '#0891b2',
    backgroundColor: '#f0f9ff',
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  selectedTimeText: {
    color: '#0891b2',
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
});