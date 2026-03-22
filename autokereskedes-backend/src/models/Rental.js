const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rental = sequelize.define('Rental', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // --- ÜGYFÉL ADATAI ---
  // Hogy ne kelljen egy bonyolult felhasználó-kezelő (Login/Regisztráció) rendszert 
  // felépítenünk rögtön, a legegyszerűbb, ha a bérléshez rögzítjük az ügyfél adatait.
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerEmail: { type: DataTypes.STRING, allowNull: false },
  customerPhone: { type: DataTypes.STRING, allowNull: false },

  // --- BÉRLÉS IDŐTARTAMA ---
  // A DATEONLY típus tökéletes ide, mert csak az évet, hónapot és napot tárolja, órát/percet nem.
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },

  // --- PÉNZÜGYEK ÉS STÁTUSZ ---
  totalPrice: { 
    type: DataTypes.INTEGER, 
    allowNull: false // Ezt majd a backend számolja ki a napok száma * napi díj alapján!
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending', // Alapból "függőben" van
    validate: {
      // Csak ezeket az állapotokat engedjük
      isIn: [['pending', 'active', 'completed', 'cancelled']] 
    }
  }
}, {
  timestamps: true
});

module.exports = Rental;