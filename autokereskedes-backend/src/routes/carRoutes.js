const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// GET kérés: Összes autó lekérése
router.get('/', carController.getCars);

// GET kérés: Egyetlen autó lekérése ID alapján
router.get('/:id', carController.getCarById);
// POST kérés: Új autó rögzítése
router.post('/', carController.createCar);
// PUT kérés: Autó adatainak módosítása ID alapján
router.put('/:id', carController.updateCar);
// DELETE kérés: Autó törlése ID alapján
router.delete('/:id', carController.deleteCar);

module.exports = router;