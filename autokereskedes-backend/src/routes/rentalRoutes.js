const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

// GET: Összes bérlés lekérése
router.get('/', rentalController.getRentals);

// POST: Új bérlés rögzítése
router.post('/', rentalController.createRental);

// PUT: Autó visszahozatala (Bérlés lezárása ID alapján)
router.put('/:id/return', rentalController.returnCar);

module.exports = router;