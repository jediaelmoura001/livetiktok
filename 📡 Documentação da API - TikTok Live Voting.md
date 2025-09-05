# 📡 Documentação da API - TikTok Live Voting

Esta documentação descreve todas as rotas e endpoints da API do sistema TikTok Live Voting.

## 🔗 Base URL
```
http://localhost:3001/api
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:
```
Authorization: Bearer <seu_jwt_token>
```

---

## 🔑 Autenticação

### POST /auth/login
Realiza login no sistema.

**Request:**
```json
{
  "username": "@seuusername"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "@seuusername"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Username é obrigatório"
}
```

### GET /auth/verify
Verifica se o token JWT é válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "@seuusername"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Token inválido"
}
```

### POST /auth/logout
Realiza logout (invalida o token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## ⚽ Times

### GET /teams
Lista todos os times cadastrados.

**Response (200):**
```json
{
  "success": true,
  "teams": [
    {
      "id": 1,
      "name": "Flamengo",
      "logo_path": "/uploads/teams/flamengo.png",
      "votes": 15,
      "created_at": "2025-01-01T10:00:00.000Z",
      "updated_at": "2025-01-01T12:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Corinthians",
      "logo_path": "/uploads/teams/corinthians.png",
      "votes": 12,
      "created_at": "2025-01-01T10:05:00.000Z",
      "updated_at": "2025-01-01T12:25:00.000Z"
    }
  ]
}
```

### POST /teams
Cria um novo time.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (string): Nome do time
- `logo` (file, opcional): Logo do time (PNG/JPG, máx 5MB)

**Response (201):**
```json
{
  "success": true,
  "message": "Time criado com sucesso",
  "team": {
    "id": 3,
    "name": "São Paulo",
    "logo_path": "/uploads/teams/sao_paulo.png",
    "votes": 0,
    "created_at": "2025-01-01T13:00:00.000Z",
    "updated_at": "2025-01-01T13:00:00.000Z"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Nome do time é obrigatório"
}
```

### PUT /teams/:id/votes
Atualiza os votos de um time.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "votes": 20
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Votos atualizados com sucesso",
  "team": {
    "id": 1,
    "name": "Flamengo",
    "votes": 20,
    "updated_at": "2025-01-01T13:30:00.000Z"
  }
}
```

### DELETE /teams/:id
Remove um time.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Time removido com sucesso"
}
```

### POST /teams/reset-votes
Reseta os votos de todos os times para zero.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Votos resetados com sucesso"
}
```

---

## 🎁 Presentes

### GET /gifts
Lista todas as configurações de presentes.

**Response (200):**
```json
{
  "success": true,
  "gifts": [
    {
      "id": 1,
      "name": "Rose",
      "tiktok_id": "5655",
      "image_path": "/uploads/gifts/rose.png",
      "team_id": 1,
      "team_name": "Flamengo",
      "created_at": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

### GET /gifts/available
Lista todos os presentes disponíveis no TikTok.

**Response (200):**
```json
{
  "success": true,
  "gifts": [
    {
      "id": "5655",
      "name": "Rose",
      "image": "https://tiktok.com/gift/rose.png",
      "value": 1
    },
    {
      "id": "5827",
      "name": "Heart",
      "image": "https://tiktok.com/gift/heart.png",
      "value": 5
    }
  ]
}
```

### POST /gifts
Configura um presente para um time.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (string): Nome do presente
- `tiktok_id` (string): ID do presente no TikTok
- `team_id` (number): ID do time
- `image` (file, opcional): Imagem personalizada

**Response (201):**
```json
{
  "success": true,
  "message": "Presente configurado com sucesso",
  "gift": {
    "id": 2,
    "name": "Heart",
    "tiktok_id": "5827",
    "team_id": 1,
    "image_path": "/uploads/gifts/heart.png",
    "created_at": "2025-01-01T13:00:00.000Z"
  }
}
```

### PUT /gifts/:id
Atualiza configuração de um presente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "team_id": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Configuração atualizada com sucesso"
}
```

### DELETE /gifts/:id
Remove configuração de um presente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Configuração removida com sucesso"
}
```

---

## 🗳️ Votação

### GET /voting/history
Obtém histórico de votos.

**Query Parameters:**
- `limit` (number, opcional): Limite de resultados (padrão: 50)
- `offset` (number, opcional): Offset para paginação (padrão: 0)
- `team_id` (number, opcional): Filtrar por time

**Response (200):**
```json
{
  "success": true,
  "votes": [
    {
      "id": 1,
      "team_id": 1,
      "team_name": "Flamengo",
      "gift_id": 1,
      "gift_name": "Rose",
      "username": "@user123",
      "timestamp": "2025-01-01T12:30:00.000Z"
    }
  ],
  "total": 1
}
```

### POST /voting/vote
Registra um voto manual.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "team_id": 1,
  "gift_id": 1,
  "username": "@user123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Voto registrado com sucesso",
  "vote": {
    "id": 2,
    "team_id": 1,
    "gift_id": 1,
    "username": "@user123",
    "timestamp": "2025-01-01T13:00:00.000Z"
  }
}
```

### GET /voting/stats
Obtém estatísticas de votação.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "total_votes": 27,
    "total_teams": 2,
    "total_gifts_configured": 3,
    "most_popular_gift": "Rose",
    "leading_team": "Flamengo",
    "votes_per_hour": 15.5
  }
}
```

### POST /voting/reset
Reseta toda a votação.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Votação resetada com sucesso"
}
```

---

## 📱 TikTok Live

### POST /tiktok/connect
Conecta à live do TikTok.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "username": "@seuusername"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conectado à live com sucesso",
  "status": "connected",
  "username": "@seuusername"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Erro ao conectar: Live não encontrada"
}
```

