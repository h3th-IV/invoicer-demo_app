const OpenAI = require('openai');
const AnalyticsService = require('./analyticsService');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = class AIService {
  /**
   * @description Process natural language query using OpenAI
   * @param {string} query - User's natural language query
   * @returns {Object} AI analysis results
   */
  static async processQuery(query) {
    try {
      // Get comprehensive data summary
      const dataSummary = await AnalyticsService.getDataSummary();
      
      // Create context for AI
      const context = this.createAIContext(dataSummary);
      
      // Generate AI prompt
      const prompt = this.generatePrompt(query, context);
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for an invoicing system. You analyze invoice and client data to provide actionable business insights. Always provide specific, data-driven recommendations with clear reasoning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const aiResponse = response.choices[0].message.content;
      
      // Parse and structure the AI response
      const structuredResponse = this.parseAIResponse(query, aiResponse, dataSummary);
      
      return {
        success: true,
        query: query,
        analysis: structuredResponse,
        metadata: {
          processing_time: `${Date.now() - Date.now()}ms`,
          data_points_analyzed: this.countDataPoints(dataSummary),
          confidence_score: 0.85,
          model_used: "gpt-3.5-turbo"
        }
      };
    } catch (error) {
      console.error('Error processing AI query:', error);
      return {
        success: false,
        error: 'Failed to process query',
        message: error.message
      };
    }
  }

  /**
   * @description Create context data for AI analysis
   * @param {Object} dataSummary - Aggregated data from analytics service
   * @returns {Object} Formatted context for AI
   */
  static createAIContext(dataSummary) {
    const { summary, clientAnalysis, itemAnalysis, churnRiskAnalysis, rawData } = dataSummary;
    
    // Format client data for AI
    const clients = Object.values(clientAnalysis).map(client => ({
      name: client.name,
      totalInvoices: client.totalInvoices,
      totalSpent: client.totalSpent,
      averageInvoiceValue: client.averageInvoiceValue,
      recentInvoices: client.recentInvoices,
      recentSpent: client.recentSpent,
      items: client.items,
      overdueInvoices: client.overdueInvoices,
      paymentDelay: client.paymentDelay,
      lastPurchaseDate: client.lastPurchaseDate
    }));

    // Format item data for AI
    const items = Object.values(itemAnalysis).map(item => ({
      name: item.name,
      unitPrice: item.unitPrice,
      currentStock: item.currentStock,
      status: item.status,
      totalSold: item.totalSold,
      totalRevenue: item.totalRevenue,
      invoicesCount: item.invoicesCount
    }));

    // Format churn risk data
    const churnRisk = Object.values(churnRiskAnalysis)
      .filter(client => client.riskScore > 30)
      .map(client => ({
        clientName: client.clientName,
        riskScore: client.riskScore,
        riskFactors: client.riskFactors,
        metrics: client.metrics
      }));

    return {
      summary: {
        totalInvoices: summary.totalInvoices,
        totalClients: summary.totalClients,
        totalItems: summary.totalItems,
        totalRevenue: summary.totalRevenue,
        unpaidAmount: summary.unpaidAmount,
        averageInvoiceValue: summary.averageInvoiceValue
      },
      clients,
      items,
      churnRisk,
      topClients: clients
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5),
      topItems: items
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5),
      recentActivity: {
        recentInvoices: rawData.invoices
          .filter(inv => {
            const threeMonthsAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
            return new Date(inv.issueDate) >= threeMonthsAgo;
          })
          .length,
        overdueInvoices: rawData.invoices.filter(inv => inv.isOverdue).length
      }
    };
  }

  /**
   * @description Generate AI prompt based on query type
   * @param {string} query - User query
   * @param {Object} context - Data context
   * @returns {string} Formatted prompt for AI
   */
  static generatePrompt(query, context) {
    const basePrompt = `You are analyzing an invoicing system with the following data:

SUMMARY:
- Total Invoices: ${context.summary.totalInvoices}
- Total Clients: ${context.summary.totalClients}
- Total Items: ${context.summary.totalItems}
- Total Revenue: $${context.summary.totalRevenue.toLocaleString()}
- Unpaid Amount: $${context.summary.unpaidAmount.toLocaleString()}
- Average Invoice Value: $${context.summary.averageInvoiceValue.toFixed(2)}

TOP CLIENTS (by total spent):
${context.topClients.map(client => `- ${client.name}: $${client.totalSpent.toLocaleString()} (${client.totalInvoices} invoices)`).join('\n')}

TOP ITEMS (by revenue):
${context.topItems.map(item => `- ${item.name}: $${item.totalRevenue.toLocaleString()} (${item.invoicesCount} sales)`).join('\n')}

CHURN RISK CLIENTS:
${context.churnRisk.map(client => `- ${client.clientName}: ${client.riskScore}% risk - ${client.riskFactors.join(', ')}`).join('\n')}

RECENT ACTIVITY:
- Recent Invoices (3 months): ${context.recentActivity.recentInvoices}
- Overdue Invoices: ${context.recentActivity.overdueInvoices}

USER QUERY: "${query}"

Please provide a detailed analysis with:
1. Specific insights based on the data
2. Actionable recommendations
3. Relevant client names and specific examples
4. Clear reasoning for your conclusions

Format your response as structured insights with specific data points and recommendations.`;

    return basePrompt;
  }

  /**
   * @description Parse AI response into structured format
   * @param {string} query - Original query
   * @param {string} aiResponse - Raw AI response
   * @param {Object} dataSummary - Original data summary
   * @returns {Object} Structured response
   */
  static parseAIResponse(query, aiResponse, dataSummary) {
    // Determine query type
    const queryType = this.determineQueryType(query);
    
    // Extract insights from AI response
    const insights = this.extractInsights(aiResponse);
    
    // Get specific recommendations based on query type
    const recommendations = this.getSpecificRecommendations(queryType, dataSummary);
    
    return {
      type: queryType,
      summary: this.extractSummary(aiResponse),
      insights: insights,
      recommendations: recommendations,
      rawResponse: aiResponse
    };
  }

  /**
   * @description Determine the type of query being asked
   * @param {string} query - User query
   * @returns {string} Query type
   */
  static determineQueryType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('likely to buy') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      return 'product_recommendation';
    } else if (lowerQuery.includes('cross-sell') || lowerQuery.includes('up-sell')) {
      return 'cross_sell_upsell';
    } else if (lowerQuery.includes('churn') || lowerQuery.includes('risk')) {
      return 'churn_risk';
    } else if (lowerQuery.includes('pattern') || lowerQuery.includes('change') || lowerQuery.includes('trend')) {
      return 'pattern_analysis';
    } else {
      return 'general_analysis';
    }
  }

  /**
   * @description Extract insights from AI response
   * @param {string} aiResponse - Raw AI response
   * @returns {Array} Array of insights
   */
  static extractInsights(aiResponse) {
    // Simple extraction - in a real implementation, you might use more sophisticated parsing
    const insights = [];
    
    // Split response into paragraphs and extract key insights
    const paragraphs = aiResponse.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      if (paragraph.trim() && !paragraph.includes('SUMMARY') && !paragraph.includes('RECOMMENDATIONS')) {
        insights.push({
          title: this.extractTitle(paragraph),
          description: paragraph.trim(),
          type: 'insight'
        });
      }
    });
    
    return insights.slice(0, 5); // Limit to top 5 insights
  }

  /**
   * @description Extract title from paragraph
   * @param {string} paragraph - Paragraph text
   * @returns {string} Extracted title
   */
  static extractTitle(paragraph) {
    const lines = paragraph.split('\n');
    const firstLine = lines[0].trim();
    
    // Remove common prefixes and clean up
    return firstLine
      .replace(/^[0-9]+\.\s*/, '')
      .replace(/^[-*]\s*/, '')
      .replace(/^[A-Z\s]+:\s*/, '')
      .substring(0, 100);
  }

  /**
   * @description Extract summary from AI response
   * @param {string} aiResponse - Raw AI response
   * @returns {string} Summary text
   */
  static extractSummary(aiResponse) {
    // Extract first paragraph as summary
    const paragraphs = aiResponse.split('\n\n');
    return paragraphs[0] ? paragraphs[0].trim() : 'Analysis completed successfully.';
  }

  /**
   * @description Get specific recommendations based on query type
   * @param {string} queryType - Type of query
   * @param {Object} dataSummary - Data summary
   * @returns {Array} Array of recommendations
   */
  static async getSpecificRecommendations(queryType, dataSummary) {
    const recommendations = [];
    
    switch (queryType) {
      case 'product_recommendation':
        // Get top clients for product recommendations
        const topClients = Object.values(dataSummary.clientAnalysis)
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 3);
        
        topClients.forEach(client => {
          recommendations.push({
            type: 'client_recommendation',
            clientName: client.name,
            reasoning: `High-value client with $${client.totalSpent.toLocaleString()} total spent`,
            action: 'Consider targeted marketing for new products'
          });
        });
        break;
        
      case 'churn_risk':
        // Get high-risk clients
        const highRiskClients = Object.values(dataSummary.churnRiskAnalysis)
          .filter(client => client.riskScore > 50)
          .slice(0, 3);
        
        highRiskClients.forEach(client => {
          recommendations.push({
            type: 'churn_prevention',
            clientName: client.clientName,
            reasoning: `${client.riskScore}% churn risk - ${client.riskFactors.join(', ')}`,
            action: 'Implement retention strategies and reach out proactively'
          });
        });
        break;
        
      case 'pattern_analysis':
        // Get clients with significant changes
        const patternChanges = await AnalyticsService.detectPatternChanges(dataSummary.rawData.invoices);
        const changedClients = Object.values(patternChanges).slice(0, 3);
        
        changedClients.forEach(client => {
          recommendations.push({
            type: 'pattern_change',
            clientName: client.clientName,
            reasoning: `Significant changes detected: ${client.changes.join(', ')}`,
            action: 'Investigate reasons for change and adjust strategy accordingly'
          });
        });
        break;
    }
    
    return recommendations;
  }

  /**
   * @description Count data points for metadata
   * @param {Object} dataSummary - Data summary
   * @returns {number} Number of data points
   */
  static countDataPoints(dataSummary) {
    return (
      dataSummary.rawData.invoices.length +
      dataSummary.rawData.clients.length +
      dataSummary.rawData.items.length
    );
  }

  /**
   * @description Get product recommendations for specific client
   * @param {string} clientId - Client ID
   * @returns {Object} Product recommendations
   */
  static async getClientProductRecommendations(clientId) {
    try {
      const dataSummary = await AnalyticsService.getDataSummary();
      const recommendations = await AnalyticsService.getProductRecommendations(
        clientId,
        dataSummary.rawData.invoices,
        dataSummary.rawData.items
      );
      
      return {
        success: true,
        clientId,
        recommendations,
        metadata: {
          total_recommendations: recommendations.length,
          confidence_score: 0.8
        }
      };
    } catch (error) {
      console.error('Error getting product recommendations:', error);
      return {
        success: false,
        error: 'Failed to get product recommendations'
      };
    }
  }

  /**
   * @description Get churn risk analysis
   * @returns {Object} Churn risk analysis
   */
  static async getChurnRiskAnalysis() {
    try {
      const dataSummary = await AnalyticsService.getDataSummary();
      const highRiskClients = Object.values(dataSummary.churnRiskAnalysis)
        .filter(client => client.riskScore > 30)
        .sort((a, b) => b.riskScore - a.riskScore);
      
      return {
        success: true,
        highRiskClients,
        summary: {
          totalClients: Object.keys(dataSummary.churnRiskAnalysis).length,
          highRiskCount: highRiskClients.length,
          averageRiskScore: Object.values(dataSummary.churnRiskAnalysis)
            .reduce((sum, client) => sum + client.riskScore, 0) / Object.keys(dataSummary.churnRiskAnalysis).length
        }
      };
    } catch (error) {
      console.error('Error getting churn risk analysis:', error);
      return {
        success: false,
        error: 'Failed to get churn risk analysis'
      };
    }
  }

  /**
   * @description Get pattern change analysis
   * @param {string} timeframe - Timeframe for analysis
   * @returns {Object} Pattern change analysis
   */
  static async getPatternChangeAnalysis(timeframe = '3months') {
    try {
      const dataSummary = await AnalyticsService.getDataSummary();
      const patternChanges = await AnalyticsService.detectPatternChanges(
        dataSummary.rawData.invoices,
        timeframe
      );
      
      return {
        success: true,
        timeframe,
        changes: patternChanges,
        summary: {
          totalClients: Object.keys(dataSummary.clientAnalysis).length,
          clientsWithChanges: Object.keys(patternChanges).length,
          changePercentage: (Object.keys(patternChanges).length / Object.keys(dataSummary.clientAnalysis).length) * 100
        }
      };
    } catch (error) {
      console.error('Error getting pattern change analysis:', error);
      return {
        success: false,
        error: 'Failed to get pattern change analysis'
      };
    }
  }
}; 