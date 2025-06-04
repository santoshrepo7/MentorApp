import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Calendar, Clock, Video, MessageSquare, Phone, CreditCard, QrCode, Wallet } from 'lucide-react-native';

const SESSION_TYPE_ICONS = {
  video: Video,
  chat: MessageSquare,
  call: Phone
};

const PAYMENT_METHODS = [
  { id: 'card', icon: CreditCard, label: 'Credit Card' },
  { id: 'qr', icon: QrCode, label: 'QR Code' },
  { id: 'paypal', icon: Wallet, label: 'PayPal' }
];

export default function BookingConfirmationScreen() {
  const { 
    mentorId, 
    mentorName,
    date, 
    time, 
    type = 'video',
    rate,
    description 
  } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const router = useRouter();
  const { session } = useAuth();
  const TypeIcon = SESSION_TYPE_ICONS[type as keyof typeof SESSION_TYPE_ICONS] || Video;
  const sessionDate = new Date(date as string);

  const handlePayment = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to book a session');
      return;
    }

    try {
      setLoading(true);

      // Create payment intent
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: Number(rate) * 100, // Convert to cents
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          mentor_id: mentorId,
          user_id: session.user.id,
          date: date,
          time: time,
          type: type,
          problem_description: description,
          payment_status: 'completed', // This should be 'pending' in production
          payment_amount: rate,
          payment_method: selectedPaymentMethod,
          payment_intent_id: clientSecret,
          status: 'pending'
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Create notification for mentor
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          appointment_id: appointment.id,
          type: 'appointment_update',
          title: 'New Appointment Request',
          message: `You have a new appointment request for ${new Date(date as string).toLocaleDateString()} at ${time}`,
          status: 'unread'
        });

      if (notificationError) throw notificationError;

      // Navigate to receipt screen
      router.replace({
        pathname: '/book-session/receipt',
        params: {
          appointmentId: appointment.id,
          mentorName,
          date,
          time,
          type,
          rate,
          paymentMethod: selectedPaymentMethod,
          description
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Booking</Text>
        <Text style={styles.subtitle}>Review and complete your booking</Text>
      </View>

      {/* Session Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <View style={styles.detailRow}>
          <Calendar size={20} color="#64748b" />
          <Text style={styles.detailText}>
            {sessionDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={20} color="#64748b" />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        <View style={styles.detailRow}>
          <TypeIcon size={20} color="#64748b" />
          <Text style={styles.detailText}>
            {type.charAt(0).toUpperCase() + type.slice(1)} Session
          </Text>
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethods}>
          {PAYMENT_METHODS.map(({ id, icon: Icon, label }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === id && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(id)}>
              <Icon
                size={24}
                color={selectedPaymentMethod === id ? '#0891b2' : '#64748b'}
              />
              <Text
                style={[
                  styles.paymentMethodLabel,
                  selectedPaymentMethod === id && styles.selectedPaymentMethodLabel
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Session Rate</Text>
            <Text style={styles.summaryValue}>${rate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
            <Text style={styles.summaryValue}>$0</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${rate}</Text>
          </View>
        </View>
      </View>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}>
          <Text style={styles.payButtonText}>
            {loading ? 'Processing...' : `Pay $${rate}`}
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    borderColor: '#0891b2',
    backgroundColor: '#f0f9ff',
  },
  paymentMethodLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
  selectedPaymentMethodLabel: {
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
    color: '#334155',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalAmount: {
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
  payButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});