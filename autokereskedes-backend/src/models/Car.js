const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // --- 1. AZONOSÍTÓ ADATOK ---
  vin: { type: DataTypes.STRING(17), allowNull: true, unique: false }, // Alvázszám
  licensePlate: { type: DataTypes.STRING, allowNull: false, unique: true },
  internalId: { type: DataTypes.STRING, allowNull: true }, // Kereskedés belső azonosítója
  motExpiry: { type: DataTypes.DATEONLY, allowNull: true }, // Műszaki vizsga lejárata
  
  // --- 2. ALAPADATOK ---
  brand: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  mileage: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  
  // --- 3. MŰSZAKI ÉS KAROSSZÉRIA ADATOK ---
  bodyType: { type: DataTypes.STRING, allowNull: true }, // pl. Sedan, SUV, Kombi
  fuelType: { type: DataTypes.STRING, allowNull: true },
  transmission: { type: DataTypes.STRING, allowNull: true },
  driveType: { type: DataTypes.STRING, allowNull: true }, // pl. FWD, RWD, AWD
  engineCapacity: { type: DataTypes.INTEGER, allowNull: true },
  horsepower: { type: DataTypes.INTEGER, allowNull: true },
  color: { type: DataTypes.STRING, allowNull: true },
  doors: { type: DataTypes.INTEGER, allowNull: true },
  seats: { type: DataTypes.INTEGER, allowNull: true },

  // --- 4. ÁLLAPOT ÉS ELŐÉLET ---
  condition: { 
    type: DataTypes.ENUM('new', 'excellent', 'normal', 'damaged'), 
    defaultValue: 'normal' 
  },
  serviceBook: { 
    type: DataTypes.ENUM('full_dealer', 'partial', 'none'), 
    allowNull: true 
  },
  isCrashed: { type: DataTypes.BOOLEAN, defaultValue: false }, // Törésmentes-e (Igen=false, Nem=true)
  previousOwners: { type: DataTypes.INTEGER, defaultValue: 1 },

  // --- 5. LEÍRÁS ÉS FELSZERELTSÉG ---
  description: { type: DataTypes.TEXT, allowNull: true },
  features: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  
  // --- 6. KERESKEDELMI ÉS PÉNZÜGYI ADATOK ---
  purpose: {
    type: DataTypes.ENUM('sale', 'rent'),
    allowNull: false
  },
  // STÁTUSZ (Az Igen/Nem isAvailable helyett sokkal profibb!)
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'RESERVED', 'RENTED', 'IN_SERVICE', 'SOLD'),
    defaultValue: 'AVAILABLE'
  },
  purchasePrice: { type: DataTypes.INTEGER, allowNull: true }, // Beszerzési ár (csak belső infó)
  salePrice: { type: DataTypes.INTEGER, allowNull: true }, // Eladási vagy Piaci ár
  vatReclaimable: { type: DataTypes.BOOLEAN, defaultValue: false }, // ÁFA visszaigényelhető-e

  // --- 7. KIFEJEZETTEN BÉRLÉSHEZ ---
  rentPricePerDay: { type: DataTypes.INTEGER, allowNull: true },
  deposit: { type: DataTypes.INTEGER, allowNull: true }, // Kaució
  dailyKmLimit: { type: DataTypes.INTEGER, defaultValue: 300 }, // Napi km limit
  extraKmFee: { type: DataTypes.INTEGER, defaultValue: 50 } // Túlfutási díj (Ft/km)

}, {
  timestamps: true,
  
  // --- HOOKS: AUTOMATIZÁLÁSOK ---
  hooks: {
    beforeValidate: (car) => {
      // KAUCIÓ AUTOMATIKUS KISZÁMÍTÁSA
      if (car.purpose === 'rent' && !car.deposit) {
        let calculatedDeposit = 100000; // Alapértelmezett minimum

        if (car.salePrice) {
          // Ha tudjuk az autó értékét, sávosan számolunk (Életszerű!)
          if (car.salePrice >= 15000000) calculatedDeposit = 500000;
          else if (car.salePrice >= 8000000) calculatedDeposit = 300000;
          else if (car.salePrice >= 3000000) calculatedDeposit = 200000;
          else calculatedDeposit = 100000;
        } else if (car.rentPricePerDay) {
          // Vészmegoldás: ha nincs megadva érték, a napi díj 15-szöröse
          calculatedDeposit = car.rentPricePerDay * 15;
          // De kerekítsük be 100k és 500k közé
          if (calculatedDeposit < 100000) calculatedDeposit = 100000;
          if (calculatedDeposit > 500000) calculatedDeposit = 500000;
        }
        
        car.deposit = calculatedDeposit;
      }
    }
  }
});

module.exports = Car;