import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor Socket.io');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.io');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro de conexão Socket.io:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Adicionar listener para eventos
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }

    this.socket.on(event, callback);
    
    // Armazenar referência para poder remover depois
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remover listener específico
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }

    // Remover da lista de listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Remover todos os listeners de um evento
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
    this.listeners.delete(event);
  }

  // Emitir evento
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Verificar se está conectado
  isConnected() {
    return this.socket?.connected || false;
  }

  // Métodos específicos para eventos do aplicativo
  onTeamCreated(callback) {
    this.on('team_created', callback);
  }

  onTeamDeleted(callback) {
    this.on('team_deleted', callback);
  }

  onVotesUpdated(callback) {
    this.on('votes_updated', callback);
  }

  onVotesReset(callback) {
    this.on('votes_reset', callback);
  }

  onNewVote(callback) {
    this.on('new_vote', callback);
  }

  onGiftConfigured(callback) {
    this.on('gift_configured', callback);
  }

  onGiftUpdated(callback) {
    this.on('gift_updated', callback);
  }

  onGiftDeleted(callback) {
    this.on('gift_deleted', callback);
  }

  onTikTokConnected(callback) {
    this.on('tiktok_connected', callback);
  }

  onTikTokDisconnected(callback) {
    this.on('tiktok_disconnected', callback);
  }

  onTikTokError(callback) {
    this.on('tiktok_error', callback);
  }

  onTikTokGift(callback) {
    this.on('tiktok_gift', callback);
  }

  onTikTokComment(callback) {
    this.on('tiktok_comment', callback);
  }

  onTikTokMemberJoin(callback) {
    this.on('tiktok_member_join', callback);
  }

  onTikTokLike(callback) {
    this.on('tiktok_like', callback);
  }

  onSettingUpdated(callback) {
    this.on('setting_updated', callback);
  }
}

// Exportar instância singleton
const socketService = new SocketService();
export default socketService;

