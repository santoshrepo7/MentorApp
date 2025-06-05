import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Send, Bot } from 'lucide-react-native';
import OpenAI from 'openai';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const RATE_LIMIT = 5; // messages per minute
const RATE_WINDOW = 60000; // 1 minute in milliseconds

export default function AIMentorScreen() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: "Hello! I'm your AI mentor. How can I help you today?",
    role: 'assistant',
    timestamp: new Date()
  }]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const messageCountRef = useRef<number>(0);
  const lastMessageTimeRef = useRef<number>(Date.now());
  const { theme } = useTheme();

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastMessageTimeRef.current > RATE_WINDOW) {
      // Reset counter if window has passed
      messageCountRef.current = 0;
      lastMessageTimeRef.current = now;
    }

    if (messageCountRef.current >= RATE_LIMIT) {
      throw new Error('Rate limit exceeded. Please wait a moment before sending more messages.');
    }

    messageCountRef.current++;
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      checkRateLimit();
      setError(null);

      const userMessage: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsTyping(true);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable and helpful mentor. Your responses should be educational, encouraging, and focused on helping the user learn and grow. Provide specific examples and actionable advice when appropriate.'
          },
          {
            role: 'user',
            content: userMessage.content
          }
        ],
        model: 'gpt-3.5-turbo',
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while getting the response');
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAI = item.role === 'assistant';

    return (
      <View style={[
        styles.messageContainer,
        isAI ? styles.aiMessageContainer : styles.userMessageContainer
      ]}>
        {isAI && (
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Bot size={20} color="#fff" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isAI ? [styles.aiMessageBubble, { backgroundColor: theme.colors.card }] : [styles.userMessageBubble, { backgroundColor: theme.colors.primary }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: isAI ? theme.colors.text : '#fff' }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isAI ? theme.colors.subtitle : 'rgba(255, 255, 255, 0.7)' }
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>AI Mentor</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subtitle }]}>Get personalized learning assistance</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      )}

      {isTyping && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.colors.card }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.typingText, { color: theme.colors.subtitle }]}>AI is thinking...</Text>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background,
            color: theme.colors.text
          }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Ask your AI mentor..."
          placeholderTextColor={theme.colors.placeholder}
          multiline
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
            { backgroundColor: newMessage.trim() ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={handleSend}
          disabled={!newMessage.trim() || isTyping}>
          <Send size={20} color={newMessage.trim() && !isTyping ? '#fff' : theme.colors.placeholder} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
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
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  aiMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
});