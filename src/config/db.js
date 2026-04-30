const { Pool } = require('pg');
require('dotenv').config();

// Utilise connectionString pour lire DATABASE_URL (indispensable pour Render/Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obligatoire pour se connecter à Neon en ligne
  }
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté (Production)'))
  .catch(err => console.error('❌ Erreur connexion DB:', err.message));

module.exports = pool;
