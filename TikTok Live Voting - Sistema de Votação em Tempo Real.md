# TikTok Live Voting - Sistema de Votação em Tempo Real

Um aplicativo completo em Node.js integrado com tiktok-live-connector para votação de times de futebol através de presentes do TikTok durante lives.

## 📋 Funcionalidades

### ✅ Funcionalidades Implementadas

- **Tela de Login**: Autenticação com username do TikTok
- **Gerenciamento de Times**: Cadastro de times com upload de logos personalizados
- **Sistema de Votação**: Contabilização automática de votos através de presentes do TikTok
- **Configuração de Presentes**: Mapeamento de presentes do TikTok para times específicos
- **Interface em Tempo Real**: Atualizações instantâneas via Socket.io
- **Dashboard Moderno**: Interface responsiva e intuitiva
- **Integração TikTok Live**: Conexão direta com lives do TikTok
- **Sistema de Upload**: Upload de imagens para logos e presentes
- **Simulação de Testes**: Ferramenta para simular presentes durante desenvolvimento

## 🏗️ Arquitetura

### Backend (Node.js + Express)
- **Servidor Express** com CORS habilitado
- **Banco de dados SQLite** para persistência
- **Socket.io** para comunicação em tempo real
- **tiktok-live-connector** para integração com TikTok
- **Multer** para upload de arquivos
- **JWT** para autenticação

### Frontend (React + Vite)
- **React 19** com hooks modernos
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Socket.io Client** para tempo real
- **Axios** para requisições HTTP
- **Lucide React** para ícones

## 📁 Estrutura do Projeto

```
tiktok-voting-app/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Rotas de autenticação
│   │   ├── teams.js         # Gerenciamento de times
│   │   ├── gifts.js         # Configuração de presentes
│   │   ├── voting.js        # Sistema de votação
│   │   └── tiktok.js        # Integração TikTok Live
│   ├── server.js            # Servidor principal
│   ├── database.js          # Configuração do banco
│   ├── tiktokLiveService.js # Serviço TikTok Live
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Contextos (Auth)
│   │   ├── services/        # Serviços (API, Socket)
│   │   └── App.jsx
│   └── package.json
├── uploads/
│   ├── teams/              # Logos dos times
│   ├── gifts/              # Imagens de presentes
│   └── backgrounds/        # Imagens de fundo
└── README.md
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm
- Git

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd tiktok-voting-app
```

### 2. Configuração do Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente (opcional)
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

### 3. Configuração do Frontend
```bash
cd ../frontend
pnpm install
# ou npm install
```

## 🎮 Como Usar

### 1. Iniciar o Backend
```bash
cd backend
npm start
```
O servidor estará disponível em `http://localhost:3001`

### 2. Iniciar o Frontend
```bash
cd frontend
pnpm run dev --host
# ou npm run dev -- --host
```
A aplicação estará disponível em `http://localhost:5174`

### 3. Acessar a Aplicação

1. **Login**: Acesse a aplicação e faça login com um username do TikTok (ex: @seuusername)

2. **Cadastrar Times**: 
   - Vá para a aba "Times"
   - Adicione times de futebol com logos personalizados
   - Os times aparecerão no ranking com 0 votos inicialmente

3. **Configurar Presentes**:
   - Vá para a aba "Presentes"
   - Veja a lista de presentes disponíveis do TikTok
   - Configure quais presentes contam para cada time
   - Opcionalmente, faça upload de imagens personalizadas

4. **Conectar ao TikTok Live**:
   - Vá para a aba "Conexão"
   - Insira seu username do TikTok
   - Clique em "Conectar à Live"
   - A aplicação se conectará à sua live em tempo real

5. **Acompanhar Votação**:
   - Vá para a aba "Votação"
   - Veja o ranking dos times em tempo real
   - Acompanhe a atividade recente de presentes
   - Os votos são atualizados automaticamente

## 🔧 Funcionalidades Detalhadas

### Sistema de Autenticação
- Login simples com username do TikTok
- Validação de formato (@username)
- Token JWT para sessões
- Logout seguro

### Gerenciamento de Times
- Cadastro com nome e logo
- Upload de imagens PNG/JPG (máx 5MB)
- Contagem de votos em tempo real
- Ranking automático por votos
- Opção de resetar votos

### Configuração de Presentes
- Lista de presentes padrão do TikTok
- Mapeamento presente → time
- Upload de imagens personalizadas
- Gerenciamento de associações

### Integração TikTok Live
- Conexão em tempo real com lives
- Detecção automática de presentes
- Contabilização instantânea de votos
- Logs de atividade da live
- Simulação para testes

