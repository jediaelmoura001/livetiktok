const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tiktok_voting.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
      } else {
        console.log('Conectado ao banco de dados SQLite.');
        this.initTables();
      }
    });
  }

  initTables() {
    // Tabela de usuários (para login)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de times
    this.db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_path TEXT,
        votes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de presentes do TikTok
    this.db.run(`
      CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        tiktok_id TEXT UNIQUE NOT NULL,
        image_path TEXT,
        team_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (id)
      )
    `);

    // Tabela de votos (histórico)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        gift_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams (id),
        FOREIGN KEY (gift_id) REFERENCES gifts (id)
      )
    `);

    // Tabela de configurações
    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tabelas do banco de dados inicializadas.');
  }

  // Métodos para Teams
  createTeam(name, logoPath, callback) {
    const sql = 'INSERT INTO teams (name, logo_path) VALUES (?, ?)';
    this.db.run(sql, [name, logoPath], function(err) {
      callback(err, this ? this.lastID : null);
    });
  }

  getAllTeams(callback) {
    const sql = 'SELECT * FROM teams ORDER BY votes DESC, name ASC';
    this.db.all(sql, [], callback);
  }

  updateTeamVotes(teamId, votes, callback) {
    const sql = 'UPDATE teams SET votes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    this.db.run(sql, [votes, teamId], callback);
  }

  deleteTeam(teamId, callback) {
    const sql = 'DELETE FROM teams WHERE id = ?';
    this.db.run(sql, [teamId], callback);
  }

  // Métodos para Gifts
  createGift(name, tiktokId, imagePath, teamId, callback) {
    const sql = 'INSERT INTO gifts (name, tiktok_id, image_path, team_id) VALUES (?, ?, ?, ?)';
    this.db.run(sql, [name, tiktokId, imagePath, teamId], function(err) {
      callback(err, this ? this.lastID : null);
    });
  }

  getAllGifts(callback) {
    const sql = `
      SELECT g.*, t.name as team_name 
      FROM gifts g 
      LEFT JOIN teams t ON g.team_id = t.id 
      ORDER BY g.name ASC
    `;
    this.db.all(sql, [], callback);
  }

  updateGiftTeam(giftId, teamId, callback) {
    const sql = 'UPDATE gifts SET team_id = ? WHERE id = ?';
    this.db.run(sql, [teamId, giftId], callback);
  }

  // Métodos para Votes
  addVote(teamId, giftId, username, callback) {
    const sql = 'INSERT INTO votes (team_id, gift_id, username) VALUES (?, ?, ?)';
    this.db.run(sql, [teamId, giftId, username], function(err) {
      if (!err) {
        // Incrementar contador de votos do time
        const updateSql = 'UPDATE teams SET votes = votes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        this.db.run(updateSql, [teamId]);
      }
      callback(err, this ? this.lastID : null);
    }.bind(this));
  }

  getVoteHistory(limit = 100, callback) {
    const sql = `
      SELECT v.*, t.name as team_name, g.name as gift_name 
      FROM votes v 
      JOIN teams t ON v.team_id = t.id 
      JOIN gifts g ON v.gift_id = g.id 
      ORDER BY v.timestamp DESC 
      LIMIT ?
    `;
    this.db.all(sql, [limit], callback);
  }

  // Métodos para Settings
  setSetting(key, value, callback) {
    const sql = 'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
    this.db.run(sql, [key, value], callback);
  }

  getSetting(key, callback) {
    const sql = 'SELECT value FROM settings WHERE key = ?';
    this.db.get(sql, [key], callback);
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Erro ao fechar o banco de dados:', err.message);
      } else {
        console.log('Conexão com o banco de dados fechada.');
      }
    });
  }
}

module.exports = new Database();

