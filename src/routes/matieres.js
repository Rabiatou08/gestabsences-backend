const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, f.libele_filiere
      FROM matiere m
      LEFT JOIN filiere f ON m.code_filiere = f.code_filiere
      ORDER BY m.code_matiere
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { nom_matiere, volume_horaire, code_filiere } = req.body;
  if (!nom_matiere)
    return res.status(400).json({ error: 'Nom obligatoire' });
  try {
    const result = await pool.query(
      'INSERT INTO matiere (nom_matiere, volume_horaire, code_filiere) VALUES ($1,$2,$3) RETURNING *',
      [nom_matiere, volume_horaire || 0, code_filiere || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { nom_matiere, volume_horaire, code_filiere } = req.body;
  try {
    const result = await pool.query(
      'UPDATE matiere SET nom_matiere=$1, volume_horaire=$2, code_filiere=$3 WHERE code_matiere=$4 RETURNING *',
      [nom_matiere, volume_horaire, code_filiere || null, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Matière introuvable' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM matiere WHERE code_matiere=$1', [req.params.id]);
    res.json({ message: 'Matière supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;