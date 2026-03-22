const Car = require('../models/Car');
const nodemailer = require('nodemailer');

// --- Bérlési érdeklődés küldése (csak email, adatbázis mentés nélkül) ---
exports.createRental = async (req, res) => {
  try {
    const { CarId, customerName, customerEmail, customerPhone, startDate, endDate, message } = req.body;

    const car = await Car.findByPk(CarId);

    if (!car) {
      return res.status(404).json({ message: 'A bérelni kívánt jármű nem található.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'A befejezés dátuma nem lehet korábban, mint a kezdés!' });
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const calculatedPrice = diffDays * car.rentPricePerDay;

    // Csak email küldés
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const info = await transporter.sendMail({
        from: `"AutoExpert" <${testAccount.user}>`,
        to: testAccount.user,
        subject: `AutoExpert – Új bérlési érdeklődés – ${car.brand} ${car.model}`,
        html: `
          <h2>Új bérlési érdeklődés érkezett!</h2>
          <h3>Autó adatai:</h3>
          <p><b>Márka/Modell:</b> ${car.brand} ${car.model}</p>
          <p><b>Rendszám:</b> ${car.licensePlate}</p>
          <p><b>Napi díj:</b> ${car.rentPricePerDay} Ft</p>
          <hr>
          <h3>Ügyfél adatai:</h3>
          <p><b>Név:</b> ${customerName}</p>
          <p><b>Email:</b> ${customerEmail}</p>
          <p><b>Telefon:</b> ${customerPhone}</p>
          <hr>
          <h3>Bérlés részletei:</h3>
          <p><b>Kezdés:</b> ${startDate}</p>
          <p><b>Befejezés:</b> ${endDate}</p>
          <p><b>Napok száma:</b> ${diffDays} nap</p>
          <p><b>Becsült végösszeg:</b> ${calculatedPrice} Ft</p>
          ${message ? `<hr><h3>Megjegyzés:</h3><p>${message}</p>` : ''}
        `
      });

      console.log('📧 Email elküldve! Megtekintés: %s', nodemailer.getTestMessageUrl(info));
    } catch (emailError) {
      console.error('❌ Email küldési hiba:', emailError);
    }

    res.status(200).json({ message: 'Érdeklődését sikeresen elküldtük!' });

  } catch (error) {
    console.error('Hiba az érdeklődés során:', error);
    res.status(500).json({ message: 'Hiba történt az érdeklődés során.', error: error.message });
  }
};

// --- Összes bérlés lekérése (Admin felülethez, később) ---
exports.getRentals = async (req, res) => {
  try {
    const { Rental } = require('../models/Rental');
    const rentals = await Rental.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Hiba az adatok lekérésekor.', error: error.message });
  }
};

// --- Autó visszahozatala (Admin felülethez, később) ---
exports.returnCar = async (req, res) => {
  try {
    const { Rental } = require('../models/Rental');
    const rentalId = req.params.id;
    const rental = await Rental.findByPk(rentalId);

    if (!rental) {
      return res.status(404).json({ message: 'A keresett bérlés nem található.' });
    }

    await rental.update({ status: 'completed' });

    const car = await Car.findByPk(rental.CarId);
    if (car) {
      await car.update({ isAvailable: true });
    }

    res.status(200).json({ message: 'A bérlés lezárva!', rental: rental });
  } catch (error) {
    res.status(500).json({ message: 'Hiba történt a folyamat során.', error: error.message });
  }
};