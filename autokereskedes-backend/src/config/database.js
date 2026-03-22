const { Sequelize } = require('sequelize');
const path = require('path');

// Új Sequelize példány létrehozása SQLite beállításokkal
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Az adatbázis fájl a projekt legkülső mappájába (a package.json mellé) fog kerülni
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false // Ne írja ki az összes SQL parancsot a terminálba (később hibakeresésnél hasznos lehet true-ra tenni)
});

module.exports = sequelize;