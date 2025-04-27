import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Video, MessageSquare, Phone } from 'lucide-react-native';

const SESSION_TYPES = [
  { id: 'video', icon: Video, label: 'Video Call' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'call', icon: Phone, label: 'Phone Call' }
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function EditAppointmentScreen() {
  const { id, currentDate, currentTime, currentType, currentDescription } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date(currentDate as string));
  const [selectedTime, setSelectedTime] = useState(currentTime as string);
  const [selectedType, setSelectedType] = useState(currentType as string);
  const [problemDescription, setProblemDescription] = useState((currentDescription as string) || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Update appointment
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          type: selectedType,
          problem_description: problemDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Send notification to mentor
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          appointment_id: id,
          type: 'appointment_update',
          title: 'Appointment Updated',
          message: `An appointment has been modified for ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
          status: 'unread'
        });

      if (notificationError) throw notificationError;

      Alert.alert(
        'Success',
        'Appointment updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Appointment</Text>
        <Text style={styles.subtitle}>Update your session details</Text>
      </View>

      {/* Problem Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What would you like to discuss?</Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={4}
          placeholder="Describe your problem or what you'd like to learn..."
          value={problemDescription}
          onChangeText={setProblemDescription}
          textAlignVertical="top"
        />
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

      {/* Update Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.updateButton,
            (!selectedDate || !selectedTime || !problemDescription.trim() || loading) && styles.updateButtonDisabled
          ]}
          onPress={handleUpdate}
          disabled={!selectedDate || !selectedTime || !problemDescription.trim() || loading}>
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : 'Update Appointment'}
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
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  updateButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
