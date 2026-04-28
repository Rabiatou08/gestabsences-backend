const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — tous
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filiere ORDER BY code_filiere');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — créer
router.post('/', async (req, res) => {
  const { libele_filiere, nbre_etudiant } = req.body;
  if (!libele_filiere)
    return res.status(400).json({ error: 'Libellé obligatoire' });
  try {
    const result = await pool.query(
      'INSERT INTO filiere (libele_filiere, nbre_etudiant) VALUES ($1, $2) RETURNING *',
      [libele_filiere, nbre_etudiant || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — modifier
router.put('/:id', async (req, res) => {
  const { libele_filiere, nbre_etudiant } = req.body;
  try {
    const result = await pool.query(
      'UPDATE filiere SET libele_filiere=$1, nbre_etudiant=$2 WHERE code_filiere=$3 RETURNING *',
      [libele_filiere, nbre_etudiant, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Filière introuvable' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — supprimer
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM filiere WHERE code_filiere=$1', [req.params.id]);
    res.json({ message: 'Filière supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;