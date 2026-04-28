const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — tous les enseignements
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT en.*,
        e.nom AS nom_enseignant, e.prenom AS prenom_enseignant,
        f.libele_filiere, m.nom_matiere, p.libelle AS libelle_periode
      FROM enseignement en
      LEFT JOIN enseignant e ON en.id_enseignant = e.id_enseignant
      LEFT JOIN filiere f    ON en.code_filiere  = f.code_filiere
      LEFT JOIN matiere m    ON en.code_matiere  = m.code_matiere
      LEFT JOIN periode p    ON en.id_periode    = p.id_periode
      ORDER BY en.date_enseignement DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — créer une séance
router.post('/', async (req, res) => {
  const { date_enseignement, horaire, id_enseignant, code_filiere, id_periode, code_matiere } = req.body;
  if (!date_enseignement || !horaire || !code_filiere || !code_matiere)
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  try {
    const result = await pool.query(
      `INSERT INTO enseignement (date_enseignement, horaire, id_enseignant, code_filiere, id_periode, code_matiere)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [date_enseignement, horaire, id_enseignant || null, code_filiere, id_periode || null, code_matiere]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM enseignement WHERE id_enseignement=$1', [req.params.id]);
    res.json({ message: 'Séance supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;