const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Configuração do multer para upload de logos dos times
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/teams');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif)'));
    }
  }
});

// Listar todos os times
router.get('/', (req, res) => {
  db.getAllTeams((err, teams) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar times' });
    }
    res.json(teams);
  });
});

// Criar novo time
router.post('/', upload.single('logo'), (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome do time é obrigatório' });
  }

  const logoPath = req.file ? `/uploads/teams/${req.file.filename}` : null;

  db.createTeam(name, logoPath, (err, teamId) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar time' });
    }

    res.status(201).json({
      id: teamId,
      name: name,
      logo_path: logoPath,
      votes: 0,
      message: 'Time criado com sucesso'
    });

    // Emitir evento via Socket.io para atualizar clientes em tempo real
    if (global.io) {
      global.io.emit('team_created', {
        id: teamId,
        name: name,
        logo_path: logoPath,
        votes: 0
      });
    }
  });
});

// Atualizar votos de um time
router.put('/:id/votes', (req, res) => {
  const teamId = req.params.id;
  const { votes } = req.body;

  if (votes === undefined || votes < 0) {
    return res.status(400).json({ error: 'Número de votos inválido' });
  }

  db.updateTeamVotes(teamId, votes, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar votos' });
    }

    res.json({ message: 'Votos atualizados com sucesso' });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('votes_updated', {
        team_id: teamId,
        votes: votes
      });
    }
  });
});

// Deletar time
router.delete('/:id', (req, res) => {
  const teamId = req.params.id;

  db.deleteTeam(teamId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar time' });
    }

    res.json({ message: 'Time deletado com sucesso' });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('team_deleted', { team_id: teamId });
    }
  });
});

// Resetar votos de todos os times
router.post('/reset-votes', (req, res) => {
  db.db.run('UPDATE teams SET votes = 0, updated_at = CURRENT_TIMESTAMP', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao resetar votos' });
    }

    res.json({ message: 'Votos resetados com sucesso' });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('votes_reset');
    }
  });
});

module.exports = router;

