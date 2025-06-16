import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexto/ContextoAuth';
import { useTheme } from '../../contexto/ContextoTema';
import { useNavigation } from '@react-navigation/native';
import { getPortfolioRecommendations } from '../../servicos/dadosSimulados';
import { Investment } from '../../tipos';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user, updateUser, addPoints, getUserLevel } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [recommendations, setRecommendations] = useState<Investment[]>([]);
  
  const userLevel = getUserLevel();

  useEffect(() => {
    if (user?.profile) {
      const recs = getPortfolioRecommendations(user.profile);
      setRecommendations(recs);
    }
  }, [user]);

  const getRiskProfileText = (score: number): string => {
    if (score <= 4) return 'Conservador';
    if (score <= 7) return 'Moderado';
    return 'Arrojado';
  };

  const getRiskColor = (score: number): string => {
    if (score <= 4) return colors.success;
    if (score <= 7) return colors.warning;
    return colors.error;
  };

  const handleQuickAction = async (action: string, basePoints: number) => {
    if (!user) return;

    const pointsResult = await addPoints('dashboard', `Ação rápida: ${action}`, basePoints, {
      action,
      timestamp: new Date(),
    });

    if (pointsResult && pointsResult.pointsEarned > 0) {
      let message = `Você ganhou ${pointsResult.pointsEarned} pontos!`;
      
      if (pointsResult.levelUp) {
        const userLevel = getUserLevel();
        message += `\n\n🎉 LEVEL UP! Agora você é ${userLevel?.name}!`;
      }

      if (pointsResult.newBadges.length > 0) {
        message += `\n\n🏆 Novo Badge: ${pointsResult.newBadges[0].name}!`;
      }

      Alert.alert('Parabéns! 🎉', message);
    }
  };

  if (!user || !user.profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <MaterialIcons name="error" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Erro ao carregar perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <MaterialIcons name="dashboard" size={28} color={colors.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Olá, {user.name.split(' ')[0]}</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Como estão seus investimentos hoje?</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.surface }]}
            onPress={() => handleQuickAction('notification', 5)}
          >
            <MaterialIcons name="notifications" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.pointsCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Achievements' as never)}
        >
          <View style={styles.pointsHeader}>
            <MaterialIcons name="stars" size={24} color={colors.primary} />
            <Text style={[styles.pointsTitle, { color: colors.text }]}>Seus Pontos XP</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
          <Text style={[styles.pointsValue, { color: colors.text }]}>{user.points}</Text>
          <View style={styles.pointsFooter}>
            <Text style={[styles.pointsSubtitle, { color: colors.textSecondary }]}>
              {userLevel?.name} • Nível {userLevel?.level}
            </Text>
            {user.pointsSystem?.badges && (
              <View style={styles.badgePreview}>
                <MaterialIcons name="emoji-events" size={16} color={colors.primary} />
                <Text style={[styles.badgeCount, { color: colors.primary }]}>
                  {user.pointsSystem.badges.length} conquistas
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Seu Perfil de Investidor</Text>
          </View>
          <View style={styles.profileContent}>
            <View style={styles.profileItem}>
              <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Perfil de Risco:</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(user.profile.riskScore) }]}>
                <Text style={styles.riskText}>{getRiskProfileText(user.profile.riskScore)}</Text>
              </View>
            </View>
            <View style={styles.profileItem}>
              <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Experiência:</Text>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {user.profile.experience === 'iniciante' ? 'Iniciante' : 
                 user.profile.experience === 'intermediario' ? 'Intermediário' : 
                 user.profile.experience === 'avancado' ? 'Avançado' : user.profile.experience}
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Objetivo:</Text>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {user.profile.objective === 'crescimento' ? 'Crescimento' :
                 user.profile.objective === 'renda' ? 'Renda' :
                 user.profile.objective === 'reserva' ? 'Reserva de Emergência' :
                 user.profile.objective === 'aposentadoria' ? 'Aposentadoria' : user.profile.objective}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.quickActionsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Chat' as never)}
            >
              <MaterialIcons name="chat" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Assistente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Simulation' as never)}
            >
              <MaterialIcons name="bar-chart" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Simular</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Education' as never)}
            >
              <MaterialIcons name="school" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Aprender</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => handleQuickAction('daily_check', 10)}
            >
              <MaterialIcons name="check-circle" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Check Diário</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.recommendationsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="recommend" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recomendações para Você</Text>
          </View>
          {recommendations.slice(0, 3).map((investment, index) => (
            <View key={investment.id} style={[styles.recommendationItem, { borderBottomColor: colors.border }]}>
              <View style={styles.investmentInfo}>
                <Text style={[styles.investmentName, { color: colors.text }]}>{investment.name}</Text>
                <Text style={[styles.investmentDescription, { color: colors.textSecondary }]}>{investment.description}</Text>
                <View style={styles.investmentDetails}>
                  <Text style={[styles.investmentReturn, { color: colors.success }]}>
                    {investment.expectedReturn.toFixed(1)}% a.a.
                  </Text>
                  <View style={[styles.compatibilityBadge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.compatibilityText, { color: colors.text }]}>
                      {investment.compatibility}% compatível
                    </Text>
                  </View>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.seeMoreButton, { borderTopColor: colors.border }]}
            onPress={() => navigation.navigate('Simulation' as never)}
          >
            <Text style={[styles.seeMoreText, { color: colors.text }]}>Ver todas as recomendações</Text>
            <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.marketCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="trending-up" size={24} color={colors.success} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Status do Mercado</Text>
          </View>
          <View style={styles.marketGrid}>
            <View style={styles.marketItem}>
              <Text style={[styles.marketLabel, { color: colors.textSecondary }]}>Ibovespa</Text>
              <Text style={[styles.marketValue, { color: colors.success }]}>+1.2%</Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={[styles.marketLabel, { color: colors.textSecondary }]}>CDI</Text>
              <Text style={[styles.marketValue, { color: colors.text }]}>12.65%</Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={[styles.marketLabel, { color: colors.textSecondary }]}>Dólar</Text>
              <Text style={[styles.marketValue, { color: colors.error }]}>R$ 5.42</Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={[styles.marketLabel, { color: colors.textSecondary }]}>Bitcoin</Text>
              <Text style={[styles.marketValue, { color: colors.success }]}>+2.8%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: Math.min(20, width * 0.05),
    fontWeight: 'bold',
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  notificationIcon: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  pointsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  pointsValue: {
    fontSize: Math.min(48, width * 0.12),
    fontWeight: 'bold',
  },
  pointsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  pointsFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  badgePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileContent: {
    gap: 12,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 14,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    gap: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    borderWidth: 1,
    minHeight: 80,
  },
  actionText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  recommendationsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  investmentDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  investmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  investmentReturn: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  compatibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    borderTopWidth: 1,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  marketCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 15,
  },
  marketItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  marketLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  marketValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DashboardScreen; 