const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool({
  // Si DATABASE_URL existe (Render/Neon), on l'utilise, sinon on prend les variables locales
  connectionString: process.env.DATABASE_URL,
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Le SSL est activé uniquement si on a une DATABASE_URL (donc en ligne)
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté'))
  .catch(err => console.error('❌ Erreur connexion DB:', err.message));

module.exports = pool;
