const Car = require('../models/Car');
const CarImage = require('../models/CarImage');

// --- 1. Új autó rögzítése (POST) ---
exports.createCar = async (req, res) => {
  try {
    const carData = req.body;
    const newCar = await Car.create(carData, {
      include: [{
        model: CarImage,
        as: 'images'
      }]
    });
    res.status(201).json({ message: 'Autó sikeresen rögzítve!', car: newCar });
  } catch (error) {
    console.error('Hiba az autó rögzítésekor:', error);
    res.status(400).json({ message: 'Hiba történt az autó rögzítésekor.', error: error.message });
  }
};

// --- 2. Összes autó lekérése (GET, szűréssel) ---
exports.getCars = async (req, res) => {
  try {
    const { purpose } = req.query; 
    const whereClause = {};
    if (purpose) {
      whereClause.purpose = purpose;
    }
    const cars = await Car.findAll({
      where: whereClause,
      include: [{
        model: CarImage,
        as: 'images' 
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(cars);
  } catch (error) {
    console.error('Hiba az autók lekérésekor:', error);
    res.status(500).json({ message: 'Hiba történt az autók lekérésekor a szerveren.', error: error.message });
  }
};

// --- 3. Egy konkrét autó lekérése ID alapján (GET) ---
exports.getCarById = async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await Car.findByPk(carId, {
      include: [{
        model: CarImage,
        as: 'images'
      }]
    });

    if (!car) {
      return res.status(404).json({ message: 'A keresett autó nem található.' });
    }
    res.status(200).json(car);
  } catch (error) {
    console.error('Hiba az autó lekérésekor:', error);
    res.status(500).json({ message: 'Hiba történt az autó lekérésekor a szerveren.', error: error.message });
  }
};

// --- 4. Autó adatainak módosítása ID alapján (PUT) ---
exports.updateCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const updateData = req.body;

    const car = await Car.findByPk(carId);

    if (!car) {
      return res.status(404).json({ message: 'A módosítani kívánt autó nem található.' });
    }

    await car.update(updateData);

    res.status(200).json({
      message: 'Autó adatai sikeresen frissítve!',
      car: car
    });
  } catch (error) {
    console.error('Hiba az autó frissítésekor:', error);
    res.status(400).json({ message: 'Hiba történt az autó frissítésekor.', error: error.message });
  }
};

// --- 5. Autó törlése ID alapján (DELETE) ---
exports.deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    
    // Megkeressük a törölni kívánt autót
    const car = await Car.findByPk(carId);

    if (!car) {
      return res.status(404).json({ message: 'A törölni kívánt autó nem található.' });
    }

    // A Sequelize 'destroy' metódusával véglegesen töröljük az adatbázisból.
    // Emlékszel? Mivel a server.js-ben beállítottuk az 'onDelete: CASCADE' opciót, 
    // a törölt autóhoz tartozó képek is automatikusan törlődni fognak a CarImages táblából!
    await car.destroy();

    res.status(200).json({ message: 'Autó és a hozzá tartozó képek adatai sikeresen törölve!' });

  } catch (error) {
    console.error('Hiba az autó törlésekor:', error);
    res.status(500).json({ 
      message: 'Hiba történt az autó törlésekor.', 
      error: error.message 
    });
  }
};