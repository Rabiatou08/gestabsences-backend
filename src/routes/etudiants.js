const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');

// GET — tous les étudiants
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, f.libele_filiere
      FROM etudiant e
      LEFT JOIN filiere f ON e.code_filiere = f.code_filiere
      ORDER BY e.nom, e.prenom
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — par filière
router.get('/filiere/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, f.libele_filiere
      FROM etudiant e
      LEFT JOIN filiere f ON e.code_filiere = f.code_filiere
      WHERE e.code_filiere = $1
      ORDER BY e.nom, e.prenom
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — créer étudiant + compte utilisateur automatiquement
router.post('/', async (req, res) => {
  const { nom, prenom, sexe, code_filiere, email_parent } = req.body;
  if (!nom || !prenom)
    return res.status(400).json({ error: 'Nom et prénom obligatoires' });
  if (!code_filiere)
    return res.status(400).json({ error: 'Filière obligatoire' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Créer le profil étudiant
    const etudResult = await client.query(
      `INSERT INTO etudiant (nom, prenom, sexe, code_filiere, email_parent)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nom, prenom, sexe || 'M', code_filiere, email_parent || null]
    );
    const etudiant = etudResult.rows[0];

    // 2. Générer email et mot de passe
    const prenomClean = prenom.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.');
    const nomClean = nom.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.');
    const email = `${prenomClean}.${nomClean}@etudiant.ci`;
    const motDePasse = 'etudiant123';
    const hash = await bcrypt.hash(motDePasse, 10);

    // 3. Vérifier si l'email existe déjà
    const emailExiste = await client.query(
      'SELECT id_utilisateur FROM utilisateur WHERE email=$1', [email]
    );

    let emailFinal = email;
    if (emailExiste.rowCount > 0) {
      emailFinal = `${prenomClean}.${nomClean}${etudiant.id_etudiant}@etudiant.ci`;
    }

    // 4. Créer le compte utilisateur
    const userResult = await client.query(
      `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role, id_etudiant)
       VALUES ($1,$2,$3,$4,'etudiant',$5) RETURNING *`,
      [nom, prenom, emailFinal, hash, etudiant.id_etudiant]
    );

    await client.query('COMMIT');

    res.status(201).json({
      etudiant,
      compte: {
        email:       userResult.rows[0].email,
        mot_de_passe: motDePasse,
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT — modifier
router.put('/:id', async (req, res) => {
  const { nom, prenom, sexe, code_filiere, email_parent } = req.body;
  try {
    const result = await pool.query(
      `UPDATE etudiant SET nom=$1, prenom=$2, sexe=$3,
       code_filiere=$4, email_parent=$5
       WHERE id_etudiant=$6 RETURNING *`,
      [nom, prenom, sexe, code_filiere, email_parent || null, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Étudiant introuvable' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — supprimer
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Supprimer le compte utilisateur lié
    await client.query(
      'DELETE FROM utilisateur WHERE id_etudiant=$1', [req.params.id]
    );
    // Supprimer l'étudiant
    await client.query(
      'DELETE FROM etudiant WHERE id_etudiant=$1', [req.params.id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Étudiant et compte supprimés' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;