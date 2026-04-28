const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — liste de présence d'une séance
router.get('/:id_enseignement', async (req, res) => {
  try {
    const { id_enseignement } = req.params;

    const seance = await pool.query(
      'SELECT code_filiere FROM enseignement WHERE id_enseignement=$1',
      [id_enseignement]
    );
    if (seance.rowCount === 0)
      return res.status(404).json({ error: 'Séance introuvable' });

    const { code_filiere } = seance.rows[0];

    const result = await pool.query(`
      SELECT e.id_etudiant, e.nom, e.prenom, e.sexe,
        a.statut, a.justification, a.date_justification
      FROM etudiant e
      LEFT JOIN assister a ON e.id_etudiant = a.id_etudiant
        AND a.id_enseignement = $1
      WHERE e.code_filiere = $2
      ORDER BY e.nom, e.prenom
    `, [id_enseignement, code_filiere]);

    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — enregistrer les présences
router.post('/:id_enseignement', async (req, res) => {
  const { id_enseignement } = req.params;
  const { presences } = req.body;

  try {
    for (const p of presences) {
      await pool.query(`
        INSERT INTO assister (id_etudiant, id_enseignement, statut)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_etudiant, id_enseignement)
        DO UPDATE SET statut = EXCLUDED.statut
      `, [p.id_etudiant, id_enseignement, p.statut]);
    }
    res.json({ message: 'Présences enregistrées' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — justifier une absence
router.put('/justifier/:id_enseignement/:id_etudiant', async (req, res) => {
  const { id_enseignement, id_etudiant } = req.params;
  const { justification } = req.body;
  try {
    await pool.query(`
      UPDATE assister SET justification=$1, date_justification=NOW()
      WHERE id_enseignement=$2 AND id_etudiant=$3
    `, [justification, id_enseignement, id_etudiant]);
    res.json({ message: 'Absence justifiée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;