const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM periode ORDER BY date_debut');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { libelle, date_debut, date_fin } = req.body;
  if (!libelle || !date_debut || !date_fin)
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  try {
    const result = await pool.query(
      'INSERT INTO periode (libelle,date_debut,date_fin) VALUES ($1,$2,$3) RETURNING *',
      [libelle, date_debut, date_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { libelle, date_debut, date_fin } = req.body;
  try {
    const result = await pool.query(
      'UPDATE periode SET libelle=$1, date_debut=$2, date_fin=$3 WHERE id_periode=$4 RETURNING *',
      [libelle, date_debut, date_fin, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Période introuvable' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM periode WHERE id_periode=$1', [req.params.id]);
    res.json({ message: 'Période supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;