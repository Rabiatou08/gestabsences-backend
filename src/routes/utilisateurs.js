const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');

// GET — tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_utilisateur, nom, prenom, email, role, actif, created_at
      FROM utilisateur
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — créer un utilisateur
router.post('/', async (req, res) => {
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
       RETURNING id_utilisateur, nom, prenom, email, role, actif`,
      [nom, prenom, email, hash, role || 'etudiant']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — modifier un utilisateur
router.put('/:id', async (req, res) => {
  const { nom, prenom, email, role } = req.body;
  try {
    const result = await pool.query(
      `UPDATE utilisateur SET nom=$1, prenom=$2, email=$3, role=$4
       WHERE id_utilisateur=$5
       RETURNING id_utilisateur, nom, prenom, email, role, actif`,
      [nom, prenom, email, role, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — changer mot de passe
router.put('/:id/password', async (req, res) => {
  const { mot_de_passe } = req.body;
  if (!mot_de_passe)
    return res.status(400).json({ error: 'Mot de passe obligatoire' });
  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    await pool.query(
      'UPDATE utilisateur SET mot_de_passe=$1 WHERE id_utilisateur=$2',
      [hash, req.params.id]
    );
    res.json({ message: 'Mot de passe modifié' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — activer/désactiver
router.put('/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE utilisateur SET actif = NOT actif
       WHERE id_utilisateur=$1
       RETURNING id_utilisateur, actif`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — supprimer
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM utilisateur WHERE id_utilisateur=$1', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;