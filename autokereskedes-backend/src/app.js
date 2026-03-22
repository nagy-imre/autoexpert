const express = require('express');
const cors = require('cors');
const path = require('path');

// --- ÚTVONALAK IMPORTÁLÁSA ---
const carRoutes = require('./routes/carRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// --- STATIKUS MAPPA BEÁLLÍTÁSA ---
// Ez teszi lehetővé, hogy a http://localhost:5000/uploads/kepneve.jpg URL-en betöltődjön a kép
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Autókereskedés API fut!' });
});

// --- ÚTVONALAK REGISZTRÁLÁSA ---
// Minden, ami a /api/cars útvonalra jön, azt a carRoutes fogja kezelni
app.use('/api/cars', carRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/inquiries', inquiryRoutes);

module.exports = app;