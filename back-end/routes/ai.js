const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// All AI routes require authentication
router.use(authenticateToken);

// Main AI query endpoint
router.post('/query', AIController.processQuery);

// Analytics and insights endpoints
router.get('/analytics/summary', AIController.getDataSummary);
router.get('/insights/dashboard', AIController.getInsightsDashboard);
router.get('/suggestions', AIController.getQuerySuggestions);

// Specific analysis endpoints
router.get('/analysis/churn-risk', AIController.getChurnRiskAnalysis);
router.get('/analysis/pattern-changes', AIController.getPatternChangeAnalysis);
router.get('/recommendations/client/:clientId', AIController.getClientRecommendations);

module.exports = router; 