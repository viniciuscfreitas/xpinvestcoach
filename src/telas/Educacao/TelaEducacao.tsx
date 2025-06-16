import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexto/ContextoAuth';
import { useTheme } from '../../contexto/ContextoTema';
import { mockEducationContent, getEducationContentByLevel } from '../../servicos/dadosSimulados';
import { EducationContent, Badge } from '../../tipos';

const { width } = Dimensions.get('window');

const EducationScreen = () => {
  const { user, updateUser, addPoints, getUserLevel } = useAuth();
  const { colors } = useTheme();
  const [content, setContent] = useState<EducationContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [filteredContent, setFilteredContent] = useState<EducationContent[]>([]);
  const [readingArticle, setReadingArticle] = useState<string | null>(null);

  const categories = useMemo(() => ['Todos', 'Básico', 'Renda Fixa', 'Renda Variável', 'Estratégia', 'Comportamento'], []);

  useEffect(() => {
    if (user?.profile) {
      const personalizedContent = getEducationContentByLevel(user.profile.experience);
      const uniqueContent = mockEducationContent.filter(content => 
        !personalizedContent.some(pc => pc.id === content.id)
      );
      setContent([...personalizedContent, ...uniqueContent]);
    } else {
      setContent(mockEducationContent);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredContent(content);
    } else {
      setFilteredContent(content.filter(item => item.category === selectedCategory));
    }
  }, [content, selectedCategory]);

  const handleReadArticle = async (article: EducationContent) => {
    if (!user) return;

    setReadingArticle(article.id);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await addPoints('education', `Leu artigo: ${article.title}`, undefined, {
      level: article.level,
      category: article.category,
      articleId: article.id,
    });

    if (result) {
      let message = `Show! Você ganhou ${result.pointsEarned} pontos por ler "${article.title}"! 🚀`;
      
      if (result.levelUp) {
        const userLevel = getUserLevel();
        message += `\n\n🎉 LEVEL UP! Agora você é ${userLevel?.name} (Nível ${userLevel?.level})!`;
        message += `\n✨ Multiplicador de pontos: ${userLevel?.multiplier}x`;
      }

      if (result.newBadges.length > 0) {
        message += `\n\n🏆 Novo(s) Badge(s) Desbloqueado(s):`;
        result.newBadges.forEach((badge: Badge) => {
          message += `\n• ${badge.name}: ${badge.description}`;
        });
      }

      Alert.alert(
        'Artigo Lido! 📚',
        message,
        [{ text: 'Bora continuar!', style: 'default' }]
      );
    }
    
    setReadingArticle(null);
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'iniciante': return colors.success;
      case 'intermediario': return colors.warning;
      case 'avancado': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getLevelIcon = (level: string): keyof typeof MaterialIcons.glyphMap => {
    switch (level) {
      case 'iniciante': return 'trending-up';
      case 'intermediario': return 'show-chart';
      case 'avancado': return 'analytics';
      default: return 'school';
    }
  };

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
          <View style={styles.headerContent}>
            <MaterialIcons name="school" size={28} color={colors.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Educação Financeira</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Aprenda e ganhe pontos!</Text>
            </View>
          </View>
          <View style={[styles.pointsBadge, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="stars" size={16} color={colors.primary} />
            <Text style={[styles.pointsText, { color: colors.primary }]}>{user.points}</Text>
          </View>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="trending-up" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Seu Progresso</Text>
          </View>
          <View style={styles.progressContent}>
            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Nível Atual:</Text>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(user.profile?.experience || 'iniciante') }]}>
                <Text style={styles.levelText}>{user.profile?.experience || 'iniciante'}</Text>
              </View>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Artigos recomendados:</Text>
              <Text style={[styles.progressValue, { color: colors.text }]}>{filteredContent.length}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Pontos totais:</Text>
              <Text style={[styles.progressValue, { color: colors.text }]}>{user.points}</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorias</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.border },
                  selectedCategory === category && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: colors.text },
                  selectedCategory === category && { color: '#000' }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'Todos' ? 'Todos os Artigos' : selectedCategory}
          </Text>
          
          {filteredContent.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="menu-book" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Ops! Não achei nada aqui ainda 🤔</Text>
            </View>
          ) : (
            filteredContent.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={[
                  styles.articleCard, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    opacity: readingArticle === article.id ? 0.7 : 1
                  }
                ]}
                onPress={() => handleReadArticle(article)}
                disabled={readingArticle !== null}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleTitleContainer}>
                    <MaterialIcons 
                      name={getLevelIcon(article.level)} 
                      size={20} 
                      color={getLevelColor(article.level)} 
                    />
                    <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>
                  </View>
                  <View style={[styles.pointsIndicator, { backgroundColor: colors.border }]}>
                    <MaterialIcons name="stars" size={16} color={colors.primary} />
                    <Text style={[styles.pointsIndicatorText, { color: colors.primary }]}>+{article.points}</Text>
                  </View>
                </View>
                
                <Text style={[styles.articleContent, { color: colors.textSecondary }]} numberOfLines={3}>
                  {article.content}
                </Text>
                
                <View style={styles.articleFooter}>
                  <View style={styles.articleMeta}>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(article.level) }]}>
                      <Text style={styles.levelText}>{article.level}</Text>
                    </View>
                    <View style={styles.readTimeContainer}>
                      <MaterialIcons name="schedule" size={14} color={colors.textSecondary} />
                      <Text style={[styles.readTime, { color: colors.textSecondary }]}>{article.readTime} min</Text>
                    </View>
                  </View>
                  {readingArticle === article.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lightbulb" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Dicas de Aprendizado</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Leia pelo menos 1 artigo por dia</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Comece pelos artigos básicos</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Pratique com as simulações</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Tire dúvidas com o assistente</Text>
            </View>
          </View>
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
    borderBottomColor: '#333',
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
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  progressContent: {
    gap: 12,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#999',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FFD700',
  },
  categoryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#000',
  },
  contentContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  articleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  pointsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsIndicatorText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  articleContent: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  tipsCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#CCC',
    marginLeft: 8,
    flex: 1,
  },
});

export default EducationScreen; 