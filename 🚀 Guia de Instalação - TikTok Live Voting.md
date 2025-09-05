# 🚀 Guia de Instalação - TikTok Live Voting

Este guia fornece instruções detalhadas para instalar e configurar o sistema TikTok Live Voting.

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** versão 18 ou superior
- **npm** ou **pnpm** (recomendado)
- **Git** para controle de versão
- **Sistema Operacional**: Windows, macOS ou Linux

### Verificar Instalações
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar pnpm (opcional)
pnpm --version

# Verificar Git
git --version
```

## 📥 Download e Configuração

### 1. Obter o Código
```bash
# Clone o repositório (substitua pela URL real)
git clone https://github.com/seu-usuario/tiktok-voting-app.git

# Entre no diretório
cd tiktok-voting-app

# Verifique a estrutura
ls -la
```

### 2. Configuração do Backend

```bash
# Entre no diretório do backend
cd backend

# Instale as dependências
npm install

# Verifique se todas as dependências foram instaladas
npm list
```

#### Dependências do Backend
- express: Servidor web
- socket.io: Comunicação em tempo real
- tiktok-live-connector: Integração TikTok
- sqlite3: Banco de dados
- cors: Configuração CORS
- multer: Upload de arquivos
- bcryptjs: Hash de senhas
- jsonwebtoken: Autenticação JWT
- dotenv: Variáveis de ambiente
- uuid: Geração de IDs únicos

### 3. Configuração do Frontend

```bash
# Volte ao diretório raiz
cd ..

# Entre no diretório do frontend
cd frontend

# Instale as dependências (recomendado: pnpm)
pnpm install

# Ou use npm se preferir
# npm install

# Verifique se todas as dependências foram instaladas
pnpm list
```

#### Dependências do Frontend
- react: Framework frontend
- vite: Build tool
- tailwindcss: CSS framework
- socket.io-client: Cliente Socket.io
- axios: Cliente HTTP
- lucide-react: Ícones
- shadcn/ui: Componentes UI

## ⚙️ Configuração de Ambiente

### 1. Variáveis de Ambiente (Backend)

Crie um arquivo `.env` no diretório `backend/`:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Configurações do servidor
PORT=3001

# Chave secreta para JWT (mude para uma chave segura)
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# Configurações do TikTok Live
TIKTOK_USERNAME=

# Configurações do banco de dados
DB_PATH=./tiktok_voting.db

# Configurações de upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=../uploads
```

### 2. Estrutura de Diretórios

Certifique-se de que os diretórios de upload existem:
```bash
# No diretório raiz do projeto
mkdir -p uploads/teams
mkdir -p uploads/gifts
mkdir -p uploads/backgrounds

# Verificar estrutura
tree uploads/
```

## 🚀 Primeira Execução

### 1. Iniciar o Backend

```bash
# No diretório backend
cd backend

# Iniciar o servidor
npm start

# Você deve ver:
# Conectado ao banco de dados SQLite.
# Tabelas do banco de dados inicializadas.
# Servidor rodando na porta 3001
# API disponível em: http://localhost:3001/api
```

### 2. Testar o Backend

Em outro terminal:
```bash
# Testar API de saúde
curl http://localhost:3001/api/health

# Resposta esperada:
# {"status":"OK","message":"TikTok Voting API está funcionando!"}
```

### 3. Iniciar o Frontend

```bash
# No diretório frontend
cd frontend

# Iniciar servidor de desenvolvimento
pnpm run dev --host

# Ou com npm:
# npm run dev -- --host

# Você deve ver:
# VITE v6.x.x ready in XXXms
# ➜ Local:   http://localhost:5174/
# ➜ Network: http://xxx.xxx.xxx.xxx:5174/
```

### 4. Acessar a Aplicação

Abra seu navegador e acesse:
- **Local**: http://localhost:5174
- **Rede**: Use o IP mostrado no terminal

## ✅ Verificação da Instalação

### 1. Teste de Login
1. Acesse a aplicação
2. Digite um username (ex: @testuser)
3. Clique em "Entrar"
4. Deve aparecer o dashboard

### 2. Teste de Funcionalidades
1. **Times**: Adicione um time de teste
2. **Presentes**: Veja a lista de presentes disponíveis
3. **Conexão**: Veja o status da conexão TikTok
4. **Votação**: Veja o ranking (vazio inicialmente)

### 3. Teste de API
```bash
# Testar criação de time
curl -X POST http://localhost:3001/api/teams \
  -H "Content-Type: application/json" \
  -d '{"name":"Time Teste"}'

# Testar listagem de times
curl http://localhost:3001/api/teams
```

## 🔧 Solução de Problemas

### Problemas Comuns

#### 1. Erro "EADDRINUSE" (Porta em uso)
```bash
# Verificar processos na porta 3001
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>

# Ou usar porta diferente no .env
PORT=3002
```

#### 2. Erro de Dependências
```bash
# Limpar cache npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Para pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 3. Erro de Permissões (Linux/macOS)
```bash
# Dar permissões aos diretórios
chmod -R 755 uploads/
chmod -R 755 backend/
chmod -R 755 frontend/
```

#### 4. Banco de Dados Corrompido
```bash
# Deletar banco e reiniciar
rm backend/tiktok_voting.db

# Reiniciar backend (criará novo banco)
cd backend && npm start
```

#### 5. Problemas de CORS
Verifique se o backend está configurado para aceitar requisições do frontend:
- Backend: http://localhost:3001
- Frontend: http://localhost:5174

### Logs e Debugging

#### Backend
```bash
# Ver logs detalhados
cd backend
DEBUG=* npm start

# Ou apenas logs da aplicação
npm start | tee backend.log
```

#### Frontend
```bash
# Ver logs do Vite
cd frontend
pnpm run dev --debug

# Verificar console do navegador (F12)
```

## 🔄 Atualizações

### Atualizar Dependências
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
pnpm update
```

### Backup do Banco
```bash
# Fazer backup do banco de dados
cp backend/tiktok_voting.db backend/tiktok_voting.db.backup

# Restaurar backup
cp backend/tiktok_voting.db.backup backend/tiktok_voting.db
```

## 🌐 Configuração de Rede

### Acesso Externo
Para permitir acesso de outros dispositivos na rede:

1. **Backend**: Já configurado para `0.0.0.0:3001`
2. **Frontend**: Use `--host` no comando de desenvolvimento
3. **Firewall**: Libere as portas 3001 e 5174

### Configuração de Proxy (Opcional)
Para usar um domínio personalizado, configure um proxy reverso (nginx/apache).

## 📱 Teste em Dispositivos Móveis

1. Conecte dispositivos na mesma rede
2. Use o IP da rede mostrado pelo Vite
3. Acesse: http://SEU_IP:5174
4. Teste responsividade e funcionalidades

## 🚀 Próximos Passos

Após a instalação bem-sucedida:

1. **Configurar TikTok**: Conecte à sua live real
2. **Personalizar**: Adicione seus times e logos
3. **Testar**: Use a simulação de presentes
4. **Deploy**: Configure para produção se necessário

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do backend e frontend
2. Consulte a seção de solução de problemas
3. Verifique se todas as dependências estão instaladas
4. Teste as APIs individualmente
5. Abra uma issue no repositório

---

**Instalação concluída com sucesso! 🎉**

