const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Configuração do multer para upload de imagens de presentes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/gifts');
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

// Lista de presentes padrão do TikTok (alguns exemplos)
const defaultTikTokGifts = [
  { name: 'Rose', tiktok_id: 'rose', description: 'Rosa' },
  { name: 'Perfume', tiktok_id: 'perfume', description: 'Perfume' },
  { name: 'Heart', tiktok_id: 'heart', description: 'Coração' },
  { name: 'GG', tiktok_id: 'gg', description: 'GG' },
  { name: 'Ice Cream', tiktok_id: 'ice_cream', description: 'Sorvete' },
  { name: 'Kiss', tiktok_id: 'kiss', description: 'Beijo' },
  { name: 'Gift Box', tiktok_id: 'gift_box', description: 'Caixa de Presente' },
  { name: 'Rainbow', tiktok_id: 'rainbow', description: 'Arco-íris' },
  { name: 'Star', tiktok_id: 'star', description: 'Estrela' },
  { name: 'Lollipop', tiktok_id: 'lollipop', description: 'Pirulito' },
  { name: 'Diamond', tiktok_id: 'diamond', description: 'Diamante' },
  { name: 'Crown', tiktok_id: 'crown', description: 'Coroa' },
  { name: 'Sports Car', tiktok_id: 'sports_car', description: 'Carro Esportivo' },
  { name: 'Yacht', tiktok_id: 'yacht', description: 'Iate' },
  { name: 'Rocket', tiktok_id: 'rocket', description: 'Foguete' }
];

// Listar todos os presentes disponíveis do TikTok
router.get('/available', (req, res) => {
  res.json(defaultTikTokGifts);
});

// Listar todos os presentes configurados
router.get('/', (req, res) => {
  db.getAllGifts((err, gifts) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar presentes' });
    }
    res.json(gifts);
  });
});

// Configurar presente para um time
router.post('/', upload.single('image'), (req, res) => {
  const { name, tiktok_id, team_id } = req.body;

  if (!name || !tiktok_id) {
    return res.status(400).json({ error: 'Nome e ID do TikTok são obrigatórios' });
  }

  const imagePath = req.file ? `/uploads/gifts/${req.file.filename}` : null;

  db.createGift(name, tiktok_id, imagePath, team_id || null, (err, giftId) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Este presente já foi configurado' });
      }
      return res.status(500).json({ error: 'Erro ao configurar presente' });
    }

    res.status(201).json({
      id: giftId,
      name: name,
      tiktok_id: tiktok_id,
      image_path: imagePath,
      team_id: team_id,
      message: 'Presente configurado com sucesso'
    });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('gift_configured', {
        id: giftId,
        name: name,
        tiktok_id: tiktok_id,
        image_path: imagePath,
        team_id: team_id
      });
    }
  });
});

// Atualizar configuração de presente (associar a um time)
router.put('/:id', (req, res) => {
  const giftId = req.params.id;
  const { team_id } = req.body;

  db.updateGiftTeam(giftId, team_id, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar presente' });
    }

    res.json({ message: 'Presente atualizado com sucesso' });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('gift_updated', {
        gift_id: giftId,
        team_id: team_id
      });
    }
  });
});

// Deletar configuração de presente
router.delete('/:id', (req, res) => {
  const giftId = req.params.id;

  db.db.run('DELETE FROM gifts WHERE id = ?', [giftId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar presente' });
    }

    res.json({ message: 'Presente deletado com sucesso' });

    // Emitir evento via Socket.io
    if (global.io) {
      global.io.emit('gift_deleted', { gift_id: giftId });
    }
  });
});

module.exports = router;

