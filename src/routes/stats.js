const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — statistiques globales
router.get('/globales', async (req, res) => {
  try {
    const [
      etudiants, enseignants, filieres, matieres,
      absences, justifiees, seances, utilisateurs
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM etudiant'),
      pool.query('SELECT COUNT(*) FROM enseignant'),
      pool.query('SELECT COUNT(*) FROM filiere'),
      pool.query('SELECT COUNT(*) FROM matiere'),
      pool.query("SELECT COUNT(*) FROM assister WHERE statut='absent'"),
      pool.query("SELECT COUNT(*) FROM assister WHERE statut='absent' AND justification IS NOT NULL"),
      pool.query('SELECT COUNT(*) FROM enseignement'),
      pool.query('SELECT COUNT(*) FROM utilisateur WHERE actif=true'),
    ]);

    res.json({
      etudiants:    parseInt(etudiants.rows[0].count),
      enseignants:  parseInt(enseignants.rows[0].count),
      filieres:     parseInt(filieres.rows[0].count),
      matieres:     parseInt(matieres.rows[0].count),
      absences:     parseInt(absences.rows[0].count),
      justifiees:   parseInt(justifiees.rows[0].count),
      seances:      parseInt(seances.rows[0].count),
      utilisateurs: parseInt(utilisateurs.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences par filière
router.get('/absences-par-filiere', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.libele_filiere,
        COUNT(a.id_etudiant) AS total_absences,
        COUNT(CASE WHEN a.justification IS NOT NULL THEN 1 END) AS justifiees,
        COUNT(CASE WHEN a.justification IS NULL THEN 1 END) AS non_justifiees
      FROM filiere f
      LEFT JOIN etudiant et ON et.code_filiere = f.code_filiere
      LEFT JOIN assister a  ON a.id_etudiant   = et.id_etudiant
        AND a.statut = 'absent'
      GROUP BY f.libele_filiere
      ORDER BY total_absences DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences par matière
router.get('/absences-par-matiere', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.nom_matiere,
        COUNT(a.id_etudiant) AS total_absences
      FROM matiere m
      LEFT JOIN enseignement en ON en.code_matiere  = m.code_matiere
      LEFT JOIN assister a      ON a.id_enseignement = en.id_enseignement
        AND a.statut = 'absent'
      GROUP BY m.nom_matiere
      ORDER BY total_absences DESC
      LIMIT 8
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — dernières absences
router.get('/dernieres-absences', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        et.nom, et.prenom,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement,
        a.statut, a.justification
      FROM assister a
      JOIN etudiant et     ON a.id_etudiant     = et.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f       ON et.code_filiere   = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      WHERE a.statut = 'absent'
      ORDER BY en.date_enseignement DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;