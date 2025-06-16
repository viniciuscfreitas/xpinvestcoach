import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexto/ContextoAuth';
import { useTheme } from '../../contexto/ContextoTema';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: signOut
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleRedoQuiz = () => {
    Alert.alert(
      'Refazer Questionário',
      'Quer refazer o teste de perfil? Isso vai atualizar suas recomendações de investimento! 📊',
      [
        { text: 'Não, obrigado', style: 'cancel' },
        { 
          text: 'Bora refazer!', 
          style: 'default',
          onPress: () => navigation.navigate('Onboarding' as never)
        },
      ]
    );
  };

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

  const getExperienceLabel = (experience: string): string => {
    switch (experience) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return experience;
    }
  };

  const getObjectiveLabel = (objective: string): string => {
    switch (objective) {
      case 'crescimento': return 'Crescimento';
      case 'renda': return 'Renda';
      case 'reserva': return 'Reserva de Emergência';
      case 'aposentadoria': return 'Aposentadoria';
      default: return objective;
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <MaterialIcons name="error" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Ops! Algo deu errado 😅</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <MaterialIcons name="person" size={28} color={colors.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                Meu Perfil
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Configurações e informações
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.surface }]}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={styles.userHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: '#000' }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              {user.phone && (
                <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                  {user.phone}
                </Text>
              )}
            </View>
          </View>
          
          <View style={[styles.pointsSection, { borderTopColor: colors.border }]}>
            <MaterialIcons name="stars" size={24} color={colors.primary} />
            <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
              Pontos XP Acumulados
            </Text>
            <Text style={[styles.pointsValue, { color: colors.text }]}>{user.points}</Text>
          </View>
        </View>

        {user.profile && (
          <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="assessment" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Perfil de Investidor
              </Text>
            </View>
            
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Perfil de Risco:
                </Text>
                <View style={[styles.riskBadge, { 
                  backgroundColor: getRiskColor(user.profile.riskScore) 
                }]}>
                  <Text style={styles.riskText}>
                    {getRiskProfileText(user.profile.riskScore)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Experiência:
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  {getExperienceLabel(user.profile.experience)}
                </Text>
              </View>
              
              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Objetivo Principal:
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  {getObjectiveLabel(user.profile.objective)}
                </Text>
              </View>
              
              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Score de Risco:
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  {user.profile.riskScore}/10
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.redoButton, { borderColor: colors.primary }]}
              onPress={handleRedoQuiz}
            >
              <MaterialIcons name="refresh" size={20} color={colors.primary} />
              <Text style={[styles.redoButtonText, { color: colors.primary }]}>
                Refazer Questionário
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="settings" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Configurações</Text>
          </View>
          
          <View style={styles.settingsList}>
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons 
                  name={isDark ? "dark-mode" : "light-mode"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Tema {isDark ? 'Escuro' : 'Claro'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? '#FFD700' : '#f4f3f4'}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications" size={20} color={colors.textSecondary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Notificações
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={notificationsEnabled ? '#FFD700' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="bar-chart" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Estatísticas</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {user.points}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pontos Ganhos
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Membro desde
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => Alert.alert('Suporte', 'Opa! Em breve você vai poder falar com a gente direto por aqui! 😊')}
          >
            <MaterialIcons name="help" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Central de Ajuda</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => Alert.alert('Sobre o App', 'XP Invest Coach v1.0\nFeito com muito ❤️ pra você!')}
          >
            <MaterialIcons name="info" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Sobre o App</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: colors.error }]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
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
    marginLeft: 12,
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
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  userCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  pointsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  pointsLabel: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileCard: {
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
  profileGrid: {
    gap: 12,
    marginBottom: 16,
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
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  redoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  redoButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  settingsList: {
    gap: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    marginLeft: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen; 