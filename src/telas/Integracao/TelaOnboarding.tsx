import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexto/ContextoAuth';
import { InvestorProfile, Badge } from '../../tipos';
import { calculateRiskScore } from '../../servicos/dadosSimulados';

const { width } = Dimensions.get('window');

interface Question {
  id: keyof InvestorProfile;
  title: string;
  options: { label: string; value: any }[];
}

const questions: Question[] = [
  {
    id: 'age',
    title: 'Qual sua idade?',
    options: [
      { label: '18-25 anos', value: 22 },
      { label: '26-35 anos', value: 30 },
      { label: '36-50 anos', value: 43 },
      { label: '51-65 anos', value: 58 },
      { label: 'Mais de 65 anos', value: 70 },
    ],
  },
  {
    id: 'experience',
    title: 'Qual sua experiência com investimentos?',
    options: [
      { label: 'Iniciante - Nunca investi', value: 'iniciante' },
      { label: 'Intermediário - Já investi algumas vezes', value: 'intermediario' },
      { label: 'Avançado - Invisto regularmente', value: 'avancado' },
    ],
  },
  {
    id: 'objective',
    title: 'Qual seu principal objetivo ao investir?',
    options: [
      { label: 'Reserva de emergência', value: 'reserva' },
      { label: 'Gerar renda extra', value: 'renda' },
      { label: 'Crescimento do patrimônio', value: 'crescimento' },
      { label: 'Aposentadoria', value: 'aposentadoria' },
    ],
  },
  {
    id: 'riskTolerance',
    title: 'Como você se sente em relação a riscos?',
    options: [
      { label: 'Conservador - Prefiro segurança', value: 'conservador' },
      { label: 'Moderado - Aceito riscos médios', value: 'moderado' },
      { label: 'Arrojado - Busco maiores retornos', value: 'arrojado' },
    ],
  },
  {
    id: 'monthlyIncome',
    title: 'Qual sua renda mensal aproximada?',
    options: [
      { label: 'Até R$ 2.000', value: 2000 },
      { label: 'R$ 2.001 - R$ 5.000', value: 3500 },
      { label: 'R$ 5.001 - R$ 10.000', value: 7500 },
      { label: 'R$ 10.001 - R$ 20.000', value: 15000 },
      { label: 'Acima de R$ 20.000', value: 25000 },
    ],
  },
  {
    id: 'investmentAmount',
    title: 'Quanto pretende investir inicialmente?',
    options: [
      { label: 'Até R$ 1.000', value: 1000 },
      { label: 'R$ 1.001 - R$ 5.000', value: 3000 },
      { label: 'R$ 5.001 - R$ 20.000', value: 12500 },
      { label: 'R$ 20.001 - R$ 50.000', value: 35000 },
      { label: 'Acima de R$ 50.000', value: 75000 },
    ],
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser, addPoints, getUserLevel } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<InvestorProfile>>({});

  const handleAnswer = (value: any) => {
    const updatedAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value,
    };
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeOnboarding(updatedAnswers);
    }
  };

  const completeOnboarding = async (finalAnswers: Partial<InvestorProfile>) => {
    if (!user) return;

    const profile: InvestorProfile = {
      age: finalAnswers.age!,
      experience: finalAnswers.experience!,
      objective: finalAnswers.objective!,
      riskTolerance: finalAnswers.riskTolerance!,
      monthlyIncome: finalAnswers.monthlyIncome!,
      investmentAmount: finalAnswers.investmentAmount!,
      riskScore: 0,
    };

    profile.riskScore = calculateRiskScore(profile);

    const updatedUser = {
      ...user,
      profile,
    };

    await updateUser(updatedUser);

    const pointsResult = await addPoints('onboarding', 'Perfil de investidor criado', 100, {
      riskProfile: getRiskProfileText(profile.riskScore),
      experience: profile.experience,
      objective: profile.objective,
    });

    let message = `Seu perfil foi criado com sucesso! 🎯\n\nSeu perfil: ${getRiskProfileText(profile.riskScore)} 📊`;
    
    if (pointsResult) {
      message += `\n\nVocê ganhou ${pointsResult.pointsEarned} pontos! 🌟`;
      
      if (pointsResult.levelUp) {
        const userLevel = getUserLevel();
        message += `\n\n🎉 LEVEL UP! Você é ${userLevel?.name} (Nível ${userLevel?.level})!`;
      }

      if (pointsResult.newBadges.length > 0) {
        message += `\n\n🏆 Primeiro Badge Desbloqueado:`;
        pointsResult.newBadges.forEach((badge: Badge) => {
          message += `\n• ${badge.name}: ${badge.description}`;
        });
      }
    }

    Alert.alert(
      'Parabéns! 🎉',
      message,
      [{ text: 'Bora investir!', onPress: () => navigation.navigate('Main' as never) }]
    );
  };

  const getRiskProfileText = (score: number): string => {
    if (score <= 4) return 'Conservador';
    if (score <= 7) return 'Moderado';
    return 'Arrojado';
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentQuestion > 0 && (
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestion + 1} de {questions.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{questions[currentQuestion].title}</Text>

        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handleAnswer(option.value)}
            >
              <Text style={styles.optionText}>{option.label}</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: width - 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  progressText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    lineHeight: 32,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  arrow: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen; 