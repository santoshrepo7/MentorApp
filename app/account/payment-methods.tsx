import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CreditCard, Plus, Trash2 } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2024,
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '5555',
    expMonth: 3,
    expYear: 2025,
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading payment methods
    setTimeout(() => {
      setPaymentMethods(MOCK_PAYMENT_METHODS);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddCard = () => {
    Alert.alert(
      'Add Payment Method',
      'This feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleRemoveCard = (id: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>Manage your payment options</Text>
      </View>

      <View style={styles.content}>
        {paymentMethods.map(method => (
          <View key={method.id} style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <CreditCard size={24} color="#0f172a" />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardType}>
                    {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                  </Text>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {method.last4}
                  </Text>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.expiryDate}>
                Expires {method.expMonth}/{method.expYear}
              </Text>
            </View>
            <View style={styles.cardActions}>
              {!method.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(method.id)}>
                  <Text style={styles.actionButtonText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => handleRemoveCard(method.id)}>
                <Trash2 size={20} color="#ef4444" />
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
          <Plus size={24} color="#0891b2" />
          <Text style={styles.addCardText}>Add New Card</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    padding: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#64748b',
  },
  defaultBadge: {
    backgroundColor: '#0891b2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  expiryDate: {
    fontSize: 14,
    color: '#64748b',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0891b2',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  addCardText: {
    color: '#0891b2',
    fontSize: 16,
    fontWeight: '600',
  },
});