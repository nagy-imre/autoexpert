const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Beépített fájlrendszer modul

// 1. Meghatározzuk a pontos útvonalat
// __dirname = src/middlewares
// ../../ = autokereskedes-backend (a projekt gyökere)
const uploadDir = path.join(__dirname, '../../uploads');

// 2. Ha nem létezik a mappa, létrehozzuk!
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Uploads mappa sikeresen létrehozva!');
}

// 3. Tárolási beállítások
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Ide mentjük a fájlt
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 4. Biztonsági szűrés: Csak képfájlokat engedünk
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); 
  } else {
    cb(new Error('Csak képfájlok feltöltése engedélyezett!'), false); 
  }
};

// 5. A Multer inicializálása
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;