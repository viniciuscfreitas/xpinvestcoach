import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexto/ContextoAuth';
import { ThemeProvider } from './src/contexto/ContextoTema';
import AppNavigator from './src/navegacao/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#000000" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
