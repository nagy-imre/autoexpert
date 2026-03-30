const Car = require('../models/Car');
const nodemailer = require('nodemailer');

exports.createInquiry = async (req, res) => {
  try {
    const { CarId, customerName, customerEmail, customerPhone, message, inquiryType, startDate, endDate } = req.body;

    const car = await Car.findByPk(CarId);

    if (!car) {
      return res.status(404).json({ message: 'Az autó nem található.' });
    }

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

      // Dinamikusan állítjuk össze a levél szövegét aszerint, hogy eladás vagy bérlés
      const isRent = inquiryType === 'rent';
      const subjectText = isRent ? 'bérlési' : 'vásárlási';
      
      // Ha bérlés, a napi díjat írjuk ki, ha vásárlás, akkor az eladási árat
      const priceText = isRent 
        ? `<p><b>Napi bérleti díj:</b> ${car.rentPricePerDay} Ft</p>` 
        : `<p><b>Irányár:</b> ${car.salePrice} Ft</p>`;
        
      // Ha bérlés, beleírjuk a kért dátumokat is
      const datesText = (isRent && startDate && endDate) 
        ? `<p><b>Tervezett időszak:</b> ${startDate} - ${endDate}</p>` 
        : '';

      const info = await transporter.sendMail({
        from: `"AutoExpert" <${testAccount.user}>`,
        to: testAccount.user, // Ide mehet majd a saját email címed, ha élesíted
        subject: `🚗 Új ${subjectText} érdeklődés – ${car.brand} ${car.model}`,
        html: `
          <h2>Új ${subjectText} érdeklődés érkezett!</h2>
          <h3>Autó adatai:</h3>
          <p><b>Márka/Modell:</b> ${car.brand} ${car.model}</p>
          <p><b>Rendszám:</b> ${car.licensePlate}</p>
          ${priceText}
          <hr>
          <h3>Érdeklődő adatai:</h3>
          <p><b>Név:</b> ${customerName}</p>
          <p><b>Email:</b> ${customerEmail}</p>
          <p><b>Telefon:</b> ${customerPhone}</p>
          ${datesText}
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