const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// Autó CRUD
router.get('/', carController.getCars);
router.get('/:id', carController.getCarById);
router.post('/', carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

// Kép CRUD
router.get('/:id/images', carController.getImagesByCar);
router.post('/:id/images', carController.addImageToCar);
router.put('/:id/images/:imageId', carController.updateImage);
router.delete('/:id/images/:imageId', carController.deleteImage);

module.exports = router;