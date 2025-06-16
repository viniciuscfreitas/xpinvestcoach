import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, PointsSystem, Badge, ActivityRecord } from '../tipos';
import { 
  initializePointsSystem, 
  addActivity, 
  checkCooldown,
  POINTS_CONFIG 
} from '../servicos/sistemapontos';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  addPoints: (
    type: ActivityRecord['type'], 
    activity: string, 
    basePoints?: number, 
    metadata?: any
  ) => Promise<{ pointsEarned: number; levelUp: boolean; newBadges: Badge[] } | null>;
  getUserLevel: () => { level: number; name: string; color: string; multiplier: number } | null;
  getTotalPoints: () => number;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@XPInvestCoach:user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        if (!parsedUser.pointsSystem) {
          parsedUser.pointsSystem = initializePointsSystem(parsedUser);
          await AsyncStorage.setItem('@XPInvestCoach:user', JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = await AsyncStorage.getItem('@XPInvestCoach:users');
      const usersList = users ? JSON.parse(users) : [];
      
      const foundUser = usersList.find((u: User) => u.email === email);
      
      if (foundUser) {
        if (!foundUser.pointsSystem) {
          foundUser.pointsSystem = initializePointsSystem(foundUser);
        }
        
        setUser(foundUser);
        await AsyncStorage.setItem('@XPInvestCoach:user', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const users = await AsyncStorage.getItem('@XPInvestCoach:users');
      const usersList = users ? JSON.parse(users) : [];
      
      const existingUser = usersList.find((u: User) => u.email === email);
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date(),
        points: 0,
      };

      newUser.pointsSystem = initializePointsSystem(newUser);

      usersList.push(newUser);
      await AsyncStorage.setItem('@XPInvestCoach:users', JSON.stringify(usersList));
      
      setUser(newUser);
      await AsyncStorage.setItem('@XPInvestCoach:user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@XPInvestCoach:user');
    } catch (error) {
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem('@XPInvestCoach:user', JSON.stringify(updatedUser));
      
      const users = await AsyncStorage.getItem('@XPInvestCoach:users');
      const usersList = users ? JSON.parse(users) : [];
      const userIndex = usersList.findIndex((u: User) => u.id === updatedUser.id);
      
      if (userIndex !== -1) {
        usersList[userIndex] = updatedUser;
        await AsyncStorage.setItem('@XPInvestCoach:users', JSON.stringify(usersList));
      }
    } catch (error) {
    }
  };

  const addPoints = async (
    type: ActivityRecord['type'],
    activity: string,
    basePoints?: number,
    metadata?: any
  ): Promise<{ pointsEarned: number; levelUp: boolean; newBadges: Badge[] } | null> => {
    if (!user || !user.pointsSystem) return null;

    let points = basePoints;
    if (!points) {
      switch (type) {
        case 'education':
          const level = metadata?.level || 'iniciante';
          points = POINTS_CONFIG.education[level as keyof typeof POINTS_CONFIG.education] as number;
          break;
        case 'chat':
          points = POINTS_CONFIG.chat.message;
          break;
        case 'simulation':
          points = POINTS_CONFIG.simulation.basic;
          break;
        case 'onboarding':
          points = POINTS_CONFIG.onboarding.complete;
          break;
        case 'dashboard':
          points = POINTS_CONFIG.dashboard.quickAction;
          break;
        default:
          points = 1;
      }
    }

    if (!checkCooldown(user.pointsSystem.activityHistory, type)) {
      return { pointsEarned: 0, levelUp: false, newBadges: [] };
    }

    const result = addActivity(user.pointsSystem, type, activity, points, metadata);

    const totalPoints = result.updatedSystem.activityHistory.reduce(
      (sum: number, record: ActivityRecord) => sum + record.pointsEarned, 
      0
    );

    const updatedUser: User = {
      ...user,
      points: totalPoints,
      pointsSystem: result.updatedSystem,
    };

    await updateUser(updatedUser);

    return {
      pointsEarned: result.pointsEarned,
      levelUp: result.levelUp,
      newBadges: result.newBadges,
    };
  };

  const getUserLevel = () => {
    if (!user?.pointsSystem) return null;
    
    return {
      level: user.pointsSystem.level,
      name: user.pointsSystem.levelName,
      color: '#FFD700',
      multiplier: user.pointsSystem.multiplier,
    };
  };

  const getTotalPoints = (): number => {
    return user?.points || 0;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
        addPoints,
        getUserLevel,
        getTotalPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 