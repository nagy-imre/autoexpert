const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

router.get('/',           rentalController.getRentals);
router.get('/:id',        rentalController.getRentalById);
router.post('/',          rentalController.createRental);
router.patch('/:id/status', rentalController.updateRentalStatus);
router.delete('/:id',     rentalController.deleteRental);

module.exports = router;