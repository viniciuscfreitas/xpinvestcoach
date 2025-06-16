import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexto/ContextoAuth';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          if (user.profile) {
            navigation.navigate('Main' as never);
          } else {
            navigation.navigate('Onboarding' as never);
          }
        } else {
          navigation.navigate('Auth' as never);
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, user, loading]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/xp_branco.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.3,
  },
});

export default SplashScreen; 