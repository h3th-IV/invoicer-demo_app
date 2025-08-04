const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const { authenticateToken } = require('../middleware/auth');

// All client routes require authentication
router.use(authenticateToken);

// All routes accessible to staff
router.post('/create', ClientController.createClient);
router.put('/update/:id', ClientController.updateClient);
router.delete('/delete/:id', ClientController.deleteClient);
router.get('/active', ClientController.getActiveClients);
router.get('/:id', ClientController.getClient);

module.exports = router;