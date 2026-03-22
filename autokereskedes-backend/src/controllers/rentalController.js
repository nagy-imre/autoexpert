const Rental = require('../models/Rental');
const Car = require('../models/Car');

// --- 1. Új bérlés rögzítése ---
exports.createRental = async (req, res) => {
  try {
    const { CarId, customerName, customerEmail, customerPhone, startDate, endDate } = req.body;

    // 1. Ellenőrizzük, hogy létezik-e az autó, és lekérjük az adatait
    const car = await Car.findByPk(CarId);

    if (!car) {
      return res.status(404).json({ message: 'A bérelni kívánt jármű nem található.' });
    }

    // 2. Biztonsági ellenőrzés: Csak bérelhető autót lehessen kivenni!
    if (car.purpose !== 'rent') {
      return res.status(400).json({ message: 'Ez a jármű csak eladásra van hirdetve, nem bérelhető!' });
    }

    // 3. Kiszámoljuk a napok számát
    // A JavaScript Date objektumával a dátumokat milliszekundumokká alakítjuk, kivonjuk, majd visszaosztjuk napokká
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ha a kezdő dátum későbbi, mint a befejező, hibát dobunk
    if (start >= end) {
      return res.status(400).json({ message: 'A befejezés dátuma nem lehet korábban, mint a kezdés!' });
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Milliszekundum -> Nap

    // 4. Kiszámoljuk a végösszeget (Napok száma * Napi bérleti díj)
    const calculatedPrice = diffDays * car.rentPricePerDay;

    // 5. Elmentjük a bérlést az adatbázisba
    const newRental = await Rental.create({
      CarId: CarId,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      startDate: startDate,
      endDate: endDate,
      totalPrice: calculatedPrice, // A MI kiszámolt, biztonságos árunk!
      status: 'active' // Mivel most vette ki, egyből aktívra tesszük
    });

    // Opcionális bónusz: Az autót "nem elérhetővé" tesszük, hiszen épp kikölcsönözték!
    await car.update({ isAvailable: false });

    res.status(201).json({
      message: 'Bérlés sikeresen rögzítve!',
      rental: newRental,
      days: diffDays
    });

  } catch (error) {
    console.error('Hiba a bérlés rögzítésekor:', error);
    res.status(500).json({ message: 'Hiba történt a bérlés rögzítésekor.', error: error.message });
  }
};

// --- 2. Összes bérlés lekérése (Admin felülethez) ---
exports.getRentals = async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      include: [{
        model: Car,
        attributes: ['brand', 'model', 'licensePlate'] // Nem kérjük le az autó minden adatát, csak a legfontosabbakat
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Hiba az adatok lekérésekor.', error: error.message });
  }
};

// --- 3. Autó visszahozatala (Bérlés lezárása) ---
exports.returnCar = async (req, res) => {
  try {
    const rentalId = req.params.id;

    // 1. Megkeressük magát a bérlést az adatbázisban
    const rental = await Rental.findByPk(rentalId);

    if (!rental) {
      return res.status(404).json({ message: 'A keresett bérlés nem található.' });
    }

    // Biztonsági ellenőrzés: Ne lehessen kétszer lezárni ugyanazt
    if (rental.status === 'completed') {
      return res.status(400).json({ message: 'Ez a bérlés már le lett zárva korábban!' });
    }

    // 2. Átállítjuk a bérlés státuszát befejezettre
    await rental.update({ status: 'completed' });

    // 3. Megkeressük a bérléshez tartozó autót, és újra elérhetővé tesszük!
    const car = await Car.findByPk(rental.CarId);
    if (car) {
      await car.update({ isAvailable: true });
    }

    res.status(200).json({
      message: 'A bérlés lezárva!',
      rental: rental
    });

  } catch (error) {
    console.error('Hiba az autó visszahozatalakor:', error);
    res.status(500).json({ 
      message: 'Hiba történt a folyamat során.', 
      error: error.message 
    });
  }
};