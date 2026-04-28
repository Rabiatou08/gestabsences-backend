const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header)
    return res.status(401).json({ error: 'Token manquant' });

  const token = header.split(' ')[1];
  if (!token)
    return res.status(401).json({ error: 'Token invalide' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide' });
  }
};

// Middleware pour vérifier le rôle
module.exports.requireRole = function(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Accès refusé' });
    next();
  };
};