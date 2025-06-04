import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, Video, MessageSquare, Phone, Download, Share as ShareIcon, X } from 'lucide-react-native';

const SESSION_TYPE_ICONS = {
  video: Video,
  chat: MessageSquare,
  call: Phone
};

export default function PaymentReceiptScreen() {
  const { 
    appointmentId,
    mentorName,
    mentorId,
    date, 
    time, 
    type = 'video',
    rate,
    paymentMethod,
    description 
  } = useLocalSearchParams();
  
  const router = useRouter();
  const TypeIcon = SESSION_TYPE_ICONS[type as keyof typeof SESSION_TYPE_ICONS] || Video;
  const sessionDate = new Date(date as string);
  const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;
  const paymentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Receipt for mentoring session with ${mentorName}\n\nDate: ${sessionDate.toLocaleDateString()}\nTime: ${time}\nAmount: $${rate}\n\nReceipt Number: ${receiptNumber}`,
        title: 'Session Receipt'
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  const handleViewAppointments = () => {
    router.replace('/appointments');
  };

  const handleCancel = () => {
    router.replace(`/mentor/${mentorId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>Your session has been booked</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>Payment Receipt</Text>
          <Text style={styles.receiptNumber}>#{receiptNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailText}>{paymentDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailText}>
              {paymentMethod?.charAt(0).toUpperCase() + paymentMethod?.slice(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Paid</Text>
            </View>
          </View>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mentor</Text>
          <Text style={styles.mentorName}>{mentorName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discussion Topic</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Session Rate</Text>
              <Text style={styles.paymentAmount}>${rate}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Platform Fee</Text>
              <Text style={styles.paymentAmount}>$0</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>${rate}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <ShareIcon size={20} color="#0891b2" />
          <Text style={styles.shareButtonText}>Share Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewButton} onPress={handleViewAppointments}>
          <Text style={styles.viewButtonText}>View Appointments</Text>
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
    alignItems: 'center',
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
  receiptCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  receiptNumber: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 120,
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  mentorName: {
    fontSize: 16,
    color: '#334155',
  },
  description: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  paymentDetails: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentAmount: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
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
  actions: {
    padding: 16,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  shareButtonText: {
    color: '#0891b2',
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
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