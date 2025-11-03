![Thumbnail escrito React: implementando técnicas modernas de Debugging e Release com Next](https://github.com/gss-patricia/4863-code-connect-debugging/blob/main/thumbnail.png?raw=true)

![](https://img.shields.io/github/license/alura-cursos/android-com-kotlin-personalizando-ui)

# React: implementando técnicas modernas de Debugging e Release com Next

Code-connect aplicação focada em rede social para pessoas desenvolvedoras, com área logada, permite registrar uma nova conta, listar posts, comentar e dar likes em cada post.

## 🔨 Funcionalidades do projeto

O projeto implementa uma rede social completa com:

- **Home Page**: Lista de posts
- **Página de Post**: Detalhes individuais do post
- **Busca em Tempo Real**: Sistema de busca client-side com hook personalizado
- **API Routes**: Endpoints para detalhe do post e comentarios
- **Camada de Dados**: Abstração para interação com Supabase

## ✔️ Técnicas Modernas de Debugging e Release Implementadas

### 🔧 **Configuração do Ambiente e Banco de Dados**

- **Variáveis de ambiente** - Configuração de credenciais Supabase e chaves de API
- **Scripts SQL** - Estruturação do banco de dados com autenticação e relacionamentos
- **Supabase Auth** - Integração de autenticação OAuth (Google, GitHub)

### 🔐 **Autenticação e Rotas Protegidas**

- **Server-side authentication** - Middleware para validar tokens em cada request
- **Client-side protection** - Hooks customizados (`useAuth`, `useProtectedRoute`)
- **Área logada completa** - Dashboard com posts, comentários e interactions
- **Logout seguro** - Limpeza de cookies e redirecionamento automático

### 🐛 **Ferramentas de Depuração Avançadas**

- **DevTools do Browser** - Inspeção de elementos, Network e Console
- **React Developer Tools** - Profiling de componentes e análise de renders
- **VS Code Debugger** - Debug de Server Components e API Routes com breakpoints
- **Server-side Debugging** - Conexão direta do DevTools com o servidor Next.js

```bash
# Ativar debug do servidor
yarn run dev:debug  # NODE_OPTIONS='--inspect'
```

### 📊 **Logs Estruturados com Winston**

- **Winston Logger** - Biblioteca robusta para logs em níveis (info, error, warn)
- **Transporte múltiplo** - Logs em arquivo e console simultâneamente
- **Contexto de eventos** - Captura de userId, timestamp, timezone e ambiente
- **Separação de logs** - `combined.log` (todos) e `error.log` (apenas erros)

```javascript
import { logEvent, logEventError } from "../eventLogger";

logEvent({ step: "AUTH", operation: "LOGIN_SUCCESS", userId });
logEventError({ step: "API", operation: "GET_POST_ERROR", userId, error });
```

### 📍 **Logs de Aplicação vs Logs de Negócio**

- **Logs de aplicação** - Erros técnicos, stack traces, debugging (servidor)
- **Logs de negócio** - Eventos do usuário, conversões, comportamentos (cliente + servidor)
- **Cliente vs Servidor** - Diferenças técnicas (Winston no servidor, console no cliente)
- **Conformidade** - Respeito a LGPD/GDPR ao logar dados de usuários

### 🚀 **Feature Flags com GrowthBook**

- **GrowthBook SDK** - Integração de feature flags dinâmicas sem redeploy
- **Client Provider** - `GrowthBookProvider` para ativar hooks em toda a aplicação
- **useFeatureValue hook** - Consumir feature flags em componentes React

```javascript
const showUpdateTime = useFeatureValue("show-update-time", false);
```

### 🎯 **Estratégias de Feature Flags**

- **Por constantes** - Valores hardcoded para testes locais
- **Por variáveis de ambiente** - Controle via `NEXT_PUBLIC_` ou `APP_ENV`
- **Por API (GrowthBook)** - Dashboard para ativar/desativar sem código
- **Rollouts graduais** - Ativar para 10% → 50% → 100% dos usuários
- **Rollbacks instantâneos** - Desativar feature sem redeploy em caso de bug

### 📦 **Deploy vs Release**

- **Deploy** - Publicar código novo na infraestrutura (Vercel)
- **Release** - Ativar funcionalidade para usuários (via feature flag)
- **Benefícios** - Desacoplamento entre deploy e disponibilidade da feature
- **Segurança** - Testar em produção antes de liberar para todos

### ☁️ **Deploy na Vercel**

- **CI/CD automático** - Deploy automático a cada push
- **Ambiente de preview** - URLs de preview para cada PR
- **Production readiness** - Variáveis de ambiente seguras e performance monitorada
- **Observabilidade** - Logs e analytics em tempo real no dashboard Vercel

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **React 18** - Hooks, Server/Client Components
- **Supabase** - Backend as a Service
- **CSS Modules** - Estilização modular
- **Node.js 20+** - Runtime JavaScript

### **Pré-requisitos**

- Node.js 20+
- NPM ou Yarn
- Conta Supabase (configurada)

### **Instalação**

```bash
# Inicie o servidor de desenvolvimento
yarn run dev
```

## 📚 Mais informações

Este projeto foi desenvolvido para demonstrar as diferentes estratégias de renderização do Next.js de forma prática e educativa, mostrando quando e como usar cada uma delas em cenários reais.

---
