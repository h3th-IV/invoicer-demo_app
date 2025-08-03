const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');

router.post('/add', ItemController.addItem);
router.put('/update/:id', ItemController.updateItem);
router.get('/', ItemController.getAllItems);
router.delete('/delete/:id', ItemController.deleteItem);
router.put('/mark-out-of-stock/:id', ItemController.markOutOfStock);

module.exports = router;