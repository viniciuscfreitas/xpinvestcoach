import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexto/ContextoTema';

import TelaInicial from '../telas/TelaInicial';
import TelaAuth from '../telas/Autenticacao/TelaAuth';
import TelaLogin from '../telas/Autenticacao/TelaLogin';
import TelaCadastro from '../telas/Autenticacao/TelaCadastro';
import TelaOnboarding from '../telas/Integracao/TelaOnboarding';
import TelaDashboard from '../telas/Painel/TelaDashboard';
import TelaChat from '../telas/Chat/TelaChat';
import TelaSimulacao from '../telas/Simulacao/TelaSimulacao';
import TelaEducacao from '../telas/Educacao/TelaEducacao';
import TelaPerfil from '../telas/Perfil/TelaPerfil';
import TelaEditarPerfil from '../telas/Perfil/TelaEditarPerfil';
import TelaConquistas from '../telas/Conquistas/TelaConquistas';

import { RootStackParamList } from '../tipos';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={TelaDashboard}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={TelaChat}
        options={{
          tabBarLabel: 'Assistente',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Simulation" 
        component={TelaSimulacao}
        options={{
          tabBarLabel: 'Simulador',
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Education" 
        component={TelaEducacao}
        options={{
          tabBarLabel: 'Educação',
          tabBarIcon: ({ color }) => <MaterialIcons name="school" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={TelaPerfil}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={TelaInicial} />
        <Stack.Screen name="Auth" component={TelaAuth} />
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Register" component={TelaCadastro} />
        <Stack.Screen name="Onboarding" component={TelaOnboarding} />
        <Stack.Screen name="EditProfile" component={TelaEditarPerfil} />
        <Stack.Screen name="Achievements" component={TelaConquistas} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 