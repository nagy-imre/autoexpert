require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

// 1. Modellek importálása
const Car = require('./models/Car');
const CarImage = require('./models/CarImage');
const Rental = require('./models/Rental');
const User = require('./models/User');

// 2. Relációk beállítása
Car.hasMany(CarImage, { as: 'images', foreignKey: 'CarId', onDelete: 'CASCADE' });
CarImage.belongsTo(Car, { foreignKey: 'CarId' });


// --- ÚJ RELÁCIÓK A BÉRLÉSHEZ ---
// Egy autónak sok bérlése lehet.
Car.hasMany(Rental, { foreignKey: 'CarId' });
// Egy adott bérlés pontosan egy autóhoz tartozik.
Rental.belongsTo(Car, { foreignKey: 'CarId' });


const PORT = process.env.PORT || 5000;

// 3. Adatbázis szinkronizálása
// Mivel ismét új táblát hoztunk létre, egyetlen indulás erejéig állítsuk 'alter: true'-ra!
// (A 'force: true' mindent törölne, az 'alter' viszont csak frissíti a szerkezetet anélkül, hogy a felvitt autóid elvesznének!)
sequelize.sync({ }) 
  .then(() => {
    console.log('✅ Adatbázis sikeresen szinkronizálva.');
    
    app.listen(PORT, () => {
      console.log(`🚀 A szerver fut a http://localhost:${PORT} címen.`);
    });
  })
  .catch((err) => {
    console.error('❌ Hiba az adatbázis csatlakozásakor:', err);
  });