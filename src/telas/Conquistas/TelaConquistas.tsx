import React, { useState } from 'react';
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
import { Badge, DailyGoal } from '../../tipos';
import { BADGES_LIBRARY, LEVEL_CONFIGS } from '../../servicos/sistemapontos';

const { width } = Dimensions.get('window');

const AchievementsScreen = () => {
  const { user, getUserLevel } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todas', icon: 'star' },
    { id: 'education', name: 'Educação', icon: 'school' },
    { id: 'simulation', name: 'Simulação', icon: 'bar-chart' },
    { id: 'engagement', name: 'Engajamento', icon: 'favorite' },
    { id: 'milestone', name: 'Marcos', icon: 'emoji-events' },
  ];

  const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFD700';
      default: return colors.textSecondary;
    }
  };

  const getRarityName = (rarity: Badge['rarity']): string => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Comum';
    }
  };

  const getFilteredBadges = () => {
    const userBadges = user?.pointsSystem?.badges || [];
    const userBadgeIds = userBadges.map((b: Badge) => b.id);
    
    const allBadges = BADGES_LIBRARY.map(badgeTemplate => {
      const userBadge = userBadges.find((ub: Badge) => ub.id === badgeTemplate.id);
      return userBadge || { ...badgeTemplate, unlockedAt: undefined };
    });

    if (selectedCategory === 'all') {
      return allBadges;
    }
    
    return allBadges.filter(badge => badge.category === selectedCategory);
  };

  const userLevel = getUserLevel();
  const currentLevel = LEVEL_CONFIGS.find(l => l.level === userLevel?.level) || LEVEL_CONFIGS[0];
  const nextLevel = LEVEL_CONFIGS.find(l => l.level === (userLevel?.level || 1) + 1);

  const unlockedBadges = user?.pointsSystem?.badges || [];
  const totalBadges = BADGES_LIBRARY.length;
  const completionPercentage = Math.round((unlockedBadges.length / totalBadges) * 100);

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <MaterialIcons name="error" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Erro ao carregar usuário</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Conquistas</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {unlockedBadges.length} de {totalBadges} desbloqueadas
            </Text>
          </View>
          <View style={[styles.completionBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.completionText}>{completionPercentage}%</Text>
          </View>
        </View>

        <View style={[styles.levelCard, { backgroundColor: colors.surface }]}>
          <View style={styles.levelHeader}>
            <MaterialIcons name={currentLevel.icon as any} size={32} color={currentLevel.color} />
            <View style={styles.levelInfo}>
              <Text style={[styles.levelName, { color: colors.text }]}>{currentLevel.name}</Text>
              <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
                Nível {currentLevel.level} • Multiplicador {currentLevel.multiplier}x
              </Text>
            </View>
          </View>
          
          {nextLevel && (
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  Progresso para {nextLevel.name}
                </Text>
                <Text style={[styles.progressPoints, { color: colors.text }]}>
                  {user.points} / {nextLevel.minPoints} pontos
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: currentLevel.color,
                      width: `${Math.min((user.points / nextLevel.minPoints) * 100, 100)}%`
                    }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {user.pointsSystem?.dailyGoals && (
          <View style={[styles.goalsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="today" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Metas de Hoje</Text>
            </View>
            
            {user.pointsSystem.dailyGoals.map((goal: DailyGoal) => (
              <View key={goal.id} style={[styles.goalItem, { borderBottomColor: colors.border }]}>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
                  <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>
                    {goal.description}
                  </Text>
                  <View style={styles.goalProgress}>
                    <View style={[styles.goalProgressBar, { backgroundColor: colors.border }]}>
                      <View 
                        style={[
                          styles.goalProgressFill,
                          { 
                            backgroundColor: goal.completed ? colors.success : colors.primary,
                            width: `${Math.min((goal.progress / goal.target) * 100, 100)}%`
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.goalProgressText, { color: colors.textSecondary }]}>
                      {goal.progress}/{goal.target}
                    </Text>
                  </View>
                </View>
                <View style={styles.goalReward}>
                  {goal.completed ? (
                    <MaterialIcons name="check-circle" size={24} color={colors.success} />
                  ) : (
                    <View style={[styles.pointsBadge, { backgroundColor: colors.border }]}>
                      <MaterialIcons name="stars" size={16} color={colors.primary} />
                      <Text style={[styles.pointsText, { color: colors.primary }]}>+{goal.points}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.border },
                  selectedCategory === category.id && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialIcons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.id ? '#000' : colors.text} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: colors.text },
                  selectedCategory === category.id && { color: '#000' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.badgesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all' ? 'Todas as Conquistas' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          
          <View style={styles.badgesGrid}>
            {getFilteredBadges().map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard,
                  { 
                    backgroundColor: colors.surface,
                    borderColor: badge.unlockedAt ? getRarityColor(badge.rarity) : colors.border,
                    opacity: badge.unlockedAt ? 1 : 0.6
                  }
                ]}
                onPress={() => {
                  Alert.alert(
                    badge.name,
                    `${badge.description}\n\nRaridade: ${getRarityName(badge.rarity)}${
                      badge.unlockedAt 
                        ? `\nDesbloqueado em: ${new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}`
                        : '\n🔒 Ainda não desbloqueado'
                    }`,
                    [{ text: 'OK' }]
                  );
                }}
              >
                <View style={[styles.badgeIcon, { backgroundColor: getRarityColor(badge.rarity) }]}>
                  <MaterialIcons 
                    name={badge.icon as any} 
                    size={24} 
                    color="#FFF" 
                  />
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]} numberOfLines={2}>
                  {badge.name}
                </Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(badge.rarity) }]}>
                  <Text style={styles.rarityText}>{getRarityName(badge.rarity)}</Text>
                </View>
                {badge.unlockedAt && (
                  <View style={styles.unlockedIndicator}>
                    <MaterialIcons name="check-circle" size={16} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {user.pointsSystem?.statistics && (
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="analytics" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Suas Estatísticas</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {user.pointsSystem.statistics.totalActivities}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Atividades
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {user.pointsSystem.statistics.articlesRead}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Artigos Lidos
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {user.pointsSystem.streaks.longest}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Maior Sequência
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {Math.round(user.pointsSystem.statistics.averagePointsPerDay)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Pontos/Dia
                </Text>
              </View>
            </View>
          </View>
        )}

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  completionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completionText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  levelCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelInfo: {
    marginLeft: 12,
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressPoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalProgressText: {
    fontSize: 12,
    minWidth: 40,
  },
  goalReward: {
    marginLeft: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  categoryContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  badgesContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 36,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AchievementsScreen; 