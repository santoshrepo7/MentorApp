import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Send, Bot } from 'lucide-react-native';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function AIMentorScreen() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: "Hello! I'm your AI mentor. How can I help you today?",
    role: 'assistant',
    timestamp: new Date()
  }]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to help you learn and grow. What specific topic would you like to explore or discuss?",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
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

      {isTyping && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.typingText, { color: theme.colors.subtitle }]}>AI is typing...</Text>
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
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
            { backgroundColor: newMessage.trim() ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={handleSend}
          disabled={!newMessage.trim()}>
          <Send size={20} color={newMessage.trim() ? '#fff' : theme.colors.placeholder} />
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
  typingIndicator: {
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
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