import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviços de autenticação
export const authService = {
  login: async (username) => {
    const response = await api.post('/auth/login', { username });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('username', response.data.username);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    return api.post('/auth/logout');
  },

  verify: () => {
    return api.get('/auth/verify');
  },

  getStoredUsername: () => {
    return localStorage.getItem('username');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

// Serviços de times
export const teamsService = {
  getAll: () => api.get('/teams'),
  create: (formData) => api.post('/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateVotes: (teamId, votes) => api.put(`/teams/${teamId}/votes`, { votes }),
  delete: (teamId) => api.delete(`/teams/${teamId}`),
  resetVotes: () => api.post('/teams/reset-votes')
};

// Serviços de presentes
export const giftsService = {
  getAll: () => api.get('/gifts'),
  getAvailable: () => api.get('/gifts/available'),
  create: (formData) => api.post('/gifts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (giftId, teamId) => api.put(`/gifts/${giftId}`, { team_id: teamId }),
  delete: (giftId) => api.delete(`/gifts/${giftId}`)
};

// Serviços de votação
export const votingService = {
  getHistory: (limit = 100) => api.get(`/voting/history?limit=${limit}`),
  vote: (teamId, giftId, username) => api.post('/voting/vote', { team_id: teamId, gift_id: giftId, username }),
  getStats: () => api.get('/voting/stats'),
  reset: () => api.post('/voting/reset'),
  getSettings: () => api.get('/voting/settings'),
  updateSetting: (key, value) => api.post('/voting/settings', { key, value })
};

// Serviços do TikTok Live
export const tiktokService = {
  connect: (username) => api.post('/tiktok/connect', { username }),
  disconnect: () => api.post('/tiktok/disconnect'),
  getStatus: () => api.get('/tiktok/status'),
  refreshMappings: () => api.post('/tiktok/refresh-mappings'),
  simulateGift: (giftName, giftId, username, repeatCount = 1) => 
    api.post('/tiktok/simulate-gift', { giftName, giftId, username, repeatCount })
};

export default api;

