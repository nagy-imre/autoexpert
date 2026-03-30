const jwt = require('jsonwebtoken');

// Token ellenőrzés
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Hozzáférés megtagadva! Bejelentkezés szükséges.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Érvénytelen vagy lejárt token!' });
  }
};

// Jogosultság ellenőrzés
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Nincs jogosultsága ehhez a művelethez!' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };