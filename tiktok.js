const express = require('express');
const tiktokLiveService = require('../tiktokLiveService');

const router = express.Router();

// Conectar à live do TikTok
router.post('/connect', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username é obrigatório' });
    }

    const result = await tiktokLiveService.connect(username);
    res.json({
      success: true,
      message: `Conectado à live de @${result.username}`,
      username: result.username
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Desconectar da live
router.post('/disconnect', async (req, res) => {
  try {
    await tiktokLiveService.disconnect();
    res.json({
      success: true,
      message: 'Desconectado da live do TikTok'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obter status da conexão
router.get('/status', (req, res) => {
  const status = tiktokLiveService.getStatus();
  res.json(status);
});

// Atualizar mapeamentos de presentes
router.post('/refresh-mappings', (req, res) => {
  tiktokLiveService.updateGiftMappings();
  res.json({
    success: true,
    message: 'Mapeamentos de presentes atualizados'
  });
});

// Simular presente (para testes)
router.post('/simulate-gift', (req, res) => {
  try {
    const { giftName, giftId, username, repeatCount } = req.body;

    if (!giftName || !giftId || !username) {
      return res.status(400).json({ 
        error: 'giftName, giftId e username são obrigatórios' 
      });
    }

    const result = tiktokLiveService.simulateGift(
      giftName, 
      giftId, 
      username, 
      repeatCount || 1
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

