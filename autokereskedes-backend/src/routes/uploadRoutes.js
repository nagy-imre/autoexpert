const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');

// POST kérés egyetlen kép feltöltésére
// Az 'image' az a kulcs (mezőnév), amin a frontend a fájlt küldi majd
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nem lett fájl kiválasztva!' });
    }

    // Ha sikeres, visszaküldjük az új, generált fájlnevet
    res.status(200).json({
      message: 'Kép sikeresen feltöltve!',
      fileName: req.file.filename // pl. "1702543-856.jpg"
    });
    
  } catch (error) {
    console.error('Hiba a feltöltés során:', error);
    res.status(500).json({ message: 'Hiba a fájl feltöltésekor.', error: error.message });
  }
});

module.exports = router;