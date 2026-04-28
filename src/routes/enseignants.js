const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enseignant ORDER BY nom, prenom');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { nom, prenom, mail, specialite, diplome, sexe } = req.body;
  if (!nom || !prenom)
    return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  try {
    const result = await pool.query(
      'INSERT INTO enseignant (nom,prenom,mail,specialite,diplome,sexe) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nom, prenom, mail || null, specialite || null, diplome || null, sexe || 'M']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { nom, prenom, mail, specialite, diplome, sexe } = req.body;
  try {
    const result = await pool.query(
      'UPDATE enseignant SET nom=$1,prenom=$2,mail=$3,specialite=$4,diplome=$5,sexe=$6 WHERE id_enseignant=$7 RETURNING *',
      [nom, prenom, mail || null, specialite || null, diplome || null, sexe, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Enseignant introuvable' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM enseignant WHERE id_enseignant=$1', [req.params.id]);
    res.json({ message: 'Enseignant supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;