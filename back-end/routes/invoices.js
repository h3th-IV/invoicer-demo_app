const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../middleware/auth');

// All invoice routes require authentication
router.use(authenticateToken);

router.post('/create', InvoiceController.createInvoice);
router.get('/list', InvoiceController.getInvoices);
router.put('/update-status/:id', InvoiceController.updateStatus);
router.get('/:id', InvoiceController.getSingleInvoice);

module.exports = router;