const express   = require('express');
const router    = express.Router();
const pool      = require('../config/db');
const mailer    = require('../config/mailer');
const { absenceTemplate, justificationTemplate } = require('../config/emailTemplates');

// POST — envoyer email absence
router.post('/absence', async (req, res) => {
  const { id_etudiant, id_enseignement, email_destinataire } = req.body;

  if (!email_destinataire)
    return res.status(400).json({ error: 'Email destinataire obligatoire' });

  try {
    // Récupère les infos
    const result = await pool.query(`
      SELECT
        et.nom, et.prenom,
        m.nom_matiere,
        f.libele_filiere,
        en.date_enseignement, en.horaire
      FROM etudiant et
      JOIN enseignement en ON en.id_enseignement = $2
      JOIN matiere m       ON en.code_matiere    = m.code_matiere
      JOIN filiere f       ON et.code_filiere    = f.code_filiere
      WHERE et.id_etudiant = $1
    `, [id_etudiant, id_enseignement]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Données introuvables' });

    const data = result.rows[0];
    const template = absenceTemplate({
      nom:     data.nom,
      prenom:  data.prenom,
      matiere: data.nom_matiere,
      filiere: data.libele_filiere,
      date:    new Date(data.date_enseignement).toLocaleDateString('fr-FR'),
      horaire: data.horaire?.slice(0,5) || '—',
    });

    await mailer.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email_destinataire,
      subject: template.subject,
      html:    template.html,
    });

    res.json({ message: 'Email envoyé avec succès' });
  } catch (err) {
    console.error('Erreur email:', err.message);
    res.status(500).json({ error: 'Erreur envoi email: ' + err.message });
  }
});

// POST — envoyer email justification
router.post('/justification', async (req, res) => {
  const { id_etudiant, id_enseignement, justification, email_destinataire } = req.body;

  if (!email_destinataire)
    return res.status(400).json({ error: 'Email destinataire obligatoire' });

  try {
    const result = await pool.query(`
      SELECT
        et.nom, et.prenom,
        m.nom_matiere,
        en.date_enseignement
      FROM etudiant et
      JOIN enseignement en ON en.id_enseignement = $2
      JOIN matiere m       ON en.code_matiere    = m.code_matiere
      WHERE et.id_etudiant = $1
    `, [id_etudiant, id_enseignement]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Données introuvables' });

    const data = result.rows[0];
    const template = justificationTemplate({
      nom:     data.nom,
      prenom:  data.prenom,
      matiere: data.nom_matiere,
      date:    new Date(data.date_enseignement).toLocaleDateString('fr-FR'),
      motif:   justification,
    });

    await mailer.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email_destinataire,
      subject: template.subject,
      html:    template.html,
    });

    res.json({ message: 'Email envoyé avec succès' });
  } catch (err) {
    console.error('Erreur email:', err.message);
    res.status(500).json({ error: 'Erreur envoi email: ' + err.message });
  }
});

module.exports = router;