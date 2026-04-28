const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — stats de l'étudiant
router.get('/stats/:id_etudiant', async (req, res) => {
  try {
    const [absences, justifiees, seances] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) FROM assister
        WHERE id_etudiant=$1 AND statut='absent'
      `, [req.params.id_etudiant]),
      pool.query(`
        SELECT COUNT(*) FROM assister
        WHERE id_etudiant=$1 AND statut='absent'
          AND justification IS NOT NULL
      `, [req.params.id_etudiant]),
      pool.query(`
        SELECT COUNT(*) FROM assister
        WHERE id_etudiant=$1
      `, [req.params.id_etudiant]),
    ]);
    res.json({
      absences:  parseInt(absences.rows[0].count),
      justifiees:parseInt(justifiees.rows[0].count),
      seances:   parseInt(seances.rows[0].count),
      presences: parseInt(seances.rows[0].count) - parseInt(absences.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences de l'étudiant
router.get('/absences/:id_etudiant', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.nom_matiere,
        f.libele_filiere,
        en.date_enseignement, en.horaire,
        a.statut, a.justification, a.date_justification,
        ens.nom AS nom_enseignant, ens.prenom AS prenom_enseignant
      FROM assister a
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      JOIN filiere f       ON en.code_filiere   = f.code_filiere
      LEFT JOIN enseignant ens ON en.id_enseignant = ens.id_enseignant
      WHERE a.id_etudiant = $1
        AND a.statut = 'absent'
      ORDER BY en.date_enseignement DESC
    `, [req.params.id_etudiant]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — toutes les séances de l'étudiant
router.get('/seances/:id_etudiant', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.nom_matiere,
        en.date_enseignement, en.horaire,
        a.statut, a.justification,
        ens.nom AS nom_enseignant, ens.prenom AS prenom_enseignant
      FROM assister a
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      LEFT JOIN enseignant ens ON en.id_enseignant = ens.id_enseignant
      WHERE a.id_etudiant = $1
      ORDER BY en.date_enseignement DESC
    `, [req.params.id_etudiant]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;