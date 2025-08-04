const { errorResponse, successResponse } = require('../utils/response');
const AIService = require('../services/aiService');
const AnalyticsService = require('../services/analyticsService');

module.exports = class AIController {
  /**
   * @description Process natural language query using AI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with AI analysis
   */
  static async processQuery(req, res) {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return errorResponse(res, 400, 'Query is required and must be a non-empty string');
      }

      if (query.length > 500) {
        return errorResponse(res, 400, 'Query is too long. Please keep it under 500 characters.');
      }

      const startTime = Date.now();
      const result = await AIService.processQuery(query.trim());
      
      if (!result.success) {
        return errorResponse(res, 500, result.error || 'Failed to process query');
      }

      // Add processing time
      result.metadata.processing_time = `${Date.now() - startTime}ms`;

      return successResponse(res, 200, 'Query processed successfully', result);
    } catch (error) {
      console.error('Error in processQuery:', error);
      return errorResponse(res, 500, 'An unexpected error occurred while processing the query');
    }
  }

  /**
   * @description Get data summary for AI context
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with data summary
   */
  static async getDataSummary(req, res) {
    try {
      const dataSummary = await AnalyticsService.getDataSummary();
      
      return successResponse(res, 200, 'Data summary retrieved successfully', {
        summary: dataSummary.summary,
        clientCount: Object.keys(dataSummary.clientAnalysis).length,
        itemCount: Object.keys(dataSummary.itemAnalysis).length,
        churnRiskCount: Object.values(dataSummary.churnRiskAnalysis)
          .filter(client => client.riskScore > 30).length
      });
    } catch (error) {
      console.error('Error in getDataSummary:', error);
      return errorResponse(res, 500, 'Failed to retrieve data summary');
    }
  }

  /**
   * @description Get product recommendations for a specific client
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with product recommendations
   */
  static async getClientRecommendations(req, res) {
    try {
      const { clientId } = req.params;
      
      if (!clientId) {
        return errorResponse(res, 400, 'Client ID is required');
      }

      const result = await AIService.getClientProductRecommendations(clientId);
      
      if (!result.success) {
        return errorResponse(res, 500, result.error || 'Failed to get recommendations');
      }

      return successResponse(res, 200, 'Product recommendations retrieved successfully', result);
    } catch (error) {
      console.error('Error in getClientRecommendations:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Get churn risk analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with churn risk analysis
   */
  static async getChurnRiskAnalysis(req, res) {
    try {
      const result = await AIService.getChurnRiskAnalysis();
      
      if (!result.success) {
        return errorResponse(res, 500, result.error || 'Failed to get churn risk analysis');
      }

      return successResponse(res, 200, 'Churn risk analysis retrieved successfully', result);
    } catch (error) {
      console.error('Error in getChurnRiskAnalysis:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Get pattern change analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with pattern change analysis
   */
  static async getPatternChangeAnalysis(req, res) {
    try {
      const { timeframe } = req.query;
      const validTimeframes = ['3months', '6months'];
      
      if (timeframe && !validTimeframes.includes(timeframe)) {
        return errorResponse(res, 400, 'Invalid timeframe. Use "3months" or "6months"');
      }

      const result = await AIService.getPatternChangeAnalysis(timeframe || '3months');
      
      if (!result.success) {
        return errorResponse(res, 500, result.error || 'Failed to get pattern change analysis');
      }

      return successResponse(res, 200, 'Pattern change analysis retrieved successfully', result);
    } catch (error) {
      console.error('Error in getPatternChangeAnalysis:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Get AI insights dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with insights dashboard data
   */
  static async getInsightsDashboard(req, res) {
    try {
      const [
        dataSummary,
        churnRiskResult,
        patternChangeResult
      ] = await Promise.all([
        AnalyticsService.getDataSummary(),
        AIService.getChurnRiskAnalysis(),
        AIService.getPatternChangeAnalysis('3months')
      ]);

      // Get top insights
      const insights = [];

      // Add churn risk insights
      if (churnRiskResult.success && churnRiskResult.highRiskClients.length > 0) {
        insights.push({
          type: 'churn_risk',
          title: 'High Churn Risk Detected',
          description: `${churnRiskResult.highRiskClients.length} clients show signs of churn risk`,
          priority: 'high',
          data: churnRiskResult.highRiskClients.slice(0, 3)
        });
      }

      // Add pattern change insights
      if (patternChangeResult.success && Object.keys(patternChangeResult.changes).length > 0) {
        insights.push({
          type: 'pattern_change',
          title: 'Significant Pattern Changes',
          description: `${Object.keys(patternChangeResult.changes).length} clients show significant changes in buying patterns`,
          priority: 'medium',
          data: Object.values(patternChangeResult.changes).slice(0, 3)
        });
      }

      // Add revenue insights
      const topClients = Object.values(dataSummary.clientAnalysis)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 3);

      if (topClients.length > 0) {
        insights.push({
          type: 'revenue_opportunity',
          title: 'Top Revenue Opportunities',
          description: 'Your highest-value clients and potential upsell opportunities',
          priority: 'medium',
          data: topClients
        });
      }

      // Add overdue invoice insights
      const overdueInvoices = dataSummary.rawData.invoices.filter(inv => inv.isOverdue);
      if (overdueInvoices.length > 0) {
        insights.push({
          type: 'overdue_invoices',
          title: 'Overdue Invoices Alert',
          description: `${overdueInvoices.length} invoices are overdue and require attention`,
          priority: 'high',
          data: overdueInvoices.slice(0, 3)
        });
      }

      const dashboardData = {
        summary: {
          totalInvoices: dataSummary.summary.totalInvoices,
          totalClients: dataSummary.summary.totalClients,
          totalRevenue: dataSummary.summary.totalRevenue,
          unpaidAmount: dataSummary.summary.unpaidAmount,
          overdueInvoices: overdueInvoices.length,
          highRiskClients: churnRiskResult.success ? churnRiskResult.highRiskClients.length : 0
        },
        insights: insights.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
        recentActivity: {
          recentInvoices: dataSummary.rawData.invoices
            .filter(inv => {
              const threeMonthsAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
              return new Date(inv.issueDate) >= threeMonthsAgo;
            }).length,
          newClients: dataSummary.rawData.clients
            .filter(client => {
              const threeMonthsAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
              return new Date(client.createdAt) >= threeMonthsAgo;
            }).length
        }
      };

      return successResponse(res, 200, 'Insights dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      console.error('Error in getInsightsDashboard:', error);
      return errorResponse(res, 500, 'Failed to retrieve insights dashboard data');
    }
  }

  /**
   * @description Get query suggestions for users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with query suggestions
   */
  static async getQuerySuggestions(req, res) {
    try {
      const suggestions = [
        {
          category: 'Product Recommendations',
          queries: [
            'Given the purchase history of my clients, suggest who is the most likely to buy [Product/Service X]',
            'Which clients would be most interested in our premium services?',
            'Recommend products for clients who haven\'t purchased recently'
          ]
        },
        {
          category: 'Cross-sell & Up-sell',
          queries: [
            'For each customer, based on their purchase history, suggest one or more products I can likely cross-sell or up-sell to them',
            'What complementary products should I recommend to my top clients?',
            'Identify upsell opportunities for clients with growing needs'
          ]
        },
        {
          category: 'Churn Risk Analysis',
          queries: [
            'Which clients show signs of churn risk based on declining invoice volume or delayed payments?',
            'Identify clients who might be considering leaving our service',
            'Which clients have reduced their spending recently?'
          ]
        },
        {
          category: 'Pattern Analysis',
          queries: [
            'Identify clients whose buying patterns have changed significantly in the last 3 months',
            'Which clients are increasing their purchase frequency?',
            'Find clients with unusual spending patterns'
          ]
        },
        {
          category: 'Revenue Optimization',
          queries: [
            'Which clients have the highest potential for revenue growth?',
            'Identify opportunities to increase average order value',
            'Which products are most profitable and should be promoted more?'
          ]
        }
      ];

      return successResponse(res, 200, 'Query suggestions retrieved successfully', { suggestions });
    } catch (error) {
      console.error('Error in getQuerySuggestions:', error);
      return errorResponse(res, 500, 'Failed to retrieve query suggestions');
    }
  }
}; 