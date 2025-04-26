import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { session } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!session?.user) return;

    fetchUnreadCount();

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .or(`user_id.eq.${session?.user.id},mentor_id.eq.${session?.user.id}`);

      const appointmentIds = appointments?.map(app => app.id) || [];

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
        .in('appointment_id', appointmentIds);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.notification }]}>
      <Text style={styles.count}>{unreadCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  count: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});