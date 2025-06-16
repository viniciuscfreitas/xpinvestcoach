import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexto/ContextoAuth';
import { useTheme } from '../../contexto/ContextoTema';
import { getPortfolioRecommendations } from '../../servicos/dadosSimulados';
import { Investment, Badge } from '../../tipos';

const { width } = Dimensions.get('window');

const SimulationScreen = () => {
  const { user, updateUser, addPoints, getUserLevel } = useAuth();
  const { colors } = useTheme();
  const [recommendations, setRecommendations] = useState<Investment[]>([]);
  const [selectedInvestments, setSelectedInvestments] = useState<{ [key: string]: number }>({});
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>({});
  const [totalInvested, setTotalInvested] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      const recs = getPortfolioRecommendations(user.profile);
      setRecommendations(recs);
      
      const quickSelection: { [key: string]: number } = {};
      const investmentAmount = user.profile.investmentAmount;
      
      recs.forEach((investment: Investment, index: number) => {
        if (index < 3) {
          const percentage = index === 0 ? 0.5 : index === 1 ? 0.3 : 0.2;
          quickSelection[investment.id] = Math.round(investmentAmount * percentage);
        }
      });
      
      setSelectedInvestments(quickSelection);
      calculateTotalInvested(quickSelection);
    }
  }, [user]);

  const calculateTotalInvested = (investments: { [key: string]: number }) => {
    const total = Object.values(investments).reduce((sum, amount) => sum + amount, 0);
    setTotalInvested(total);
  };

  const updateInvestmentAmount = useCallback((investmentId: string, amount: number) => {
    const newSelections = {
      ...selectedInvestments,
      [investmentId]: Math.max(0, amount),
    };
    setSelectedInvestments(newSelections);
    calculateTotalInvested(newSelections);
  }, [selectedInvestments]);

  const updateCustomAmount = (investmentId: string, text: string) => {
    setCustomAmounts(prev => ({ ...prev, [investmentId]: text }));
    
    const amount = parseFloat(text.replace(/[^\d]/g, '')) || 0;
    updateInvestmentAmount(investmentId, amount);
  };

  const getInvestmentAmountOptions = useMemo(() => (minAmount: number) => {
    const options = [minAmount];
    
    if (user?.profile?.investmentAmount) {
      const userAmount = user.profile.investmentAmount;
      const percentages = [0.1, 0.2, 0.3, 0.5];
      
      percentages.forEach(pct => {
        const amount = Math.round(userAmount * pct);
        if (amount >= minAmount && !options.includes(amount)) {
          options.push(amount);
        }
      });
    }
    
    return options.sort((a, b) => a - b);
  }, [user?.profile?.investmentAmount]);

  const runSimulation = async () => {
    if (totalInvested === 0) {
      Alert.alert('Opa!', 'Você precisa escolher pelo menos um investimento pra simular! 😊');
      return;
    }

    setIsSimulating(true);

    const selectedInvs = recommendations.filter(inv => 
      selectedInvestments[inv.id] && selectedInvestments[inv.id] > 0
    );

    if (selectedInvs.length === 0) {
      Alert.alert('Opa!', 'Escolha pelo menos um investimento válido pra gente simular! 💡');
      return;
    }

    let totalReturn = 0;
    let weightedRisk = 0;
    let totalWeight = 0;

    selectedInvs.forEach(investment => {
      const amount = selectedInvestments[investment.id];
      const weight = amount / totalInvested;
      
      totalReturn += investment.expectedReturn * weight;
      
      const riskValue = investment.risk === 'baixo' ? 1 : 
                        investment.risk === 'medio' ? 2 : 3;
      weightedRisk += riskValue * weight;
      totalWeight += weight;
    });

    const projectedReturn1Year = totalInvested * (totalReturn / 100);
    const projectedReturn5Years = totalInvested * Math.pow(1 + totalReturn / 100, 5) - totalInvested;

    const result = {
      investments: selectedInvs.map(inv => ({
        ...inv,
        amount: selectedInvestments[inv.id],
        percentage: (selectedInvestments[inv.id] / totalInvested) * 100,
      })),
      totalInvested,
      expectedReturn: totalReturn,
      riskLevel: weightedRisk <= 1.5 ? 'Baixo' : weightedRisk <= 2.5 ? 'Médio' : 'Alto',
      projectedReturn1Year,
      projectedReturn5Years,
    };

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSimulationResult(result);
    setIsSimulating(false);

    if (user) {
      let basePoints = 30;
      let bonusPoints = 0;
      
      if (selectedInvs.length >= 3) {
        bonusPoints += 20;
      }
      
      const avgCompatibility = selectedInvs.reduce((sum, inv) => sum + inv.compatibility, 0) / selectedInvs.length;
      if (avgCompatibility > 80) {
        bonusPoints += 30;
      }

      const pointsResult = await addPoints('simulation', 'Simulação de carteira concluída', basePoints + bonusPoints, {
        totalInvested,
        assetsCount: selectedInvs.length,
        avgCompatibility,
        expectedReturn: totalReturn,
        riskLevel: result.riskLevel,
      });

      if (pointsResult) {
        let message = `Simulação concluída! 🎯\n\nVocê ganhou ${pointsResult.pointsEarned} pontos!`;
        message += `\n• Pontos base: ${basePoints}`;
        
        if (bonusPoints > 0) {
          message += `\n• Bônus: ${bonusPoints}`;
          if (selectedInvs.length >= 3) message += `\n  - Diversificação: +20`;
          if (avgCompatibility > 80) message += `\n  - Carteira otimizada: +30`;
        }
        
        message += `\n\nSua carteira tem retorno esperado de ${totalReturn.toFixed(1)}% ao ano.`;

        if (pointsResult.levelUp) {
          const userLevel = getUserLevel();
          message += `\n\n🎉 LEVEL UP! Agora você é ${userLevel?.name} (Nível ${userLevel?.level})!`;
        }

        if (pointsResult.newBadges.length > 0) {
          message += `\n\n🏆 Novo(s) Badge(s):`;
          pointsResult.newBadges.forEach((badge: Badge) => {
            message += `\n• ${badge.name}`;
          });
        }

        Alert.alert('Parabéns! 🚀', message);
      }
    }
  };

  const resetSimulation = () => {
    setSelectedInvestments({});
    setTotalInvested(0);
    setSimulationResult(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'baixo': return colors.success;
      case 'médio': 
      case 'medio': return colors.warning;
      case 'alto': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (!user?.profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <MaterialIcons name="error" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Opa! Precisa completar seu perfil primeiro 😊</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <MaterialIcons name="bar-chart" size={28} color={colors.primary} />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>Simulador de Carteira</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Personalizadas para seu perfil {user.profile.riskTolerance}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.surface }]}
            onPress={resetSimulation}
          >
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha seus Investimentos</Text>
          
          {recommendations.map((investment) => (
            <View key={investment.id} style={[styles.investmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.investmentHeader}>
                <View style={styles.investmentInfo}>
                  <Text style={[styles.investmentName, { color: colors.text }]}>{investment.name}</Text>
                  <Text style={[styles.investmentDescription, { color: colors.textSecondary }]}>{investment.description}</Text>
                  
                  <View style={styles.investmentMetrics}>
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Retorno</Text>
                      <Text style={[styles.metricValue, { color: colors.success }]}>
                        {investment.expectedReturn.toFixed(1)}% a.a.
                      </Text>
                    </View>
                    
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Risco</Text>
                      <View style={[styles.riskBadge, { backgroundColor: getRiskColor(investment.risk) }]}>
                        <Text style={styles.riskText}>{investment.risk}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Compatibilidade</Text>
                      <Text style={[styles.metricValue, { color: colors.text }]}>{investment.compatibility}%</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.amountSelector}>
                <Text style={[styles.amountLabel, { color: colors.text }]}>
                  Valor Selecionado: R$ {(selectedInvestments[investment.id] || 0).toLocaleString()}
                </Text>
                
                <View style={styles.amountOptions}>
                  {getInvestmentAmountOptions(investment.minimumAmount).map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.amountButton,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        selectedInvestments[investment.id] === amount && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => updateInvestmentAmount(investment.id, amount)}
                    >
                      <Text style={[
                        styles.amountButtonText,
                        { color: colors.text },
                        selectedInvestments[investment.id] === amount && { color: '#000' }
                      ]}>
                        R$ {amount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  {selectedInvestments[investment.id] > 0 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => updateInvestmentAmount(investment.id, 0)}
                    >
                      <MaterialIcons name="remove-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.customAmountContainer, { borderTopColor: colors.border }]}>
                  <Text style={[styles.customAmountLabel, { color: colors.textSecondary }]}>
                    Ou digite um valor personalizado:
                  </Text>
                  <TextInput
                    style={[styles.customAmountInput, { 
                      backgroundColor: colors.background, 
                      borderColor: colors.border,
                      color: colors.text 
                    }]}
                    placeholder="Ex: 5000"
                    placeholderTextColor={colors.textSecondary}
                    value={customAmounts[investment.id] || ''}
                    onChangeText={(text) => updateCustomAmount(investment.id, text)}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo da Carteira</Text>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Investido</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>R$ {totalInvested.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Número de Ativos</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {Object.values(selectedInvestments).filter(amount => amount > 0).length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.simulateButton, 
              { 
                backgroundColor: colors.primary, 
                opacity: (totalInvested > 0 && !isSimulating) ? 1 : 0.5 
              }
            ]}
            onPress={runSimulation}
            disabled={totalInvested === 0 || isSimulating}
          >
            {isSimulating ? (
              <>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.simulateButtonText}>Simulando...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="play-arrow" size={24} color="#000" />
                <Text style={styles.simulateButtonText}>Simular Carteira</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {simulationResult && (
          <View style={[styles.resultsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.resultsHeader}>
              <MaterialIcons name="analytics" size={24} color={colors.success} />
              <Text style={[styles.resultsTitle, { color: colors.text }]}>Resultados da Simulação</Text>
            </View>

            <View style={styles.resultsGrid}>
              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Retorno Esperado</Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  {simulationResult.expectedReturn.toFixed(1)}% ao ano
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Nível de Risco</Text>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(simulationResult.riskLevel), alignSelf: 'center' }]}>
                  <Text style={styles.riskText}>{simulationResult.riskLevel}</Text>
                </View>
              </View>

              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Projeção 1 Ano</Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  +R$ {simulationResult.projectedReturn1Year.toLocaleString()}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Projeção 5 Anos</Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>
                  +R$ {simulationResult.projectedReturn5Years.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownSection}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>Composição da Carteira</Text>
              {simulationResult.investments.map((investment: any) => (
                <View key={investment.id} style={[styles.breakdownItem, { borderTopColor: colors.border }]}>
                  <View style={styles.breakdownInfo}>
                    <Text style={[styles.breakdownName, { color: colors.text }]}>{investment.name}</Text>
                    <Text style={[styles.breakdownAmount, { color: colors.textSecondary }]}>
                      R$ {investment.amount.toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[styles.breakdownPercentage, { color: colors.text }]}>
                    {investment.percentage.toFixed(1)}%
                  </Text>
                </View>
              ))}
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
    textAlign: 'center',
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
    flex: 1,
    marginLeft: 12,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  investmentCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  investmentHeader: {
    marginBottom: 15,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  investmentDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
  },
  investmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  amountSelector: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  amountLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '500',
  },
  amountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  amountButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#666',
  },
  selectedAmountButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  amountButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedAmountButtonText: {
    color: '#000000',
  },
  removeButton: {
    padding: 4,
  },
  customAmountContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  customAmountLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  customAmountInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 40,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryContent: {
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  simulateButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  simulateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  resultsCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
    justifyContent: 'center',
  },
  resultItem: {
    alignItems: 'center',
    width: (width - 80) / 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  resultLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
    textAlign: 'center',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  breakdownSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  breakdownPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default SimulationScreen; 