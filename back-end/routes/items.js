const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');
const { authenticateToken } = require('../middleware/auth');

// All item routes require authentication
router.use(authenticateToken);

// All routes accessible to staff
router.get('/single/:id', ItemController.getSingleItem);
router.get('/', ItemController.getAllItems);
router.post('/add', ItemController.addItem);
router.put('/update/:id', ItemController.updateItem);
router.delete('/delete/:id', ItemController.deleteItem);
router.put('/mark-out-of-stock/:id', ItemController.markOutOfStock);

module.exports = router;