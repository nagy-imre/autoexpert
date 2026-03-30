const { Op } = require('sequelize');
const Car = require('../models/Car');
const Rental = require('../models/Rental');

exports.getRentals = async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      include: [{
        model: Car,
        attributes: ['id', 'brand', 'model', 'licensePlate', 'rentPricePerDay', 'deposit']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Hiba az adatok lekérésekor.', error: error.message });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findByPk(req.params.id, {
      include: [{ model: Car, attributes: ['id', 'brand', 'model', 'licensePlate', 'rentPricePerDay', 'deposit'] }]
    });
    if (!rental) {
      return res.status(404).json({ message: 'A keresett bérlés nem található.' });
    }
    res.status(200).json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Hiba a lekérés során.', error: error.message });
  }
};

exports.createRental = async (req, res) => {
  try {
    const { carId, customerName, customerEmail, customerPhone, startDate, endDate, totalPrice } = req.body;

    if (!carId || !customerName || !customerEmail || !customerPhone || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ message: 'Minden mező kitöltése kötelező.' });
    }

    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'A megadott autó nem található.' });
    }
    if (car.purpose !== 'rent') {
      return res.status(400).json({ message: 'Ez az autó nem bérelhető.' });
    }
    if (car.status !== 'AVAILABLE' && car.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Az autó jelenleg nem elérhető bérlésre.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'A záró dátumnak a kezdő dátum után kell lennie.' });
    }

    // Ütközés ellenőrzés: van-e már aktív vagy függőben lévő bérlés erre az autóra ebben az időszakban?
    const conflicting = await Rental.findOne({
      where: {
        CarId: carId,
        status: { [Op.in]: ['pending', 'active'] },
        startDate: { [Op.lt]: endDate },
        endDate:   { [Op.gt]: startDate }
      }
    });

    if (conflicting) {
      return res.status(409).json({
        message: `Ez az autó már foglalt ${conflicting.startDate} – ${conflicting.endDate} között. Kérlek válassz másik időszakot vagy járművet.`
      });
    }

    const rental = await Rental.create({
      CarId: carId,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      totalPrice,
      status: 'pending'
    });

    await car.update({ status: 'RESERVED' });

    res.status(201).json({ message: 'Bérlés sikeresen rögzítve!', rental });

  } catch (error) {
    console.error('Hiba a bérlés rögzítésekor:', error);
    res.status(500).json({ message: 'Hiba történt a bérlés rögzítésekor.', error: error.message });
  }
};

exports.updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'active', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Érvénytelen státusz.' });
    }

    const rental = await Rental.findByPk(req.params.id, {
      include: [{ model: Car }]
    });
    if (!rental) {
      return res.status(404).json({ message: 'A keresett bérlés nem található.' });
    }

    const validTransitions = {
      pending:   ['active', 'cancelled'],
      active:    ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[rental.status].includes(status)) {
      return res.status(400).json({
        message: `Nem lehet átváltani '${rental.status}' státuszból '${status}' státuszba.`
      });
    }

    await rental.update({ status });

    if (rental.Car) {
      let carStatus;
      if (status === 'active')    carStatus = 'RENTED';
      if (status === 'completed') carStatus = 'AVAILABLE';
      if (status === 'cancelled') carStatus = 'AVAILABLE';
      if (carStatus) await rental.Car.update({ status: carStatus });
    }

    res.status(200).json({ message: 'Státusz sikeresen módosítva.', rental });

  } catch (error) {
    res.status(500).json({ message: 'Hiba a státusz módosításakor.', error: error.message });
  }
};

exports.deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findByPk(req.params.id, {
      include: [{ model: Car }]
    });
    if (!rental) {
      return res.status(404).json({ message: 'A keresett bérlés nem található.' });
    }

    if ((rental.status === 'pending' || rental.status === 'active') && rental.Car) {
      await rental.Car.update({ status: 'AVAILABLE' });
    }

    await rental.destroy();
    res.status(200).json({ message: 'Bérlés sikeresen törölve.' });

  } catch (error) {
    res.status(500).json({ message: 'Hiba a törlés során.', error: error.message });
  }
};