### Interface em Tempo Real
- Atualizações via Socket.io
- Ranking dinâmico
- Notificações de novos votos
- Estatísticas em tempo real
- Atividade recente

## 🛠️ Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm start          # Iniciar servidor
npm run dev        # Modo desenvolvimento (com nodemon)
```

**Frontend:**
```bash
pnpm run dev       # Servidor de desenvolvimento
pnpm run build     # Build para produção
pnpm run preview   # Preview do build
```

### Estrutura da API

**Autenticação:**
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout

**Times:**
- `GET /api/teams` - Listar times
- `POST /api/teams` - Criar time
- `PUT /api/teams/:id/votes` - Atualizar votos
- `DELETE /api/teams/:id` - Deletar time
- `POST /api/teams/reset-votes` - Resetar votos

**Presentes:**
- `GET /api/gifts` - Listar configurações
- `GET /api/gifts/available` - Presentes disponíveis
- `POST /api/gifts` - Configurar presente
- `PUT /api/gifts/:id` - Atualizar configuração
- `DELETE /api/gifts/:id` - Deletar configuração

**Votação:**
- `GET /api/voting/history` - Histórico de votos
- `POST /api/voting/vote` - Registrar voto manual
- `GET /api/voting/stats` - Estatísticas
- `POST /api/voting/reset` - Resetar votação

**TikTok Live:**
- `POST /api/tiktok/connect` - Conectar à live
- `POST /api/tiktok/disconnect` - Desconectar
- `GET /api/tiktok/status` - Status da conexão
- `POST /api/tiktok/simulate-gift` - Simular presente

### Eventos Socket.io

**Times:**
- `team_created` - Novo time criado
- `team_deleted` - Time deletado
- `votes_updated` - Votos atualizados
- `votes_reset` - Votos resetados

**Presentes:**
- `gift_configured` - Presente configurado
- `gift_updated` - Configuração atualizada
- `gift_deleted` - Configuração deletada

**TikTok Live:**
- `tiktok_connected` - Conectado à live
- `tiktok_disconnected` - Desconectado
- `tiktok_error` - Erro na conexão
- `tiktok_gift` - Presente recebido
- `tiktok_comment` - Comentário na live
- `tiktok_member_join` - Usuário entrou
- `tiktok_like` - Likes recebidos

**Votação:**
- `new_vote` - Novo voto registrado

## 🎯 Casos de Uso

### Streamer de Futebol
1. Cria times dos principais clubes
2. Configura presentes populares (Rose, Heart, etc.)
3. Conecta à live durante transmissão
4. Viewers enviam presentes para votar
5. Ranking atualiza em tempo real na tela

### Evento Esportivo
1. Cadastra times participantes
2. Define presentes específicos por valor
3. Exibe ranking durante evento
4. Acompanha engajamento da audiência

### Competição Interativa
1. Cria múltiplos times/opções
2. Permite votação via presentes
3. Mostra resultados em tempo real
4. Gera estatísticas detalhadas

## 🔒 Segurança

- Validação de entrada em todas as rotas
- Sanitização de uploads de arquivo
- Limitação de tamanho de arquivos (5MB)
- Autenticação JWT
- CORS configurado
- Prevenção de ataques comuns

## 📊 Banco de Dados

### Tabelas

**users** - Usuários do sistema
- id, username, password_hash, created_at

**teams** - Times cadastrados
- id, name, logo_path, votes, created_at, updated_at

**gifts** - Configuração de presentes
- id, name, tiktok_id, image_path, team_id, created_at

**votes** - Histórico de votos
- id, team_id, gift_id, username, timestamp

**settings** - Configurações do sistema
- id, key, value, updated_at

## 🚀 Deploy

### Produção
1. Configure variáveis de ambiente
2. Build do frontend: `pnpm run build`
3. Configure servidor web (nginx/apache)
4. Configure SSL/HTTPS
5. Configure domínio
6. Inicie serviços

### Docker (Opcional)
```dockerfile
# Exemplo de Dockerfile para o backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para dúvidas e suporte:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs do servidor

## 🔄 Atualizações

### Versão 1.0.0
- ✅ Sistema completo de votação
- ✅ Integração TikTok Live
- ✅ Interface moderna e responsiva
- ✅ Tempo real com Socket.io
- ✅ Upload de imagens
- ✅ Gerenciamento completo

### Próximas Versões
- 🔄 Sistema de moderação
- 🔄 Múltiplas lives simultâneas
- 🔄 Relatórios avançados
- 🔄 Integração com outras plataformas
- 🔄 Temas personalizáveis

---

**Desenvolvido com ❤️ usando Node.js, React e TikTok Live Connector**

