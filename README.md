# 🚀 XP Invest Coach

**Seu assistente pessoal para investimentos inteligentes**

Um aplicativo mobile desenvolvido em React Native que oferece educação financeira personalizada, simulações de carteira e assistência inteligente para investimentos.

## 📱 Sobre o Projeto

O XP Invest Coach é uma plataforma educacional gamificada que ajuda usuários a aprender sobre investimentos de forma interativa e personalizada. O app oferece recomendações baseadas no perfil do investidor, simulações de carteira, conteúdo educacional e um sistema de pontuação que incentiva o aprendizado contínuo.

### 🎯 Funcionalidades Principais

- **📊 Dashboard Personalizado**: Visão geral dos investimentos e ações rápidas
- **🤖 Chat Inteligente**: Assistente virtual para tirar dúvidas sobre investimentos
- **💼 Simulador de Carteira**: Simule diferentes estratégias de investimento
- **📚 Educação Financeira**: Artigos categorizados por nível de experiência
- **🏆 Sistema de Gamificação**: Pontos, níveis, badges e conquistas
- **👤 Perfil de Investidor**: Questionário para definir perfil de risco
- **🌙 Tema Escuro/Claro**: Interface adaptável às preferências do usuário

## 🎨 Design

O design do aplicativo foi criado no Figma e pode ser visualizado através do link:
**[🔗 Protótipo no Figma](https://www.figma.com/design/WGB5Y3rz9kpOe2s8wBPrAD/XP-Invest-Coach?node-id=0-1&t=FnemdBwgBQ8pcW41-1)**

## 👨‍💻 Desenvolvedor

**Vinícius do Carmo Fonseca Freitas**
- [LinkedIn](https://www.linkedin.com/in/vin%C3%ADcius-freitas-5656ab2ab/)
- [GitHub](https://github.com/viniciuscfreitas)
- [Portfólio](https://viniciuscfreitas.dev)

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **TypeScript** - Linguagem de programação tipada
- **Expo** - Plataforma de desenvolvimento React Native
- **React Navigation** - Navegação entre telas
- **AsyncStorage** - Armazenamento local de dados
- **React Context API** - Gerenciamento de estado global
- **Expo Vector Icons** - Ícones do Material Design

## 📱 Funcionalidades Detalhadas

### 🔐 Autenticação
- Cadastro de novos usuários
- Login com email e senha
- Persistência de sessão
- Validação de formulários

### 🎯 Onboarding
- Questionário de perfil de investidor
- Definição de tolerância ao risco
- Configuração de objetivos financeiros
- Cálculo automático do score de risco

### 📊 Dashboard
- Resumo do perfil de investidor
- Recomendações personalizadas
- Ações rápidas (simulação, educação, chat)
- Sistema de pontuação e níveis

### 💬 Chat Inteligente
- Respostas contextuais sobre investimentos
- Detecção de perguntas educacionais
- Sistema de pontuação por interação
- Interface com animações suaves

### 🎲 Simulador de Carteira
- Recomendações baseadas no perfil
- Seleção de valores de investimento
- Cálculo de retorno esperado e risco
- Projeções de 1 e 5 anos
- Sistema de pontuação por diversificação

### 📚 Educação Financeira
- Artigos categorizados por nível
- Sistema de pontuação por leitura
- Filtros por categoria
- Indicadores de progresso

### 🏆 Sistema de Gamificação
- **Pontos**: Ganhe pontos por atividades
- **Níveis**: Sistema de progressão com multiplicadores
- **Badges**: Conquistas especiais desbloqueáveis
- **Metas Diárias**: Objetivos diários com recompensas
- **Estatísticas**: Acompanhe seu progresso

### 👤 Perfil do Usuário
- Edição de informações pessoais
- Visualização de estatísticas
- Configurações de tema
- Opção de refazer questionário

## 🏗️ Arquitetura do Projeto

```
src/
├── componentes/          # Componentes reutilizáveis
├── contexto/            # Contextos React (Auth, Tema)
├── navegacao/           # Configuração de navegação
├── servicos/            # Lógica de negócio e dados
├── telas/               # Telas do aplicativo
│   ├── Autenticacao/    # Login, Cadastro
│   ├── Chat/            # Chat inteligente
│   ├── Conquistas/      # Sistema de gamificação
│   ├── Educacao/        # Conteúdo educacional
│   ├── Integracao/      # Onboarding
│   ├── Painel/          # Dashboard
│   ├── Perfil/          # Perfil do usuário
│   └── Simulacao/       # Simulador de carteira
├── tipos/               # Definições TypeScript
└── utilitarios/         # Funções auxiliares
```

## 🎮 Sistema de Pontuação

### Atividades que Geram Pontos:
- **Leitura de Artigos**: 15-40 pontos (baseado no nível)
- **Mensagens no Chat**: 1-3 pontos (educacionais valem mais)
- **Simulações**: 30+ pontos (bônus por diversificação)
- **Onboarding**: 100 pontos
- **Ações Rápidas**: 5 pontos

### Sistema de Níveis:
1. **Iniciante** (0-99 pts) - Multiplicador 1.0x
2. **Aprendiz** (100-299 pts) - Multiplicador 1.2x
3. **Estudante** (300-599 pts) - Multiplicador 1.5x
4. **Investidor** (600-999 pts) - Multiplicador 1.8x
5. **Expert** (1000-1999 pts) - Multiplicador 2.0x
6. **Mestre** (2000+ pts) - Multiplicador 2.5x

## 📊 Dados e Persistência

- **AsyncStorage**: Armazenamento local de dados do usuário
- **Dados Simulados**: Sistema completo de dados mock para demonstração
- **Persistência de Sessão**: Login automático
- **Backup de Dados**: Sincronização entre dispositivos (futuro)

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/viniciuscfreitas/xpinvestcoach.git
cd xpinvestcoach
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npx expo start
```

4. Use o Expo Go no seu dispositivo móvel ou um emulador para visualizar o app.

## 🎯 Objetivos do Projeto

Este projeto foi desenvolvido com o objetivo de demonstrar habilidades em:

- **Desenvolvimento Mobile**: React Native com TypeScript
- **UX/UI Design**: Interface intuitiva e responsiva
- **Arquitetura de Software**: Organização modular e escalável
- **Gerenciamento de Estado**: Context API e AsyncStorage
- **Gamificação**: Sistema de pontuação e engajamento
- **Educação Financeira**: Conteúdo educacional estruturado

## 🚀 Próximos Passos

### Funcionalidades Futuras:
- [ ] Integração com APIs reais de investimentos
- [ ] Notificações push
- [ ] Compartilhamento social
- [ ] Modo offline avançado
- [ ] Análise de carteira real
- [ ] Integração com bancos
- [ ] Relatórios detalhados
- [ ] Comunidade de investidores

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ por Vinícius do Carmo Fonseca Freitas**