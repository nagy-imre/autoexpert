const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarImage = sequelize.define('CarImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false // Ide kerül majd a fájlnév vagy az URL (pl. 'hyundai-elol.jpg')
  },
  isMain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Ezzel jelöljük meg, hogy melyik a "borítókép", amit a listában mutatunk
  }
}, {
  timestamps: true
});

module.exports = CarImage;