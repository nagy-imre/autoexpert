const Car = require('../models/Car');
const nodemailer = require('nodemailer');

exports.createInquiry = async (req, res) => {
  try {
    const { CarId, customerName, customerEmail, customerPhone, message, inquiryType, startDate, endDate, topic } = req.body;

    let car = null;
    
    if (CarId) {
      car = await Car.findByPk(CarId);
      if (!car) {
        return res.status(404).json({ message: 'A hivatkozott autó nem található.' });
      }
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

      let subjectText = "Általános megkeresés";
      let carDetailsHtml = "";
      
      const topicText = topic === 'sale' ? 'Autóvásárlás' : 
                        topic === 'rent' ? 'Autóbérlés' : 
                        topic === 'service' ? 'Szerviz / Garancia' : 'Egyéb kérdés';

      if (car) {
        const isRent = inquiryType === 'rent';
        subjectText = isRent ? `Új bérlési érdeklődés – ${car.brand} ${car.model}` : `Új vásárlási érdeklődés – ${car.brand} ${car.model}`;

        const priceText = isRent 
          ? `<p><b>Napi bérleti díj:</b> ${car.rentPricePerDay} Ft</p>` 
          : `<p><b>Irányár:</b> ${car.salePrice} Ft</p>`;

        const datesText = (isRent && startDate && endDate) 
          ? `<p><b>Tervezett időszak:</b> ${startDate} - ${endDate}</p>` 
          : '';

        carDetailsHtml = `
          <h3>Autó adatai:</h3>
          <p><b>Márka/Modell:</b> ${car.brand} ${car.model}</p>
          <p><b>Rendszám:</b> ${car.licensePlate}</p>
          ${priceText}
          ${datesText}
          <hr>
        `;
      } 
      else {
        subjectText = `Új kapcsolatfelvételi űrlap kitöltés: ${topicText}`;
      }

      const info = await transporter.sendMail({
        from: `"AutoExpert Weboldal" <${testAccount.user}>`,
        to: testAccount.user,
        subject: `🚗 ${subjectText}`,
        html: `
          <h2>${car ? subjectText : 'Új általános megkeresés érkezett!'}</h2>
          ${carDetailsHtml}
          <h3>Érdeklődő adatai:</h3>
          <p><b>Név:</b> ${customerName}</p>
          <p><b>Email:</b> ${customerEmail}</p>
          <p><b>Telefon:</b> ${customerPhone}</p>
          ${!car && topic ? `<p><b>Téma:</b> ${topicText}</p>` : ''}
          ${message ? `<hr><h3>Üzenet / Megjegyzés:</h3><p>${message}</p>` : ''}
        `
      });

      console.log('📧 Email elküldve! Megtekintés: %s', nodemailer.getTestMessageUrl(info));
    } catch (emailError) {
      console.error('❌ Email küldési hiba:', emailError);
    }

    res.status(200).json({ message: 'Üzenetét sikeresen elküldtük!' });

  } catch (error) {
    console.error('Hiba az üzenet küldése során:', error);
    res.status(500).json({ message: 'Hiba történt a küldés során.', error: error.message });
  }
};