const Invoice = require('../models/invoice');
const Client = require('../models/client');
const Item = require('../models/item');

module.exports = class AnalyticsService {
  /**
   * @description Get comprehensive data summary for AI analysis
   * @returns {Object} Aggregated data for AI context
   */
  static async getDataSummary() {
    try {
      const [
        totalInvoices,
        totalClients,
        totalItems,
        invoices,
        clients,
        items
      ] = await Promise.all([
        Invoice.countDocuments(),
        Client.countDocuments({ status: 'active' }),
        Item.countDocuments(),
        Invoice.find().populate('client', 'name email status').populate('items', 'name unitPrice'),
        Client.find({ status: 'active' }),
        Item.find()
      ]);

      // Calculate basic statistics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

      const unpaidAmount = invoices
        .filter(inv => inv.status === 'unpaid')
        .reduce((sum, inv) => sum + inv.total, 0);

      // Analyze client purchase patterns
      const clientAnalysis = await this.analyzeClientPurchases(invoices);
      
      // Analyze item performance
      const itemAnalysis = await this.analyzeItemPerformance(invoices, items);
      
      // Calculate churn risk indicators
      const churnRiskAnalysis = await this.analyzeChurnRisk(invoices, clients);

      return {
        summary: {
          totalInvoices,
          totalClients,
          totalItems,
          totalRevenue,
          unpaidAmount,
          averageInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0
        },
        clientAnalysis,
        itemAnalysis,
        churnRiskAnalysis,
        rawData: {
          invoices: invoices.map(inv => ({
            id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            client: inv.client,
            items: inv.items,
            total: inv.total,
            status: inv.status,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            isOverdue: this.isOverdue(inv)
          })),
          clients: clients.map(client => ({
            id: client._id,
            name: client.name,
            email: client.email,
            status: client.status,
            createdAt: client.createdAt
          })),
          items: items.map(item => ({
            id: item._id,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            status: item.status
          }))
        }
      };
    } catch (error) {
      console.error('Error getting data summary:', error);
      throw new Error('Failed to generate data summary');
    }
  }

  /**
   * @description Analyze client purchase patterns
   * @param {Array} invoices - Array of invoice documents
   * @returns {Object} Client purchase analysis
   */
  static async analyzeClientPurchases(invoices) {
    const clientPurchases = {};
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    invoices.forEach(invoice => {
      const clientId = invoice.client._id.toString();
      const clientName = invoice.client.name;
      
      if (!clientPurchases[clientId]) {
        clientPurchases[clientId] = {
          id: clientId,
          name: clientName,
          totalInvoices: 0,
          totalSpent: 0,
          paidInvoices: 0,
          unpaidInvoices: 0,
          overdueInvoices: 0,
          recentInvoices: 0,
          recentSpent: 0,
          items: new Set(),
          lastPurchaseDate: null,
          averageInvoiceValue: 0,
          paymentDelay: 0
        };
      }

      const client = clientPurchases[clientId];
      client.totalInvoices++;
      client.totalSpent += invoice.total;
      
      if (invoice.status === 'paid') {
        client.paidInvoices++;
      } else {
        client.unpaidInvoices++;
        if (this.isOverdue(invoice)) {
          client.overdueInvoices++;
        }
      }

      // Track recent activity (last 3 months)
      if (invoice.issueDate >= threeMonthsAgo) {
        client.recentInvoices++;
        client.recentSpent += invoice.total;
      }

      // Track items purchased
      invoice.items.forEach(item => {
        client.items.add(item.name);
      });

      // Track last purchase date
      if (!client.lastPurchaseDate || invoice.issueDate > client.lastPurchaseDate) {
        client.lastPurchaseDate = invoice.issueDate;
      }

      // Calculate payment delay for unpaid invoices
      if (invoice.status === 'unpaid' && this.isOverdue(invoice)) {
        const delayDays = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));
        client.paymentDelay = Math.max(client.paymentDelay, delayDays);
      }
    });

    // Calculate averages and convert sets to arrays
    Object.values(clientPurchases).forEach(client => {
      client.averageInvoiceValue = client.totalInvoices > 0 ? client.totalSpent / client.totalInvoices : 0;
      client.items = Array.from(client.items);
      client.purchaseFrequency = client.totalInvoices > 0 ? 
        (now - new Date(client.createdAt || now)) / (client.totalInvoices * 24 * 60 * 60 * 1000) : 0;
    });

    return clientPurchases;
  }

  /**
   * @description Analyze item performance and popularity
   * @param {Array} invoices - Array of invoice documents
   * @param {Array} items - Array of item documents
   * @returns {Object} Item performance analysis
   */
  static async analyzeItemPerformance(invoices, items) {
    const itemStats = {};
    
    // Initialize item stats
    items.forEach(item => {
      itemStats[item._id.toString()] = {
        id: item._id,
        name: item.name,
        unitPrice: item.unitPrice,
        currentStock: item.quantity,
        status: item.status,
        totalSold: 0,
        totalRevenue: 0,
        invoicesCount: 0,
        averageQuantity: 0,
        lastSoldDate: null
      };
    });

    // Calculate item performance from invoices
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const itemId = item._id.toString();
        if (itemStats[itemId]) {
          itemStats[itemId].totalSold += 1; // Assuming quantity is 1 per invoice item
          itemStats[itemId].totalRevenue += item.unitPrice;
          itemStats[itemId].invoicesCount++;
          
          if (!itemStats[itemId].lastSoldDate || invoice.issueDate > itemStats[itemId].lastSoldDate) {
            itemStats[itemId].lastSoldDate = invoice.issueDate;
          }
        }
      });
    });

    // Calculate averages
    Object.values(itemStats).forEach(item => {
      item.averageQuantity = item.invoicesCount > 0 ? item.totalSold / item.invoicesCount : 0;
    });

    return itemStats;
  }

  /**
   * @description Analyze churn risk for clients
   * @param {Array} invoices - Array of invoice documents
   * @param {Array} clients - Array of client documents
   * @returns {Object} Churn risk analysis
   */
  static async analyzeChurnRisk(invoices, clients) {
    const churnRisk = {};
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

    clients.forEach(client => {
      const clientId = client._id.toString();
      const clientInvoices = invoices.filter(inv => inv.client._id.toString() === clientId);
      
      const recentInvoices = clientInvoices.filter(inv => inv.issueDate >= threeMonthsAgo);
      const olderInvoices = clientInvoices.filter(inv => inv.issueDate >= sixMonthsAgo && inv.issueDate < threeMonthsAgo);
      
      const recentVolume = recentInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const olderVolume = olderInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      const recentCount = recentInvoices.length;
      const olderCount = olderInvoices.length;
      
      const overdueInvoices = clientInvoices.filter(inv => this.isOverdue(inv));
      const paymentDelays = overdueInvoices.map(inv => 
        Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
      );
      
      const maxPaymentDelay = paymentDelays.length > 0 ? Math.max(...paymentDelays) : 0;
      const averagePaymentDelay = paymentDelays.length > 0 ? 
        paymentDelays.reduce((sum, delay) => sum + delay, 0) / paymentDelays.length : 0;

      // Calculate churn risk score (0-100)
      let riskScore = 0;
      let riskFactors = [];

      // Volume decline
      if (olderVolume > 0 && recentVolume < olderVolume * 0.5) {
        riskScore += 30;
        riskFactors.push('Significant decline in purchase volume');
      }

      // Frequency decline
      if (olderCount > 0 && recentCount < olderCount * 0.5) {
        riskScore += 25;
        riskFactors.push('Reduced purchase frequency');
      }

      // Payment delays
      if (maxPaymentDelay > 30) {
        riskScore += 20;
        riskFactors.push('Extended payment delays');
      }

      // No recent activity
      if (recentCount === 0 && olderCount > 0) {
        riskScore += 25;
        riskFactors.push('No recent purchases');
      }

      // Overdue invoices
      if (overdueInvoices.length > 0) {
        riskScore += 15;
        riskFactors.push('Has overdue invoices');
      }

      churnRisk[clientId] = {
        clientId,
        clientName: client.name,
        riskScore: Math.min(riskScore, 100),
        riskFactors,
        metrics: {
          recentVolume,
          olderVolume,
          volumeChange: olderVolume > 0 ? ((recentVolume - olderVolume) / olderVolume) * 100 : 0,
          recentCount,
          olderCount,
          frequencyChange: olderCount > 0 ? ((recentCount - olderCount) / olderCount) * 100 : 0,
          maxPaymentDelay,
          averagePaymentDelay,
          overdueInvoicesCount: overdueInvoices.length,
          lastPurchaseDate: clientInvoices.length > 0 ? 
            Math.max(...clientInvoices.map(inv => inv.issueDate)) : null
        }
      };
    });

    return churnRisk;
  }

  /**
   * @description Check if an invoice is overdue
   * @param {Object} invoice - Invoice document
   * @returns {boolean} True if invoice is overdue
   */
  static isOverdue(invoice) {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    return dueDate < today && invoice.status !== 'paid';
  }

  /**
   * @description Get product recommendations for a specific client
   * @param {string} clientId - Client ID
   * @param {Array} invoices - All invoices
   * @param {Array} items - All items
   * @returns {Array} Product recommendations
   */
  static async getProductRecommendations(clientId, invoices, items) {
    const clientInvoices = invoices.filter(inv => inv.client._id.toString() === clientId);
    const clientItems = new Set();
    
    // Get items the client has already purchased
    clientInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        clientItems.add(item._id.toString());
      });
    });

    // Find similar clients (clients who bought similar items)
    const similarClients = new Map();
    
    invoices.forEach(invoice => {
      if (invoice.client._id.toString() !== clientId) {
        const commonItems = invoice.items.filter(item => 
          clientItems.has(item._id.toString())
        );
        
        if (commonItems.length > 0) {
          const similarity = commonItems.length / Math.max(clientItems.size, invoice.items.length);
          const clientId = invoice.client._id.toString();
          
          if (!similarClients.has(clientId)) {
            similarClients.set(clientId, {
              clientId,
              clientName: invoice.client.name,
              similarity,
              items: new Set()
            });
          }
          
          invoice.items.forEach(item => {
            similarClients.get(clientId).items.add(item._id.toString());
          });
        }
      }
    });

    // Get recommendations from similar clients
    const recommendations = new Map();
    
    similarClients.forEach(similarClient => {
      similarClient.items.forEach(itemId => {
        if (!clientItems.has(itemId)) {
          if (!recommendations.has(itemId)) {
            recommendations.set(itemId, {
              itemId,
              score: 0,
              reasons: []
            });
          }
          
          const recommendation = recommendations.get(itemId);
          recommendation.score += similarClient.similarity;
          recommendation.reasons.push(`Similar client ${similarClient.clientName} purchased this item`);
        }
      });
    });

    // Convert to array and add item details
    const recommendationsArray = Array.from(recommendations.values())
      .map(rec => {
        const item = items.find(i => i._id.toString() === rec.itemId);
        return {
          ...rec,
          name: item ? item.name : 'Unknown Item',
          unitPrice: item ? item.unitPrice : 0,
          status: item ? item.status : 'unknown'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 recommendations

    return recommendationsArray;
  }

  /**
   * @description Detect significant changes in buying patterns
   * @param {Array} invoices - All invoices
   * @param {string} timeframe - Timeframe for analysis (default: '3months')
   * @returns {Object} Pattern change analysis
   */
  static async detectPatternChanges(invoices, timeframe = '3months') {
    const now = new Date();
    let comparisonPeriod;
    
    switch (timeframe) {
      case '3months':
        comparisonPeriod = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      case '6months':
        comparisonPeriod = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
        break;
      default:
        comparisonPeriod = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    }

    const recentInvoices = invoices.filter(inv => inv.issueDate >= comparisonPeriod);
    const olderInvoices = invoices.filter(inv => 
      inv.issueDate >= new Date(comparisonPeriod.getTime() - (comparisonPeriod - now.getTime())) &&
      inv.issueDate < comparisonPeriod
    );

    const changes = {};

    // Group by client
    const clientGroups = {};
    
    [...recentInvoices, ...olderInvoices].forEach(invoice => {
      const clientId = invoice.client._id.toString();
      if (!clientGroups[clientId]) {
        clientGroups[clientId] = {
          clientId,
          clientName: invoice.client.name,
          recent: { invoices: [], total: 0, items: new Set() },
          older: { invoices: [], total: 0, items: new Set() }
        };
      }
      
      const group = clientGroups[clientId];
      const isRecent = invoice.issueDate >= comparisonPeriod;
      
      if (isRecent) {
        group.recent.invoices.push(invoice);
        group.recent.total += invoice.total;
        invoice.items.forEach(item => group.recent.items.add(item.name));
      } else {
        group.older.invoices.push(invoice);
        group.older.total += invoice.total;
        invoice.items.forEach(item => group.older.items.add(item.name));
      }
    });

    // Calculate changes for each client
    Object.values(clientGroups).forEach(client => {
      const recentCount = client.recent.invoices.length;
      const olderCount = client.older.invoices.length;
      const recentTotal = client.recent.total;
      const olderTotal = client.older.total;
      
      const volumeChange = olderTotal > 0 ? ((recentTotal - olderTotal) / olderTotal) * 100 : 0;
      const frequencyChange = olderCount > 0 ? ((recentCount - olderCount) / olderCount) * 100 : 0;
      
      // Check for significant changes (>20% change)
      const significantChanges = [];
      
      if (Math.abs(volumeChange) > 20) {
        significantChanges.push(`Purchase volume ${volumeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(volumeChange).toFixed(1)}%`);
      }
      
      if (Math.abs(frequencyChange) > 20) {
        significantChanges.push(`Purchase frequency ${frequencyChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(frequencyChange).toFixed(1)}%`);
      }
      
      if (significantChanges.length > 0) {
        changes[client.clientId] = {
          clientId: client.clientId,
          clientName: client.clientName,
          changes: significantChanges,
          metrics: {
            volumeChange,
            frequencyChange,
            recentTotal,
            olderTotal,
            recentCount,
            olderCount,
            recentItems: Array.from(client.recent.items),
            olderItems: Array.from(client.older.items)
          }
        };
      }
    });

    return changes;
  }
}; 