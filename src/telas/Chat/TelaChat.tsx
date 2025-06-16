import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexto/ContextoAuth';
import { useTheme } from '../../contexto/ContextoTema';
import { getChatResponse } from '../../servicos/dadosSimulados';
import { ChatMessage } from '../../tipos';

const checkIfEducationalQuestion = (message: string): boolean => {
  const educationalKeywords = [
    'investimento', 'renda fixa', 'renda variável', 'tesouro', 'ações', 'fundos',
    'diversificar', 'risco', 'perfil', 'carteira', 'ibovespa', 'cdb', 'lci',
    'como investir', 'onde investir', 'quanto investir', 'quando investir',
    'selic', 'ipca', 'inflação', 'juros', 'rentabilidade', 'liquidez'
  ];
  
  const lowerMessage = message.toLowerCase();
  return educationalKeywords.some(keyword => lowerMessage.includes(keyword));
};

const AnimatedMessage = ({ message, colors }: { message: ChatMessage; colors: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(message.isUser ? 50 : -50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        message.isUser ? styles.userMessageWrapper : styles.systemMessageWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser 
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: message.isUser ? '#000' : colors.text },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            { 
              color: message.isUser ? '#333' : colors.textSecondary,
              textAlign: message.isUser ? 'right' : 'left' 
            },
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </Animated.View>
  );
};

const TypingIndicator = ({ colors }: { colors: any }) => {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot1Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 400);
    };

    animateDots();
    const interval = setInterval(animateDots, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.typingDots}>
          <Animated.View style={[
            styles.dot, 
            { backgroundColor: colors.textSecondary, opacity: dot1Anim }
          ]} />
          <Animated.View style={[
            styles.dot, 
            { backgroundColor: colors.textSecondary, opacity: dot2Anim }
          ]} />
          <Animated.View style={[
            styles.dot, 
            { backgroundColor: colors.textSecondary, opacity: dot3Anim }
          ]} />
        </View>
      </View>
    </View>
  );
};

const AnimatedQuickQuestion = ({ 
  question, 
  index, 
  colors, 
  onPress 
}: { 
  question: string; 
  index: number; 
  colors: any; 
  onPress: () => void; 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.quickQuestionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
      >
        <Text style={[styles.quickQuestionText, { color: colors.text }]}>{question}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ChatScreen = () => {
  const { user, updateUser, addPoints, getUserLevel } = useAuth();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `E aí${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 😊 Sou seu parceiro aqui na XP pra te ajudar com investimentos. Bora conversar? No que posso dar uma força?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(async () => {
      const systemResponse = getChatResponse(inputText.trim());
      
      const systemMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: systemResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, systemMessage]);
      setIsTyping(false);

      if (user) {
        const isEducationalQuestion = checkIfEducationalQuestion(inputText.trim());
        const points = isEducationalQuestion ? 3 : 1;
        
        const pointsResult = await addPoints('chat', `Mensagem: ${inputText.trim()}`, points, {
          isEducational: isEducationalQuestion,
          messageLength: inputText.trim().length,
        });

        if (pointsResult && (pointsResult.levelUp || pointsResult.newBadges.length > 0)) {
          let message = '';
          
          if (pointsResult.levelUp) {
            const userLevel = getUserLevel();
            message += `🎉 LEVEL UP! Agora você é ${userLevel?.name}!\n`;
          }

          if (pointsResult.newBadges.length > 0) {
            message += `🏆 Novo Badge: ${pointsResult.newBadges[0].name}!`;
          }

          if (message) {
            setTimeout(() => {
              Alert.alert('Parabéns! 🚀', message);
            }, 2000);
          }
        }
      }
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const quickQuestions = [
    'O que é renda fixa?',
    'Como diversificar meus investimentos?',
    'Qual é meu perfil de risco?',
    'Tesouro Direto é seguro mesmo?',
    'O que é esse tal de Ibovespa?',
    'Como faço pra começar a investir?',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <MaterialIcons name="chat" size={28} color={colors.primary} />
            <View style={styles.headerTextContainer}>
                              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Chat XP</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Online • Sempre disponível</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.helpButton, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert(
              'Dicas do Parceiro 😉',
              'Pode perguntar sobre:\n• Tipos de investimentos\n• Seu perfil de risco\n• Como diversificar\n• Tesouro Direto\n• Ações e fundos\n• Como começar a investir'
            )}
          >
            <MaterialIcons name="help-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <AnimatedMessage key={message.id} message={message} colors={colors} />
          ))}

          {isTyping && <TypingIndicator colors={colors} />}

          {messages.length <= 2 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={[styles.quickQuestionsTitle, { color: colors.text }]}>Perguntas frequentes:</Text>
              <View style={styles.quickQuestionsGrid}>
                {quickQuestions.map((question, index) => (
                  <AnimatedQuickQuestion
                    key={index}
                    question={question}
                    index={index}
                    colors={colors}
                    onPress={() => handleQuickQuestion(question)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua pergunta sobre investimentos..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: colors.primary, 
                  opacity: (inputText.trim() && !isTyping) ? 1 : 0.5 
                }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              {isTyping ? (
                <MaterialIcons name="hourglass-empty" size={24} color="#000" />
              ) : (
                <MaterialIcons name="send" size={24} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 10,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  helpButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  systemMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessage: {
    borderBottomRightRadius: 4,
  },
  systemMessage: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000',
  },
  systemMessageText: {
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    textAlign: 'right',
  },
  systemMessageTime: {
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  quickQuestionsContainer: {
    marginTop: 20,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  quickQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickQuestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickQuestionText: {
    fontSize: 12,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen; 