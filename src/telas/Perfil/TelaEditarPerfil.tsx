import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexto/ContextoAuth';
import { useTheme } from '../../contexto/ContextoTema';
import { useNavigation } from '@react-navigation/native';

const TelaEditarPerfil = () => {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [validation, setValidation] = useState({
    name: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasFormChanges = 
      formData.name !== (user?.name || '') ||
      formData.email !== (user?.email || '') ||
      formData.phone !== (user?.phone || '');
    
    setHasChanges(hasFormChanges);
  }, [formData, user]);

  const validateName = (name: string) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return { isValid: false, message: 'Nome é obrigatório! 😊' };
    }
    
    if (trimmedName.length < 2) {
      return { isValid: false, message: 'Nome muito curto!' };
    }
    
    const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
    if (nameParts.length < 2) {
      return { isValid: false, message: 'Digite seu nome completo!' };
    }
    
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, message: 'Use apenas letras no nome!' };
    }
    
    return { isValid: true, message: 'Nome válido! ✅' };
  };

  const validateEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      return { isValid: false, message: 'Email é obrigatório! 📧' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: 'Formato de email inválido!' };
    }
    
    return { isValid: true, message: 'Email válido! ✅' };
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return { isValid: true, message: 'Telefone é opcional' };
    }
    
    const phoneNumbers = phone.replace(/\D/g, '');
    
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return { isValid: false, message: 'Telefone deve ter 10 ou 11 dígitos!' };
    }
    
    return { isValid: true, message: 'Telefone válido! ✅' };
  };

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'phone') {
      processedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    let validationResult;
    switch (field) {
      case 'name':
        validationResult = validateName(value);
        break;
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'phone':
        validationResult = validatePhone(value);
        break;
      default:
        return;
    }
    
    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const handleSave = async () => {
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);

    setValidation({
      name: nameValidation,
      email: emailValidation,
      phone: phoneValidation,
    });

    if (!nameValidation.isValid || !emailValidation.isValid || !phoneValidation.isValid) {
      Alert.alert(
        'Ops! 🤔',
        'Alguns campos precisam ser corrigidos antes de salvar.',
        [{ text: 'Beleza!', style: 'default' }]
      );
      return;
    }

    if (!hasChanges) {
      Alert.alert(
        'Tudo certo! ✅',
        'Não há alterações para salvar.',
        [{ text: 'Ok!', style: 'default' }]
      );
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const updatedUser = {
        ...user,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
      };

      await updateUser(updatedUser);

      Alert.alert(
        'Sucesso! 🎉',
        'Suas informações foram atualizadas com sucesso!',
        [
          {
            text: 'Show!',
            style: 'default',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Ops! 😅',
        'Algo deu errado ao salvar. Tenta de novo!',
        [{ text: 'Ok', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Tem certeza que quer sair?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const getInputStyle = (field: keyof typeof validation) => {
    const baseStyle = [styles.input, { 
      backgroundColor: colors.surface, 
      borderColor: colors.border,
      color: colors.text 
    }];
    
    if (!validation[field].isValid) {
      baseStyle.push({ 
        borderColor: colors.error, 
        borderWidth: 2,
        backgroundColor: colors.surface,
        color: colors.text
      });
    } else if (validation[field].message.includes('✅')) {
      baseStyle.push({ 
        borderColor: colors.success, 
        borderWidth: 2,
        backgroundColor: colors.surface,
        color: colors.text
      });
    }
    
    return baseStyle;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Editar Perfil
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.headerButton, { opacity: hasChanges ? 1 : 0.5 }]}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, { color: colors.primary }]}>
                Salvar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Seus Dados
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Deixa tudo certinho aqui pra gente 😊
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nome Completo *
              </Text>
              <TextInput
                style={getInputStyle('name')}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {validation.name.message ? (
                <Text style={[
                  styles.validationText, 
                  { color: validation.name.isValid ? colors.success : colors.error }
                ]}>
                  {validation.name.message}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email *
              </Text>
              <TextInput
                style={getInputStyle('email')}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              {validation.email.message ? (
                <Text style={[
                  styles.validationText, 
                  { color: validation.email.isValid ? colors.success : colors.error }
                ]}>
                  {validation.email.message}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Telefone
              </Text>
              <TextInput
                style={getInputStyle('phone')}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
              {validation.phone.message ? (
                <Text style={[
                  styles.validationText, 
                  { color: validation.phone.isValid ? colors.success : colors.error }
                ]}>
                  {validation.phone.message}
                </Text>
              ) : null}
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Campos marcados com * são obrigatórios
              </Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Segurança
            </Text>
            <TouchableOpacity 
              style={[styles.securityButton, { borderColor: colors.border }]}
              onPress={() => {
                Alert.alert(
                  'Alterar Senha',
                  'Essa funcionalidade estará disponível em breve! 🔐',
                  [{ text: 'Beleza!', style: 'default' }]
                );
              }}
            >
              <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
              <Text style={[styles.securityButtonText, { color: colors.text }]}>
                Alterar Senha
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  validationText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  securityButtonText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default TelaEditarPerfil; 