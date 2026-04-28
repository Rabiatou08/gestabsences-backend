CREATE TABLE IF NOT EXISTS filiere (
  code_filiere   SERIAL PRIMARY KEY,
  libele_filiere VARCHAR(50) NOT NULL,
  nbre_etudiant  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matiere (
  code_matiere   SERIAL PRIMARY KEY,
  nom_matiere    VARCHAR(50) NOT NULL,
  volume_horaire INT DEFAULT 0,
  code_filiere   INT REFERENCES filiere(code_filiere) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enseignant (
  id_enseignant SERIAL PRIMARY KEY,
  nom           VARCHAR(50) NOT NULL,
  prenom        VARCHAR(50) NOT NULL,
  mail          VARCHAR(100),
  specialite    VARCHAR(50),
  diplome       VARCHAR(50),
  sexe          CHAR(1) DEFAULT 'M'
);

CREATE TABLE IF NOT EXISTS periode (
  id_periode  SERIAL PRIMARY KEY,
  libelle     VARCHAR(100) NOT NULL,
  date_debut  DATE NOT NULL,
  date_fin    DATE NOT NULL
);

-- Le mot de passe est "admin123" (déjà hashé)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role)
VALUES (
  'Admin', 'System',
  'admin@gestabsences.ci',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);

ALTER TABLE etudiant ADD COLUMN IF NOT EXISTS email_parent VARCHAR(100);