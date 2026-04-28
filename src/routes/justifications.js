const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — toutes les absences
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id_etudiant, a.id_enseignement, a.statut,
        a.justification, a.date_justification,
        e.nom AS nom_etudiant, e.prenom AS prenom_etudiant,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire
      FROM assister a
      JOIN etudiant e    ON a.id_etudiant     = e.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f     ON e.code_filiere    = f.code_filiere
      JOIN matiere m     ON en.code_matiere   = m.code_matiere
      WHERE a.statut = 'absent'
      ORDER BY en.date_enseignement DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences non justifiées
router.get('/non-justifiees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id_etudiant, a.id_enseignement, a.statut,
        a.justification, a.date_justification,
        e.nom AS nom_etudiant, e.prenom AS prenom_etudiant,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire
      FROM assister a
      JOIN etudiant e      ON a.id_etudiant     = e.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f       ON e.code_filiere    = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      WHERE a.statut = 'absent' AND a.justification IS NULL
      ORDER BY en.date_enseignement DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences justifiées
router.get('/justifiees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id_etudiant, a.id_enseignement, a.statut,
        a.justification, a.date_justification,
        e.nom AS nom_etudiant, e.prenom AS prenom_etudiant,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire
      FROM assister a
      JOIN etudiant e      ON a.id_etudiant     = e.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f       ON e.code_filiere    = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      WHERE a.statut = 'absent' AND a.justification IS NOT NULL
      ORDER BY a.date_justification DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — justifier une absence
router.put('/:id_enseignement/:id_etudiant', async (req, res) => {
  const { id_enseignement, id_etudiant } = req.params;
  const { justification } = req.body;
  if (!justification)
    return res.status(400).json({ error: 'Motif obligatoire' });
  try {
    await pool.query(`
      UPDATE assister
      SET justification=$1, date_justification=NOW()
      WHERE id_enseignement=$2 AND id_etudiant=$3
    `, [justification, id_enseignement, id_etudiant]);
    res.json({ message: 'Absence justifiée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;