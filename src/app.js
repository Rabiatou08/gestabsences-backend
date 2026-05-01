const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://gestabsences-frontend.v Fercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth',             require('./routes/auth'));
app.use('/api/filieres',         require('./routes/filieres'));
app.use('/api/matieres',         require('./routes/matieres'));
app.use('/api/enseignants',      require('./routes/enseignants'));
app.use('/api/periodes',         require('./routes/periodes'));
app.use('/api/etudiants',        require('./routes/etudiants'));
app.use('/api/enseignements',    require('./routes/enseignements'));
app.use('/api/presences',        require('./routes/presences'));
app.use('/api/justifications',   require('./routes/justifications'));
app.use('/api/editions',         require('./routes/editions'));
app.use('/api/utilisateurs',     require('./routes/utilisateurs'));
app.use('/api/stats',            require('./routes/stats'));
app.use('/api/enseignant-espace',require('./routes/enseignant_espace'));
app.use('/api/etudiant-espace',  require('./routes/etudiant_espace'));
app.use('/api/notifications',    require('./routes/notifications'));

app.get('/', (req, res) => res.json({ message: '🚀 API GestAbsences' }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));