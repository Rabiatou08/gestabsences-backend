const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET — matières par filière
router.get('/matieres-filiere', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.code_filiere, f.libele_filiere, f.nbre_etudiant,
        m.code_matiere, m.nom_matiere, m.volume_horaire,
        COUNT(DISTINCT en.id_enseignement) AS nb_seances
      FROM filiere f
      LEFT JOIN matiere m ON m.code_filiere = f.code_filiere
      LEFT JOIN enseignement en ON en.code_matiere = m.code_matiere
        AND en.code_filiere = f.code_filiere
      GROUP BY f.code_filiere, f.libele_filiere, f.nbre_etudiant,
               m.code_matiere, m.nom_matiere, m.volume_horaire
      ORDER BY f.libele_filiere, m.nom_matiere
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences par filière et période
router.get('/absences-filiere', async (req, res) => {
  const { code_filiere, id_periode } = req.query;
  try {
    let query = `
      SELECT
        et.id_etudiant, et.nom, et.prenom,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire,
        a.statut, a.justification, a.date_justification,
        p.libelle AS libelle_periode
      FROM assister a
      JOIN etudiant et     ON a.id_etudiant     = et.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f       ON et.code_filiere   = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      LEFT JOIN periode p  ON en.id_periode     = p.id_periode
      WHERE a.statut = 'absent'
    `;
    const params = [];
    if (code_filiere) {
      params.push(code_filiere);
      query += ` AND et.code_filiere = $${params.length}`;
    }
    if (id_periode) {
      params.push(id_periode);
      query += ` AND en.id_periode = $${params.length}`;
    }
    query += ' ORDER BY en.date_enseignement DESC, et.nom';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences par étudiant
router.get('/absences-etudiant', async (req, res) => {
  const { id_etudiant } = req.query;
  try {
    let query = `
      SELECT
        et.id_etudiant, et.nom, et.prenom, et.sexe,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire,
        a.statut, a.justification, a.date_justification,
        ens.nom AS nom_enseignant, ens.prenom AS prenom_enseignant
      FROM assister a
      JOIN etudiant et     ON a.id_etudiant     = et.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f       ON et.code_filiere   = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      LEFT JOIN enseignant ens ON en.id_enseignant = ens.id_enseignant
      WHERE a.statut = 'absent'
    `;
    const params = [];
    if (id_etudiant) {
      params.push(id_etudiant);
      query += ` AND et.id_etudiant = $${params.length}`;
    }
    query += ' ORDER BY en.date_enseignement DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — absences justifiées
router.get('/absences-justifiees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        et.id_etudiant, et.nom, et.prenom,
        f.libele_filiere,
        m.nom_matiere,
        en.date_enseignement, en.horaire,
        a.justification, a.date_justification
      FROM assister a
      JOIN etudiant et     ON a.id_etudiant     = et.id_etudiant
      JOIN enseignement en ON a.id_enseignement = en.id_enseignement
      JOIN filiere f       ON et.code_filiere   = f.code_filiere
      JOIN matiere m       ON en.code_matiere   = m.code_matiere
      WHERE a.statut = 'absent' AND a.justification IS NOT NULL
      ORDER BY a.date_justification DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;