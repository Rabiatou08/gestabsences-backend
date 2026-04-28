const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../config/db');
const auth     = require('../middleware/auth');

// ── REGISTER ──────────────────────────────────
router.post('/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role } = req.body;

  if (!nom || !prenom || !email || !mot_de_passe)
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });

  try {
    const existe = await pool.query(
      'SELECT id_utilisateur FROM utilisateur WHERE email=$1', [email]
    );
    if (existe.rowCount > 0)
      return res.status(400).json({ error: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(mot_de_passe, 10);

    const result = await pool.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id_utilisateur, nom, prenom, email, role`,
      [nom, prenom, email, hash, role || 'etudiant']
    );

    res.status(201).json({ message: 'Compte créé', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe)
    return res.status(400).json({ error: 'Email et mot de passe obligatoires' });

  try {
    const result = await pool.query(
      'SELECT * FROM utilisateur WHERE email=$1 AND actif=true', [email]
    );

    if (result.rowCount === 0)
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!valid)
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = jwt.sign(
      {
        id:            user.id_utilisateur,
        email:         user.email,
        role:          user.role,
        nom:           user.nom,
        prenom:        user.prenom,
        id_enseignant: user.id_enseignant,
        id_etudiant:   user.id_etudiant,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id:            user.id_utilisateur,
        nom:           user.nom,
        prenom:        user.prenom,
        email:         user.email,
        role:          user.role,
        id_enseignant: user.id_enseignant,
        id_etudiant:   user.id_etudiant,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ME ────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_utilisateur, nom, prenom, email, role,
              id_enseignant, id_etudiant
       FROM utilisateur WHERE id_utilisateur=$1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;