import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Lock, AlertTriangle } from 'lucide-react-native';

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: supabase.auth.getUser()?.data.user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Delete all user data
              const userId = supabase.auth.getUser()?.data.user?.id;
              if (!userId) throw new Error('User not found');

              // Delete appointments
              await supabase
                .from('appointments')
                .delete()
                .or(`user_id.eq.${userId},mentor_id.eq.${userId}`);

              // Delete messages
              await supabase
                .from('messages')
                .delete()
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

              // Delete reviews
              await supabase
                .from('reviews')
                .delete()
                .or(`user_id.eq.${userId},mentor_id.eq.${userId}`);

              // Delete professional profile if exists
              await supabase
                .from('professionals')
                .delete()
                .eq('id', userId);

              // Delete user profile
              await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

              // Delete auth user
              const { error: deleteError } = await supabase.auth.admin.deleteUser(
                userId
              );

              if (deleteError) throw deleteError;

              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Security Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>
          Manage your account security
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Change Password</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Current Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
            <Lock size={20} color={theme.colors.subtitle} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>New Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
            <Lock size={20} color={theme.colors.subtitle} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Confirm New Password</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background }]}>
            <Lock size={20} color={theme.colors.subtitle} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handlePasswordChange}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}>
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Delete Account</Text>
        <Text style={[styles.warningText, { color: theme.colors.subtitle }]}>
          Deleting your account will permanently remove all your data and cannot be undone.
        </Text>
        
        <View style={styles.warningBox}>
          <AlertTriangle size={20} color={theme.colors.error} />
          <Text style={[styles.warningBoxText, { color: theme.colors.error }]}>
            This action is permanent and cannot be reversed
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: theme.colors.error }]}
          onPress={handleDeleteAccount}
          disabled={loading}>
          <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>
            {loading ? 'Deleting...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  warningBoxText: {
    flex: 1,
    fontSize: 14,
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});