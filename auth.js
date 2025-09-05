const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tiktok_voting_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rota de login
router.post('/login', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username é obrigatório' });
  }

  // Para simplificar, vamos apenas verificar se o username é válido do TikTok
  // Em uma implementação real, você poderia validar com a API do TikTok
  if (!username.startsWith('@')) {
    return res.status(400).json({ error: 'Username deve começar com @' });
  }

  // Gerar token JWT
  const token = jwt.sign(
    { username: username },
    process.env.JWT_SECRET || 'tiktok_voting_secret',
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login realizado com sucesso',
    token: token,
    username: username
  });
});

// Rota para verificar se o token é válido
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    username: req.user.username
  });
});

// Rota de logout (apenas remove o token do lado do cliente)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;

