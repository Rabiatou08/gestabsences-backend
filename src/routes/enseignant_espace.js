const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — séances de l'enseignant connecté
router.get('/seances/:id_enseignant', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        en.id_enseignement, en.date_enseignement, en.horaire,
        f.libele_filiere, m.nom_matiere,
        p.libelle AS libelle_periode,
        COUNT(DISTINCT a.id_etudiant) AS nb_presents,
        COUNT(DISTINCT et.id_etudiant) AS nb_etudiants
      FROM enseignement en
      LEFT JOIN filiere f    ON en.code_filiere  = f.code_filiere
      LEFT JOIN matiere m    ON en.code_matiere  = m.code_matiere
      LEFT JOIN periode p    ON en.id_periode    = p.id_periode
      LEFT JOIN etudiant et  ON et.code_filiere  = en.code_filiere
      LEFT JOIN assister a   ON a.id_enseignement = en.id_enseignement
        AND a.statut = 'present'
      WHERE en.id_enseignant = $1
      GROUP BY en.id_enseignement, en.date_enseignement, en.horaire,
               f.libele_filiere, m.nom_matiere, p.libelle
      ORDER BY en.date_enseignement DESC
    `, [req.params.id_enseignant]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences des étudiants de l'enseignant
router.get('/absences/:id_enseignant', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        et.nom, et.prenom,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire,
        a.statut, a.justification, a.date_justification
      FROM assister a
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN etudiant et     ON a.id_etudiant     = et.id_etudiant
      JOIN filiere f       ON et.code_filiere   = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      WHERE en.id_enseignant = $1
        AND a.statut = 'absent'
      ORDER BY en.date_enseignement DESC
    `, [req.params.id_enseignant]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — stats de l'enseignant
router.get('/stats/:id_enseignant', async (req, res) => {
  try {
    const [seances, absences, justifiees, etudiants] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) FROM enseignement WHERE id_enseignant=$1',
        [req.params.id_enseignant]
      ),
      pool.query(`
        SELECT COUNT(*) FROM assister a
        JOIN enseignement en ON a.id_enseignement = en.id_enseignement
        WHERE en.id_enseignant=$1 AND a.statut='absent'
      `, [req.params.id_enseignant]),
      pool.query(`
        SELECT COUNT(*) FROM assister a
        JOIN enseignement en ON a.id_enseignement = en.id_enseignement
        WHERE en.id_enseignant=$1 AND a.statut='absent'
          AND a.justification IS NOT NULL
      `, [req.params.id_enseignant]),
      pool.query(`
        SELECT COUNT(DISTINCT et.id_etudiant)
        FROM etudiant et
        JOIN enseignement en ON en.code_filiere = et.code_filiere
        WHERE en.id_enseignant=$1
      `, [req.params.id_enseignant]),
    ]);
    res.json({
      seances:   parseInt(seances.rows[0].count),
      absences:  parseInt(absences.rows[0].count),
      justifiees:parseInt(justifiees.rows[0].count),
      etudiants: parseInt(etudiants.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;