import { Investment, ChatMessage, EducationContent, InvestorProfile, Portfolio } from '../tipos';

export const mockInvestments: Investment[] = [
  {
    id: '1',
    name: 'Tesouro Selic',
    type: 'renda-fixa',
    risk: 'baixo',
    expectedReturn: 12.5,
    minimumAmount: 100,
    description: 'Título público pós-fixado, ideal para reserva de emergência',
    compatibility: 0,
  },
  {
    id: '2',
    name: 'CDB XP',
    type: 'renda-fixa',
    risk: 'baixo',
    expectedReturn: 13.2,
    minimumAmount: 1000,
    description: 'Certificado de Depósito Bancário com boa rentabilidade',
    compatibility: 0,
  },
  {
    id: '3',
    name: 'Fundo Multimercado',
    type: 'fundos',
    risk: 'medio',
    expectedReturn: 18.0,
    minimumAmount: 500,
    description: 'Fundo diversificado com gestão ativa',
    compatibility: 0,
  },
  {
    id: '4',
    name: 'ETF BOVA11',
    type: 'renda-variavel',
    risk: 'medio',
    expectedReturn: 22.0,
    minimumAmount: 300,
    description: 'ETF que replica o Ibovespa',
    compatibility: 0,
  },
  {
    id: '5',
    name: 'Ações VALE3',
    type: 'renda-variavel',
    risk: 'alto',
    expectedReturn: 28.0,
    minimumAmount: 200,
    description: 'Ações da Vale S.A.',
    compatibility: 0,
  },
  {
    id: '6',
    name: 'Bitcoin ETF',
    type: 'cripto',
    risk: 'alto',
    expectedReturn: 35.0,
    minimumAmount: 100,
    description: 'Exposição ao Bitcoin via ETF regulamentado',
    compatibility: 0,
  },
];

export const calculateInvestmentCompatibility = (
  investment: Investment,
  profile: InvestorProfile
): number => {
  let score = 0;

  const riskMapping: { [key: string]: { [key: string]: number } } = {
    conservador: { baixo: 100, medio: 30, alto: 0 },
    moderado: { baixo: 70, medio: 100, alto: 40 },
    arrojado: { baixo: 40, medio: 80, alto: 100 },
  };

  score += riskMapping[profile.riskTolerance][investment.risk] * 0.4;

  const experienceBonus: { [key: string]: number } = {
    iniciante: investment.type === 'renda-fixa' ? 30 : 0,
    intermediario: 20,
    avancado: investment.type === 'cripto' || investment.type === 'renda-variavel' ? 30 : 10,
  };

  score += experienceBonus[profile.experience];

  const objectiveBonus: { [key: string]: { [key: string]: number } } = {
    reserva: { 'renda-fixa': 40, fundos: 10, 'renda-variavel': 0, cripto: 0 },
    renda: { 'renda-fixa': 30, fundos: 40, 'renda-variavel': 20, cripto: 0 },
    crescimento: { 'renda-fixa': 10, fundos: 30, 'renda-variavel': 40, cripto: 30 },
    aposentadoria: { 'renda-fixa': 20, fundos: 40, 'renda-variavel': 30, cripto: 10 },
  };

  score += objectiveBonus[profile.objective][investment.type];

  return Math.min(Math.round(score), 100);
};

export const getPortfolioRecommendations = (profile: InvestorProfile): Investment[] => {
  const investmentsWithCompatibility = mockInvestments.map(investment => ({
    ...investment,
    compatibility: calculateInvestmentCompatibility(investment, profile),
  }));

  return investmentsWithCompatibility
    .filter(inv => inv.compatibility > 30)
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 5);
};

