const express = require('express');
const db = require('../database');

const router = express.Router();

// Obter histórico de votos
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  
  db.getVoteHistory(limit, (err, votes) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar histórico de votos' });
    }
    res.json(votes);
  });
});

// Registrar voto manual (para testes)
router.post('/vote', (req, res) => {
  const { team_id, gift_id, username } = req.body;

  if (!team_id || !gift_id || !username) {
    return res.status(400).json({ error: 'team_id, gift_id e username são obrigatórios' });
  }

  db.addVote(team_id, gift_id, username, (err, voteId) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao registrar voto' });
    }

    res.status(201).json({
      id: voteId,
      team_id: team_id,
      gift_id: gift_id,
      username: username,
      message: 'Voto registrado com sucesso'
    });

    // Emitir evento via Socket.io para atualizar em tempo real
    if (global.io) {
      global.io.emit('new_vote', {
        team_id: team_id,
        gift_id: gift_id,
        username: username,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Obter estatísticas de votação
router.get('/stats', (req, res) => {
  const queries = {
    totalVotes: 'SELECT COUNT(*) as total FROM votes',
    votesByTeam: `
      SELECT t.id, t.name, t.votes, t.logo_path 
      FROM teams t 
      ORDER BY t.votes DESC
    `,
    votesByGift: `
      SELECT g.name, g.tiktok_id, COUNT(v.id) as vote_count 
      FROM gifts g 
      LEFT JOIN votes v ON g.id = v.gift_id 
      GROUP BY g.id 
      ORDER BY vote_count DESC
    `,
    recentVotes: `
      SELECT v.*, t.name as team_name, g.name as gift_name 
      FROM votes v 
      JOIN teams t ON v.team_id = t.id 
      JOIN gifts g ON v.gift_id = g.id 
      ORDER BY v.timestamp DESC 
      LIMIT 10
    `
  };

  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    if (key === 'totalVotes') {
      db.db.get(queries[key], [], (err, result) => {
        if (!err) stats[key] = result.total;
        completed++;
        if (completed === total) res.json(stats);
      });
    } else {
      db.db.all(queries[key], [], (err, result) => {
        if (!err) stats[key] = result;
        completed++;
        if (completed === total) res.json(stats);
      });
    }
  });
});

// Resetar todos os votos
router.post('/reset', (req, res) => {
  db.db.serialize(() => {
    db.db.run('DELETE FROM votes', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao resetar votos' });
      }
      
      db.db.run('UPDATE teams SET votes = 0, updated_at = CURRENT_TIMESTAMP', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao resetar contadores dos times' });
        }

        res.json({ message: 'Todos os votos foram resetados com sucesso' });

        // Emitir evento via Socket.io
        if (global.io) {
          global.io.emit('votes_reset');
        }
      });
    });
  });
});

// Obter configurações do sistema
router.get('/settings', (req, res) => {
  const settings = {};
  const settingsKeys = ['background_image', 'tiktok_username', 'live_status'];
  
  let completed = 0;
  settingsKeys.forEach(key => {
    db.getSetting(key, (err, result) => {
      if (!err && result) {
        settings[key] = result.value;
      }
      completed++;
      if (completed === settingsKeys.length) {
        res.json(settings);
      }
    });
  });
});

// Atualizar configurações do sistema
router.post('/settings', (req, res) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Chave da configuração é obrigatória' });
  }

  db.setSetting(key, value, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar configuração' });
    }

    res.json({ message: 'Configuração salva com sucesso' });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('setting_updated', { key, value });
    }
  });
});

module.exports = router;

