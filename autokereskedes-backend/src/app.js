const express = require('express');
const cors = require('cors');
const path = require('path');

// --- ÚTVONALAK IMPORTÁLÁSA ---
const carRoutes = require('./routes/carRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200', // Engedélyezzük az Angular felületet
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Fontos a token miatt!
}));

app.use(cors());
app.use(express.json());

// --- STATIKUS MAPPA BEÁLLÍTÁSA ---
// Ez teszi lehetővé, hogy a http://localhost:5000/uploads/kepneve.jpg URL-en betöltődjön a kép
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Autókereskedés API fut!' });
});

// --- ÚTVONALAK REGISZTRÁLÁSA ---
app.use('/api/cars', carRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));

module.exports = app;