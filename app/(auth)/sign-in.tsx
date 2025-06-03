import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Mail, Lock, Phone, Linkedin, Twitter, ToggleLeft as Google } from 'lucide-react-native';
import { parsePhoneNumber } from 'libphonenumber-js';

export default function SignIn() {
  const [isEmailMode, setIsEmailMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signInWithProvider, signInWithPhone, verifyOtp } = useAuth();
  const { theme } = useTheme();

  const handleSignIn = async () => {
    try {
      setError('');
      if (isEmailMode) {
        await signIn(email, password);
      } else if (otpSent) {
        await verifyOtp(phoneNumber, otp);
      } else {
        const parsedNumber = parsePhoneNumber(phoneNumber, 'US');
        if (!parsedNumber?.isValid()) {
          throw new Error('Invalid phone number');
        }
        await signInWithPhone(parsedNumber.format('E.164'));
        setOtpSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'linkedin' | 'twitter') => {
    try {
      setError('');
      await signInWithProvider(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your mentorship journey</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              isEmailMode && styles.activeToggle,
              { backgroundColor: isEmailMode ? theme.colors.primary : theme.colors.card }
            ]}
            onPress={() => setIsEmailMode(true)}>
            <Mail size={20} color={isEmailMode ? '#fff' : theme.colors.text} />
            <Text style={[styles.toggleText, { color: isEmailMode ? '#fff' : theme.colors.text }]}>Email</Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              !isEmailMode && styles.activeToggle,
              { backgroundColor: !isEmailMode ? theme.colors.primary : theme.colors.card }
            ]}
            onPress={() => setIsEmailMode(false)}>
            <Phone size={20} color={!isEmailMode ? '#fff' : theme.colors.text} />
            <Text style={[styles.toggleText, { color: !isEmailMode ? '#fff' : theme.colors.text }]}>Phone</Text>
          </Pressable>
        </View>

        {isEmailMode ? (
          <>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Mail size={20} color={theme.colors.subtitle} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Lock size={20} color={theme.colors.subtitle} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.placeholder}
                  secureTextEntry
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Phone Number</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Phone size={20} color={theme.colors.subtitle} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="phone-pad"
                  editable={!otpSent}
                />
              </View>
            </View>

            {otpSent && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>OTP</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Lock size={20} color={theme.colors.subtitle} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter OTP"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            )}
          </>
        )}

        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSignIn}>
          <Text style={styles.buttonText}>
            {isEmailMode ? 'Sign In' : (otpSent ? 'Verify OTP' : 'Send OTP')}
          </Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.subtitle }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        <View style={styles.socialButtons}>
          <Pressable
            style={[styles.socialButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleSocialSignIn('google')}>
            <Google size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable
            style={[styles.socialButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleSocialSignIn('linkedin')}>
            <Linkedin size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable
            style={[styles.socialButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleSocialSignIn('twitter')}>
            <Twitter size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.subtitle }]}>Don't have an account? </Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={[styles.link, { color: theme.colors.primary }]}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  form: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  error: {
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeToggle: {
    backgroundColor: '#0891b2',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
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
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});