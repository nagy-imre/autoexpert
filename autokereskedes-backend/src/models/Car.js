const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // --- 1. ALAPADATOK ---
  brand: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },
  licensePlate: { type: DataTypes.STRING, allowNull: false, unique: true },
  year: { type: DataTypes.INTEGER, allowNull: false },
  mileage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  
  // --- 2. MŰSZAKI ADATOK ---
  fuelType: { type: DataTypes.STRING, allowNull: true },
  transmission: { type: DataTypes.STRING, allowNull: true },
  engineCapacity: { type: DataTypes.INTEGER, allowNull: true },
  horsepower: { type: DataTypes.INTEGER, allowNull: true },
  color: { type: DataTypes.STRING, allowNull: true },

  // --- 3. LEÍRÁS ÉS FELSZERELTSÉG ---
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  features: { 
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: []
  },
  
  // FIGYELEM: A mainImage oszlop innen kikerült! A képeket a CarImage tábla kezeli.

  // --- 4. KATEGÓRIA ---
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['sale', 'rent']] }
  },

  // --- 5. ÁRAK ---
  salePrice: { type: DataTypes.INTEGER, allowNull: true },
  rentPricePerDay: { type: DataTypes.INTEGER, allowNull: true },

  // --- 6. STÁTUSZ ---
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: true
});

module.exports = Car;