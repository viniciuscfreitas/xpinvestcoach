import { 
  PointsSystem, 
  Badge, 
  Achievement, 
  ActivityRecord, 
  LevelConfig, 
  User,
  StreakData,
  DailyGoal,
  UserStatistics 
} from '../tipos';

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, name: 'Iniciante', minPoints: 0, maxPoints: 99, multiplier: 1.0, color: '#4CAF50', icon: 'trending-up' },
  { level: 2, name: 'Aprendiz', minPoints: 100, maxPoints: 299, multiplier: 1.2, color: '#2196F3', icon: 'school' },
  { level: 3, name: 'Estudante', minPoints: 300, maxPoints: 599, multiplier: 1.5, color: '#9C27B0', icon: 'menu-book' },
  { level: 4, name: 'Investidor', minPoints: 600, maxPoints: 999, multiplier: 1.8, color: '#FF9800', icon: 'trending-up' },
  { level: 5, name: 'Expert', minPoints: 1000, maxPoints: 1999, multiplier: 2.0, color: '#F44336', icon: 'analytics' },
  { level: 6, name: 'Mestre', minPoints: 2000, maxPoints: 9999, multiplier: 2.5, color: '#FFD700', icon: 'emoji-events' },
];

export const POINTS_CONFIG = {
  education: {
    iniciante: 15,
    intermediario: 25,
    avancado: 40,
    firstReadBonus: 0.5,
    categoryCompleteBonus: 100,
  },
  chat: {
    message: 1,
    educationalQuestion: 3,
    maxPerHour: 10,
  },
  simulation: {
    basic: 30,
    diversifiedBonus: 20,
    optimizedBonus: 30,
  },
  onboarding: {
    complete: 100,
    redo: 25,
  },
  dashboard: {
    quickAction: 5,
  },
  achievements: {
    firstSimulation: 50,
    weekStreak: 100,
    categoryComplete: 150,
    levelUp: 500,
  },
};

export const BADGES_LIBRARY: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  { id: 'curious', name: 'Curioso', description: 'Leu seu primeiro artigo', icon: 'lightbulb', category: 'education', rarity: 'common' },
  { id: 'reader', name: 'Leitor Voraz', description: 'Leu 10 artigos', icon: 'menu-book', category: 'education', rarity: 'rare', maxProgress: 10 },
  { id: 'marathoner', name: 'Maratonista', description: 'Leu 5 artigos em um dia', icon: 'flash-on', category: 'education', rarity: 'epic', maxProgress: 5 },
  { id: 'specialist', name: 'Especialista', description: 'Leu todos os artigos avançados', icon: 'school', category: 'education', rarity: 'legendary' },
  { id: 'first-step', name: 'Primeiro Passo', description: 'Fez sua primeira simulação', icon: 'play-arrow', category: 'simulation', rarity: 'common' },
  { id: 'diversifier', name: 'Diversificador', description: 'Simulou com 5+ ativos diferentes', icon: 'pie-chart', category: 'simulation', rarity: 'rare', maxProgress: 5 },
  { id: 'conservative', name: 'Conservador', description: 'Simulou carteira de baixo risco', icon: 'security', category: 'simulation', rarity: 'common' },
  { id: 'bold', name: 'Arrojado', description: 'Simulou carteira de alto risco', icon: 'trending-up', category: 'simulation', rarity: 'rare' },
  { id: 'dedicated', name: 'Dedicado', description: '7 dias consecutivos de uso', icon: 'favorite', category: 'engagement', rarity: 'rare', maxProgress: 7 },
  { id: 'veteran', name: 'Veterano', description: '30 dias de uso', icon: 'military-tech', category: 'engagement', rarity: 'epic', maxProgress: 30 },
  { id: 'conversationalist', name: 'Conversador', description: '100 mensagens no chat', icon: 'chat', category: 'engagement', rarity: 'rare', maxProgress: 100 },
  { id: 'explorer', name: 'Explorador', description: 'Usou todas as funcionalidades', icon: 'explore', category: 'engagement', rarity: 'epic' },
  { id: 'centurion', name: 'Centurião', description: 'Alcançou 100 pontos', icon: 'looks-one', category: 'milestone', rarity: 'common' },
  { id: 'millionaire', name: 'Milionário', description: 'Alcançou 1000 pontos', icon: 'star', category: 'milestone', rarity: 'epic' },
  { id: 'legend', name: 'Lenda', description: 'Alcançou 5000 pontos', icon: 'emoji-events', category: 'milestone', rarity: 'legendary' },
];

export const getLevelFromPoints = (points: number): LevelConfig => {
  return LEVEL_CONFIGS.find(level => points >= level.minPoints && points <= level.maxPoints) || LEVEL_CONFIGS[0];
};

