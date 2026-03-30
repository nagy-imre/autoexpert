const User = require('../models/User');

// Felhasználók listázása (A jelszavakat KIZÁRJUK a válaszból biztonsági okokból!)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Hiba a felhasználók lekérésekor.', error: error.message });
  }
};

// Új munkatárs felvétele
exports.createUser = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    
    // Ellenőrizzük, hogy foglalt-e a felhasználónév
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ez a felhasználónév már foglalt!' });
    }

    // A jelszót a User.js hook-ja automatikusan titkosítja!
    const newUser = await User.create({ username, password, name, role });
    
    res.status(201).json({ message: 'Felhasználó sikeresen létrehozva!', user: { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: 'Hiba a felhasználó létrehozásakor.', error: error.message });
  }
};

// Munkatárs törlése
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Felhasználó nem található!' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'Főadminisztrátort nem lehet törölni!' });

    await user.destroy();
    res.status(200).json({ message: 'Felhasználó sikeresen törölve.' });
  } catch (error) {
    res.status(500).json({ message: 'Hiba a törlés során.', error: error.message });
  }
};