export const mockChatResponses: { [key: string]: string } = {
  'olá': 'E aí! 😊 Sou seu parceiro aqui na XP pra te ajudar com investimentos. No que posso dar uma força hoje?',
  'oi': 'Opa! 👋 Tô aqui pra tirar suas dúvidas sobre investimentos. Bora conversar sobre o que você quer saber?',
  'investimento': 'Cara, temos umas opções bem legais baseadas no seu perfil! Que tal dar uma olhada nas dicas que separei pra você?',
  'renda fixa': 'Então, renda fixa é tipo aquele investimento mais tranquilo, sabe? Tesouro, CDB... Perfeito pra quem tá começando ou não quer muito stress.',
  'renda variável': 'Renda variável é mais pra quem curte uma aventura! Ações, fundos... Pode render mais, mas também tem mais risco. Recomendo só se você já manja um pouco.',
  'tesouro': 'Cara, Tesouro Direto é show! Super seguro, você pode sacar quando quiser e dá pra começar com só R$ 30. Ideal pra iniciantes mesmo.',
  'perfil': 'Seu perfil é baseado na sua idade, experiência, objetivos... essas coisas. Quer refazer o teste pra ver se mudou alguma coisa?',
  'risco': 'Risco é basicamente a chance de você perder grana. Quanto menor o risco, menor o retorno, mas você dorme tranquilo. É um trade-off.',
  'diversificação': 'Diversificar é tipo não colocar todos os ovos na mesma cesta, né? Espalha a grana em vários tipos de investimento pra não se ferrar se um der ruim.',
  'default': 'Interessante essa pergunta! 🤔 Me conta mais detalhes que eu te ajudo melhor. Ou então dá uma olhada nas dicas que preparei pra você!',
};

export const getChatResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  for (const [key, response] of Object.entries(mockChatResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return mockChatResponses.default;
};

export const mockEducationContent: EducationContent[] = [
  {
    id: '1',
    title: 'O que é Renda Fixa?',
    content: 'Renda fixa são investimentos onde você empresta dinheiro e recebe uma remuneração previsível. São considerados mais seguros que renda variável.',
    category: 'Básico',
    level: 'iniciante',
    readTime: 3,
    points: 10,
  },
  {
    id: '2',
    title: 'Tesouro Direto para Iniciantes',
    content: 'O Tesouro Direto é a forma mais segura de investir no Brasil. Você empresta dinheiro para o governo e recebe juros em troca.',
    category: 'Renda Fixa',
    level: 'iniciante',
    readTime: 5,
    points: 15,
  },
  {
    id: '3',
    title: 'Diversificação de Carteira',
    content: 'Diversificar significa investir em diferentes tipos de ativos para reduzir riscos e otimizar retornos.',
    category: 'Estratégia',
    level: 'intermediario',
    readTime: 7,
    points: 20,
  },
  {
    id: '4',
    title: 'Análise Fundamentalista',
    content: 'Aprenda a analisar empresas através de seus fundamentos: receita, lucro, dívidas e perspectivas futuras.',
    category: 'Renda Variável',
    level: 'avancado',
    readTime: 10,
    points: 30,
  },
  {
    id: '5',
    title: 'Psicologia do Investidor',
    content: 'Entenda como as emoções podem afetar suas decisões de investimento e aprenda a controlá-las.',
    category: 'Comportamento',
    level: 'intermediario',
    readTime: 6,
    points: 18,
  },
];

export const getEducationContentByLevel = (level: string): EducationContent[] => {
  return mockEducationContent.filter(content => 
    content.level === level || content.level === 'iniciante'
  );
};

export const calculateRiskScore = (profile: InvestorProfile): number => {
  let score = 0;

  if (profile.age < 30) score += 3;
  else if (profile.age < 50) score += 2;
  else score += 1;

  const experienceScore: { [key: string]: number } = {
    iniciante: 1,
    intermediario: 2,
    avancado: 3,
  };
  score += experienceScore[profile.experience];

  const riskScore: { [key: string]: number } = {
    conservador: 1,
    moderado: 2,
    arrojado: 3,
  };
  score += riskScore[profile.riskTolerance];

  if (profile.investmentAmount > 50000) score += 1;

  return Math.min(score, 10);
}; 