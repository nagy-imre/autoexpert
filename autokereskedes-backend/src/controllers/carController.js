const fs = require('fs');
const path = require('path');
const Car = require('../models/Car');
const CarImage = require('../models/CarImage');

// --- 1. Új autó rögzítése (POST) ---
exports.createCar = async (req, res) => {
  try {
    const carData = req.body;
    const newCar = await Car.create(carData, {
      include: [{ model: CarImage, as: 'images' }]
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
      include: [{ model: CarImage, as: 'images' }],
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
      include: [{ model: CarImage, as: 'images' }]
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
    res.status(200).json({ message: 'Autó adatai sikeresen frissítve!', car: car });
  } catch (error) {
    console.error('Hiba az autó frissítésekor:', error);
    res.status(400).json({ message: 'Hiba történt az autó frissítésekor.', error: error.message });
  }
};

// --- 5. Autó törlése ID alapján (DELETE) ---
exports.deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await Car.findByPk(carId, {
      include: [{ model: CarImage, as: 'images' }]
    });
    
    if (!car) {
      return res.status(404).json({ message: 'A törölni kívánt autó nem található.' });
    }

    // BÓNUSZ: Fizikai képek eltakarítása a mappából az autó törlésekor!
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        const filePath = path.join(__dirname, '../../uploads', image.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await car.destroy(); // Ez a kaszkádolás miatt az adatbázisból is törli a CarImage rekordokat
    res.status(200).json({ message: 'Autó és a hozzá tartozó képek adatai sikeresen törölve!' });
  } catch (error) {
    console.error('Hiba az autó törlésekor:', error);
    res.status(500).json({ message: 'Hiba történt az autó törlésekor.', error: error.message });
  }
};

// --- 6. Kép csatolása autóhoz (POST) ---
exports.addImageToCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const { imageUrl, isMain } = req.body;
    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Az autó nem található.' });
    }
    const newImage = await CarImage.create({
      imageUrl: imageUrl,
      isMain: isMain || false,
      CarId: carId
    });
    res.status(201).json({ message: 'Kép sikeresen csatolva!', image: newImage });
  } catch (error) {
    console.error('Hiba a kép csatolásakor:', error);
    res.status(500).json({ message: 'Hiba történt a kép csatolásakor.', error: error.message });
  }
};

// --- 7. Autó összes képének lekérése (GET) ---
exports.getImagesByCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Az autó nem található.' });
    }
    const images = await CarImage.findAll({ where: { CarId: carId } });
    res.status(200).json(images);
  } catch (error) {
    console.error('Hiba a képek lekérésekor:', error);
    res.status(500).json({ message: 'Hiba történt a képek lekérésekor.', error: error.message });
  }
};

// --- 8. Kép adatainak módosítása (PUT) ---
exports.updateImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const { isMain } = req.body;
    const image = await CarImage.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ message: 'A kép nem található.' });
    }
    await image.update({ isMain });
    res.status(200).json({ message: 'Kép adatai sikeresen frissítve!', image: image });
  } catch (error) {
    console.error('Hiba a kép frissítésekor:', error);
    res.status(500).json({ message: 'Hiba történt a kép frissítésekor.', error: error.message });
  }
};

// --- 9. Kép törlése (DELETE) JAVÍTVA ---
exports.deleteImage = async (req, res) => {
  try {
    const { id, imageId } = req.params; // id = autó azonosítója, imageId = kép azonosítója

    // Megkeressük a képet, DE ellenőrizzük, hogy tényleg ahhoz az autóhoz tartozik-e!
    const image = await CarImage.findOne({ 
      where: { id: imageId, CarId: id } 
    });

    if (!image) {
      return res.status(404).json({ message: 'A kép nem található az adatbázisban.' });
    }

    // Fizikai fájl törlése az uploads mappából (Javított elérési út!)
    // __dirname a src/controllers mappában van. Innen 2 szintet megyünk fel (../../) és ott az uploads.
    const filePath = path.join(__dirname, '../../uploads', image.imageUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Fájl letörlése a merevlemezről
    } else {
      console.warn('A fizikai fájl már nem létezett, de az adatbázisból töröljük:', filePath);
    }

    // Adatbázis rekord törlése
    await image.destroy();

    res.status(200).json({ message: 'Kép sikeresen törölve!' });
  } catch (error) {
    console.error('Hiba a kép törlésekor:', error);
    res.status(500).json({ message: 'Hiba történt a kép törlésekor.', error: error.message });
  }
};