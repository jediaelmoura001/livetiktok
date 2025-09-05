const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importar rotas
const authRoutes = require('./routes/auth');
const teamsRoutes = require('./routes/teams');
const giftsRoutes = require('./routes/gifts');
const votingRoutes = require('./routes/voting');
const tiktokRoutes = require('./routes/tiktok');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/tiktok', tiktokRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TikTok Voting API está funcionando!' });
});

// Configuração do Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
  
  // Eventos personalizados serão adicionados aqui
});

// Tornar io disponível globalmente
global.io = io;

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
});

module.exports = { app, server, io };

