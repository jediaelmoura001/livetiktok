const { WebcastPushConnection } = require('tiktok-live-connector');
const db = require('./database');

class TikTokLiveService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.currentUsername = null;
    this.giftMappings = new Map(); // Mapeia gift_id -> team_id
    this.loadGiftMappings();
  }

  // Carrega os mapeamentos de presentes para times do banco de dados
  loadGiftMappings() {
    db.getAllGifts((err, gifts) => {
      if (!err && gifts) {
        this.giftMappings.clear();
        gifts.forEach(gift => {
          if (gift.team_id) {
            this.giftMappings.set(gift.tiktok_id, gift.team_id);
          }
        });
        console.log('Mapeamentos de presentes carregados:', this.giftMappings.size);
      }
    });
  }

  // Conecta à live do TikTok
  async connect(username) {
    try {
      if (this.isConnected) {
        await this.disconnect();
      }

      // Remove @ se presente
      const cleanUsername = username.replace('@', '');
      this.currentUsername = cleanUsername;

      // Cria nova conexão
      this.connection = new WebcastPushConnection(cleanUsername, {
        processInitialData: false,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 1000,
        sessionId: null,
        clientParams: {},
        requestHeaders: {},
        websocketHeaders: {},
        requestOptions: {
          timeout: 10000,
        },
      });

      // Configura eventos
      this.setupEventListeners();

      // Conecta
      await this.connection.connect();
      this.isConnected = true;

      console.log(`Conectado à live de @${cleanUsername}`);
      
      // Emite evento de conexão via Socket.io
      if (global.io) {
        global.io.emit('tiktok_connected', {
          username: cleanUsername,
          timestamp: new Date().toISOString()
        });
      }

      return { success: true, username: cleanUsername };

    } catch (error) {
      console.error('Erro ao conectar à live do TikTok:', error.message);
      this.isConnected = false;
      
      // Emite evento de erro via Socket.io
      if (global.io) {
        global.io.emit('tiktok_error', {
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      throw error;
    }
  }

  // Desconecta da live
  async disconnect() {
    try {
      if (this.connection) {
        await this.connection.disconnect();
        this.connection = null;
      }
      this.isConnected = false;
      this.currentUsername = null;

      console.log('Desconectado da live do TikTok');
      
      // Emite evento de desconexão via Socket.io
      if (global.io) {
        global.io.emit('tiktok_disconnected', {
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Erro ao desconectar:', error.message);
    }
  }

  // Configura os listeners de eventos da live
  setupEventListeners() {
    if (!this.connection) return;

    // Evento de presente recebido
    this.connection.on('gift', (data) => {
      this.handleGift(data);
    });

    // Evento de comentário
    this.connection.on('chat', (data) => {
      console.log(`${data.uniqueId} comentou: ${data.comment}`);
      
      // Emite comentário via Socket.io
      if (global.io) {
        global.io.emit('tiktok_comment', {
          username: data.uniqueId,
          comment: data.comment,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Evento de usuário entrando na live
    this.connection.on('member', (data) => {
      console.log(`${data.uniqueId} entrou na live`);
      
      // Emite evento via Socket.io
      if (global.io) {
        global.io.emit('tiktok_member_join', {
          username: data.uniqueId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Evento de like
    this.connection.on('like', (data) => {
      console.log(`${data.uniqueId} deu ${data.likeCount} likes`);
      
      // Emite evento via Socket.io
      if (global.io) {
        global.io.emit('tiktok_like', {
          username: data.uniqueId,
          likeCount: data.likeCount,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Evento de erro
    this.connection.on('error', (err) => {
      console.error('Erro na conexão TikTok Live:', err);
      
      // Emite evento de erro via Socket.io
      if (global.io) {
        global.io.emit('tiktok_error', {
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Evento de desconexão
    this.connection.on('disconnected', () => {
      console.log('Conexão TikTok Live perdida');
      this.isConnected = false;
      
      // Emite evento via Socket.io
      if (global.io) {
        global.io.emit('tiktok_disconnected', {
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Processa presente recebido
  handleGift(giftData) {
    try {
      const { uniqueId, giftName, giftId, repeatCount = 1 } = giftData;
      
      console.log(`${uniqueId} enviou ${repeatCount}x ${giftName} (ID: ${giftId})`);

      // Verifica se o presente está mapeado para algum time
      const teamId = this.giftMappings.get(giftId.toString()) || this.giftMappings.get(giftName.toLowerCase());
      
      if (teamId) {
        // Registra o voto no banco de dados
        for (let i = 0; i < repeatCount; i++) {
          this.registerVote(teamId, giftId, uniqueId, giftName);
        }
      } else {
        console.log(`Presente ${giftName} não está configurado para nenhum time`);
      }

      // Emite evento de presente via Socket.io (independente de estar mapeado)
      if (global.io) {
        global.io.emit('tiktok_gift', {
          username: uniqueId,
          giftName: giftName,
          giftId: giftId,
          repeatCount: repeatCount,
          teamId: teamId || null,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Erro ao processar presente:', error);
    }
  }

  // Registra voto no banco de dados
  registerVote(teamId, giftId, username, giftName) {
    // Primeiro, busca o gift_id interno do banco
    db.db.get('SELECT id FROM gifts WHERE tiktok_id = ? OR name = ?', [giftId.toString(), giftName], (err, gift) => {
      const internalGiftId = gift ? gift.id : null;
      
      if (internalGiftId) {
        db.addVote(teamId, internalGiftId, username, (err, voteId) => {
          if (err) {
            console.error('Erro ao registrar voto:', err);
          } else {
            console.log(`Voto registrado: ${username} -> Time ${teamId} (${giftName})`);
            
            // Emite evento de novo voto via Socket.io
            if (global.io) {
              global.io.emit('new_vote', {
                team_id: teamId,
                gift_id: internalGiftId,
                username: username,
                gift_name: giftName,
                timestamp: new Date().toISOString()
              });
            }
          }
        });
      } else {
        console.log(`Presente ${giftName} não encontrado no banco de dados`);
      }
    });
  }

  // Atualiza mapeamentos de presentes
  updateGiftMappings() {
    this.loadGiftMappings();
  }

  // Retorna status da conexão
  getStatus() {
    return {
      isConnected: this.isConnected,
      username: this.currentUsername,
      giftMappingsCount: this.giftMappings.size
    };
  }

  // Simula presente para testes
  simulateGift(giftName, giftId, username, repeatCount = 1) {
    if (!this.isConnected) {
      throw new Error('Não conectado à live do TikTok');
    }

    const giftData = {
      uniqueId: username,
      giftName: giftName,
      giftId: giftId,
      repeatCount: repeatCount
    };

    this.handleGift(giftData);
    return { success: true, message: 'Presente simulado com sucesso' };
  }
}

module.exports = new TikTokLiveService();