export const getPointsToNextLevel = (points: number): number => {
  const currentLevel = getLevelFromPoints(points);
  const nextLevel = LEVEL_CONFIGS.find(level => level.level === currentLevel.level + 1);
  return nextLevel ? nextLevel.minPoints - points : 0;
};

export const calculateMultipliedPoints = (basePoints: number, level: number): number => {
  const levelConfig = LEVEL_CONFIGS.find(l => l.level === level) || LEVEL_CONFIGS[0];
  return Math.round(basePoints * levelConfig.multiplier);
};

export const initializePointsSystem = (user: User): PointsSystem => {
  const currentLevel = getLevelFromPoints(user.points);
  
  return {
    level: currentLevel.level,
    levelName: currentLevel.name,
    pointsToNextLevel: getPointsToNextLevel(user.points),
    multiplier: currentLevel.multiplier,
    badges: [],
    achievements: [],
    activityHistory: [],
    streaks: {
      current: 0,
      longest: 0,
      lastActivity: new Date(),
      streakType: 'daily',
    },
    dailyGoals: generateDailyGoals(),
    statistics: {
      totalActivities: 0,
      articlesRead: 0,
      simulationsCompleted: 0,
      chatMessages: 0,
      daysActive: 1,
      averagePointsPerDay: user.points,
      favoriteActivity: 'education',
      joinedDate: user.createdAt,
    },
  };
};

export const generateDailyGoals = (): DailyGoal[] => {
  const today = new Date();
  return [
    {
      id: 'daily-read',
      name: 'Leitor Diário',
      description: 'Leia 2 artigos hoje',
      target: 2,
      progress: 0,
      points: 20,
      completed: false,
      date: today,
    },
    {
      id: 'daily-simulate',
      name: 'Simulador',
      description: 'Faça 1 simulação hoje',
      target: 1,
      progress: 0,
      points: 15,
      completed: false,
      date: today,
    },
    {
      id: 'daily-chat',
      name: 'Conversador',
      description: 'Envie 5 mensagens no chat',
      target: 5,
      progress: 0,
      points: 10,
      completed: false,
      date: today,
    },
  ];
};

export const addActivity = (
  pointsSystem: PointsSystem,
  type: ActivityRecord['type'],
  activity: string,
  basePoints: number,
  metadata?: any
): { updatedSystem: PointsSystem; pointsEarned: number; levelUp: boolean; newBadges: Badge[] } => {
  const multipliedPoints = calculateMultipliedPoints(basePoints, pointsSystem.level);
  
  const activityRecord: ActivityRecord = {
    id: Date.now().toString(),
    type,
    activity,
    pointsEarned: multipliedPoints,
    multiplier: pointsSystem.multiplier,
    timestamp: new Date(),
    metadata,
  };

  const updatedHistory = [...pointsSystem.activityHistory, activityRecord];
  const updatedStats = updateStatistics(pointsSystem.statistics, type, multipliedPoints);
  const updatedStreaks = updateStreaks(pointsSystem.streaks);
  const updatedGoals = updateDailyGoals(pointsSystem.dailyGoals, type);
  const newBadges = checkForNewBadges(pointsSystem, updatedStats, updatedStreaks);
  const totalPoints = updatedHistory.reduce((sum, record) => sum + record.pointsEarned, 0);
  const newLevel = getLevelFromPoints(totalPoints);
  const levelUp = newLevel.level > pointsSystem.level;

  const updatedSystem: PointsSystem = {
    ...pointsSystem,
    level: newLevel.level,
    levelName: newLevel.name,
    pointsToNextLevel: getPointsToNextLevel(totalPoints),
    multiplier: newLevel.multiplier,
    badges: [...pointsSystem.badges, ...newBadges],
    activityHistory: updatedHistory,
    streaks: updatedStreaks,
    dailyGoals: updatedGoals,
    statistics: updatedStats,
  };

  return {
    updatedSystem,
    pointsEarned: multipliedPoints,
    levelUp,
    newBadges,
  };
};

const updateStatistics = (stats: UserStatistics, type: ActivityRecord['type'], points: number): UserStatistics => {
  const updated = { ...stats };
  updated.totalActivities += 1;
  
  switch (type) {
    case 'education':
      updated.articlesRead += 1;
      break;
    case 'simulation':
      updated.simulationsCompleted += 1;
      break;
    case 'chat':
      updated.chatMessages += 1;
      break;
  }

  const daysSinceJoined = Math.max(1, Math.floor((Date.now() - stats.joinedDate.getTime()) / (1000 * 60 * 60 * 24)));
  updated.averagePointsPerDay = (updated.averagePointsPerDay * (daysSinceJoined - 1) + points) / daysSinceJoined;

  return updated;
};

