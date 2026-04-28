function absenceTemplate({ nom, prenom, matiere, date, horaire, filiere }) {
  return {
    subject: `⚠️ Absence signalée — ${prenom} ${nom}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #F5F4F0; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff;
                 border-radius: 12px; overflow: hidden;
                 box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #2563EB; padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p  { color: rgba(255,255,255,.8); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 28px 32px; }
    .alert { background: #FEE2E2; border: 1px solid #FECACA;
             border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
    .alert p { color: #DC2626; margin: 0; font-size: 14px; font-weight: 600; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table td { padding: 10px 0; border-bottom: 1px solid #F0EEE9;
                     font-size: 14px; color: #1A1916; }
    .info-table td:first-child { color: #6B6760; width: 40%; }
    .footer { background: #F5F4F0; padding: 16px 32px; text-align: center; }
    .footer p { color: #A09C97; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GestAbsences</h1>
      <p>Système de Gestion des Absences</p>
    </div>
    <div class="body">
      <div class="alert">
        <p>⚠️ Une absence a été signalée pour votre enfant</p>
      </div>
      <p style="font-size:15px; color:#1A1916; margin-bottom:20px;">
        Bonjour, nous vous informons que <strong>${prenom} ${nom}</strong>
        a été absent(e) lors de la séance suivante :
      </p>
      <table class="info-table">
        <tr>
          <td>Étudiant(e)</td>
          <td><strong>${prenom} ${nom}</strong></td>
        </tr>
        <tr>
          <td>Filière</td>
          <td>${filiere}</td>
        </tr>
        <tr>
          <td>Matière</td>
          <td>${matiere}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>${date}</td>
        </tr>
        <tr>
          <td>Horaire</td>
          <td>${horaire}</td>
        </tr>
      </table>
      <p style="font-size:13px; color:#6B6760; line-height:1.6;">
        Si cette absence est justifiée, veuillez contacter l'administration
        ou l'enseignant concerné dans les plus brefs délais.
      </p>
    </div>
    <div class="footer">
      <p>Ce message est envoyé automatiquement par GestAbsences — Ne pas répondre</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

function justificationTemplate({ nom, prenom, matiere, date, motif }) {
  return {
    subject: `✅ Absence justifiée — ${prenom} ${nom}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #F5F4F0; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff;
                 border-radius: 12px; overflow: hidden;
                 box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #16A34A; padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p  { color: rgba(255,255,255,.8); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 28px 32px; }
    .success { background: #DCFCE7; border: 1px solid #BBF7D0;
               border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
    .success p { color: #16A34A; margin: 0; font-size: 14px; font-weight: 600; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table td { padding: 10px 0; border-bottom: 1px solid #F0EEE9;
                     font-size: 14px; color: #1A1916; }
    .info-table td:first-child { color: #6B6760; width: 40%; }
    .footer { background: #F5F4F0; padding: 16px 32px; text-align: center; }
    .footer p { color: #A09C97; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GestAbsences</h1>
      <p>Système de Gestion des Absences</p>
    </div>
    <div class="body">
      <div class="success">
        <p>✅ L'absence de votre enfant a été justifiée</p>
      </div>
      <p style="font-size:15px; color:#1A1916; margin-bottom:20px;">
        Bonjour, nous vous informons que l'absence de
        <strong>${prenom} ${nom}</strong> a été justifiée.
      </p>
      <table class="info-table">
        <tr>
          <td>Étudiant(e)</td>
          <td><strong>${prenom} ${nom}</strong></td>
        </tr>
        <tr>
          <td>Matière</td>
          <td>${matiere}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>${date}</td>
        </tr>
        <tr>
          <td>Motif</td>
          <td>${motif}</td>
        </tr>
      </table>
    </div>
    <div class="footer">
      <p>Ce message est envoyé automatiquement par GestAbsences — Ne pas répondre</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

module.exports = { absenceTemplate, justificationTemplate };