### POST /tiktok/disconnect
Desconecta da live do TikTok.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Desconectado da live",
  "status": "disconnected"
}
```

### GET /tiktok/status
Obtém status da conexão TikTok.

**Response (200):**
```json
{
  "success": true,
  "status": "connected",
  "username": "@seuusername",
  "connected_at": "2025-01-01T12:00:00.000Z",
  "gifts_received": 15,
  "viewers": 1250
}
```

### POST /tiktok/simulate-gift
Simula recebimento de um presente (para testes).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "gift_name": "Rose",
  "gift_id": "5655",
  "username": "@testuser",
  "quantity": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Presente simulado com sucesso",
  "processed": true,
  "team_voted": "Flamengo"
}
```

---

## 🔧 Sistema

### GET /health
Verifica saúde da API.

**Response (200):**
```json
{
  "status": "OK",
  "message": "TikTok Voting API está funcionando!",
  "timestamp": "2025-01-01T13:00:00.000Z",
  "uptime": 3600
}
```

---

## 📡 WebSocket Events (Socket.io)

### Eventos Emitidos pelo Servidor

#### Times
- **`team_created`**: Novo time criado
- **`team_deleted`**: Time removido
- **`votes_updated`**: Votos atualizados
- **`votes_reset`**: Votos resetados

#### Presentes
- **`gift_configured`**: Presente configurado
- **`gift_updated`**: Configuração atualizada
- **`gift_deleted`**: Configuração removida

#### TikTok Live
- **`tiktok_connected`**: Conectado à live
- **`tiktok_disconnected`**: Desconectado da live
- **`tiktok_error`**: Erro na conexão
- **`tiktok_gift`**: Presente recebido na live
- **`tiktok_comment`**: Comentário na live
- **`tiktok_member_join`**: Usuário entrou na live
- **`tiktok_like`**: Likes recebidos

#### Votação
- **`new_vote`**: Novo voto registrado

### Exemplo de Uso (JavaScript)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Escutar novos votos
socket.on('new_vote', (data) => {
  console.log('Novo voto:', data);
});

// Escutar presentes do TikTok
socket.on('tiktok_gift', (data) => {
  console.log('Presente recebido:', data);
});

// Escutar atualizações de votos
socket.on('votes_updated', (data) => {
  console.log('Votos atualizados:', data);
});
```

---

## ❌ Códigos de Erro

### HTTP Status Codes
- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **500**: Erro interno do servidor

### Mensagens de Erro Comuns
```json
{
  "success": false,
  "message": "Token não fornecido",
  "code": "NO_TOKEN"
}
```

```json
{
  "success": false,
  "message": "Time não encontrado",
  "code": "TEAM_NOT_FOUND"
}
```

```json
{
  "success": false,
  "message": "Arquivo muito grande",
  "code": "FILE_TOO_LARGE"
}
```

---

## 📝 Notas Importantes

1. **Rate Limiting**: A API não possui rate limiting implementado
2. **CORS**: Configurado para aceitar requisições do frontend
3. **Upload**: Arquivos são limitados a 5MB
4. **Autenticação**: Tokens JWT expiram em 24 horas
5. **WebSocket**: Conexão automática ao acessar o frontend

---

**Para mais informações, consulte o código fonte ou abra uma issue no repositório.**