const updateStreaks = (streaks: StreakData): StreakData => {
  const now = new Date();
  const lastActivity = new Date(streaks.lastActivity);
  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return streaks;
  } else if (daysDiff === 1) {
    const newCurrent = streaks.current + 1;
    return {
      ...streaks,
      current: newCurrent,
      longest: Math.max(streaks.longest, newCurrent),
      lastActivity: now,
    };
  } else {
    return {
      ...streaks,
      current: 1,
      lastActivity: now,
    };
  }
};

const updateDailyGoals = (goals: DailyGoal[], type: ActivityRecord['type']): DailyGoal[] => {
  return goals.map(goal => {
    let shouldUpdate = false;
    
    switch (goal.id) {
      case 'daily-read':
        shouldUpdate = type === 'education';
        break;
      case 'daily-simulate':
        shouldUpdate = type === 'simulation';
        break;
      case 'daily-chat':
        shouldUpdate = type === 'chat';
        break;
    }

    if (shouldUpdate && !goal.completed) {
      const newProgress = Math.min(goal.progress + 1, goal.target);
      return {
        ...goal,
        progress: newProgress,
        completed: newProgress >= goal.target,
      };
    }

    return goal;
  });
};

const checkForNewBadges = (
  pointsSystem: PointsSystem, 
  stats: UserStatistics, 
  streaks: StreakData
): Badge[] => {
  const newBadges: Badge[] = [];
  const unlockedBadgeIds = pointsSystem.badges.map((b: Badge) => b.id);

  BADGES_LIBRARY.forEach(badgeTemplate => {
    if (unlockedBadgeIds.includes(badgeTemplate.id)) return;

    let shouldUnlock = false;

    switch (badgeTemplate.id) {
      case 'curious':
        shouldUnlock = stats.articlesRead >= 1;
        break;
      case 'reader':
        shouldUnlock = stats.articlesRead >= 10;
        break;
      case 'marathoner':
        const todayActivities = pointsSystem.activityHistory.filter(
          (a: ActivityRecord) => a.type === 'education' && 
          new Date(a.timestamp).toDateString() === new Date().toDateString()
        );
        shouldUnlock = todayActivities.length >= 5;
        break;
      case 'first-step':
        shouldUnlock = stats.simulationsCompleted >= 1;
        break;
      case 'diversifier':
        shouldUnlock = stats.simulationsCompleted >= 5;
        break;
      case 'dedicated':
        shouldUnlock = streaks.current >= 7;
        break;
      case 'veteran':
        shouldUnlock = stats.daysActive >= 30;
        break;
      case 'conversationalist':
        shouldUnlock = stats.chatMessages >= 100;
        break;
      case 'centurion':
        const totalPoints = pointsSystem.activityHistory.reduce((sum: number, a: ActivityRecord) => sum + a.pointsEarned, 0);
        shouldUnlock = totalPoints >= 100;
        break;
      case 'millionaire':
        const totalPoints2 = pointsSystem.activityHistory.reduce((sum: number, a: ActivityRecord) => sum + a.pointsEarned, 0);
        shouldUnlock = totalPoints2 >= 1000;
        break;
      case 'legend':
        const totalPoints3 = pointsSystem.activityHistory.reduce((sum: number, a: ActivityRecord) => sum + a.pointsEarned, 0);
        shouldUnlock = totalPoints3 >= 5000;
        break;
    }

    if (shouldUnlock) {
      newBadges.push({
        ...badgeTemplate,
        unlockedAt: new Date(),
        progress: badgeTemplate.maxProgress || 1,
      });
    }
  });

  return newBadges;
};

export const checkCooldown = (
  activityHistory: ActivityRecord[],
  type: ActivityRecord['type'],
  cooldownMinutes: number = 60
): boolean => {
  const now = new Date();
  const recentActivities = activityHistory.filter(
    a => a.type === type && 
    (now.getTime() - new Date(a.timestamp).getTime()) < (cooldownMinutes * 60 * 1000)
  );

  switch (type) {
    case 'chat':
      return recentActivities.reduce((sum, a) => sum + a.pointsEarned, 0) < POINTS_CONFIG.chat.maxPerHour;
    default:
      return true;
  }
};

export default {
  LEVEL_CONFIGS,
  POINTS_CONFIG,
  BADGES_LIBRARY,
  getLevelFromPoints,
  getPointsToNextLevel,
  calculateMultipliedPoints,
  initializePointsSystem,
  generateDailyGoals,
  addActivity,
  checkCooldown,
}; 