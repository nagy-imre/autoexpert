require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../models/User');

const users = [
  { 
    username: 'superadmin', 
    password: 'Admin1234!', // Ezzel fogsz tudni belépni!
    role: 'superadmin', 
    name: 'Darányi Zsolt' 
  }
];

sequelize.sync({}).then(async () => {
  for (const userData of users) {
    const existing = await User.findOne({ where: { username: userData.username } });
    if (!existing) {
      await User.create(userData);
      console.log(`✅ Létrehozva: ${userData.username}`);
    } else {
      console.log(`⚠️ Már létezik: ${userData.username}`);
    }
  }
  console.log('🎉 Biztonságos Seed kész!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Hiba:', err);
  process.exit(1);
});