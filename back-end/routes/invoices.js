const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');

router.post('/create', InvoiceController.createInvoice);
router.get('/list', InvoiceController.getInvoices);
router.put('/update-status/:id', InvoiceController.updateStatus);

module.exports = router;