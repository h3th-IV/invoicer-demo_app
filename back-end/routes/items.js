const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');

console.log("threader");
router.get('/single/:id', ItemController.getSingleItem);
console.log('got here');
router.post('/add', ItemController.addItem);
router.get('/', ItemController.getAllItems);
router.put('/update/:id', ItemController.updateItem);
router.delete('/delete/:id', ItemController.deleteItem);
router.put('/mark-out-of-stock/:id', ItemController.markOutOfStock);

module.exports = router;