export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  profile?: InvestorProfile;
  points: number;
  pointsSystem?: PointsSystem;
}

export interface InvestorProfile {
  age: number;
  experience: 'iniciante' | 'intermediario' | 'avancado';
  objective: 'crescimento' | 'renda' | 'reserva' | 'aposentadoria';
  riskTolerance: 'conservador' | 'moderado' | 'arrojado';
  monthlyIncome: number;
  investmentAmount: number;
  riskScore: number;
}

export interface Investment {
  id: string;
  name: string;
  type: 'renda-fixa' | 'renda-variavel' | 'fundos' | 'cripto';
  risk: 'baixo' | 'medio' | 'alto';
  expectedReturn: number;
  minimumAmount: number;
  description: string;
  compatibility: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  investments: PortfolioItem[];
  totalAmount: number;
  expectedReturn: number;
  riskLevel: string;
}

export interface PortfolioItem {
  investment: Investment;
  amount: number;
  percentage: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface EducationContent {
  id: string;
  title: string;
  content: string;
  category: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  readTime: number;
  points: number;
}

export interface PointsSystem {
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  multiplier: number;
  badges: Badge[];
  achievements: Achievement[];
  activityHistory: ActivityRecord[];
  streaks: StreakData;
  dailyGoals: DailyGoal[];
  statistics: UserStatistics;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'education' | 'simulation' | 'engagement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  type: 'education' | 'simulation' | 'chat' | 'streak' | 'milestone';
  condition: AchievementCondition;
  completed: boolean;
  completedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface AchievementCondition {
  type: 'count' | 'streak' | 'points' | 'level' | 'combo';
  target: number;
  activity?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface ActivityRecord {
  id: string;
  type: 'education' | 'simulation' | 'chat' | 'onboarding' | 'dashboard';
  activity: string;
  pointsEarned: number;
  multiplier: number;
  timestamp: Date;
  metadata?: any;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActivity: Date;
  streakType: 'daily' | 'weekly';
}

export interface DailyGoal {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  points: number;
  completed: boolean;
  date: Date;
}

export interface UserStatistics {
  totalActivities: number;
  articlesRead: number;
  simulationsCompleted: number;
  chatMessages: number;
  daysActive: number;
  averagePointsPerDay: number;
  favoriteActivity: string;
  joinedDate: Date;
}

export interface LevelConfig {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  multiplier: number;
  color: string;
  icon: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  EditProfile: undefined;
  Main: undefined;
  Dashboard: undefined;
  Chat: undefined;
  Simulation: undefined;
  Education: undefined;
  Profile: undefined;
  Achievements: undefined;
}; 