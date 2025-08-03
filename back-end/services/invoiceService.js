const Invoice = require('../models/invoice');
const Client = require('../models/client');
const Item = require('../models/item')

module.exports = class InvoiceService {
    /**
   * @description Validates and links items to an invoice by checking stock and reducing quantities.
   * @param {Array<string>} itemIds - Array of MongoDB IDs of items to validate.
   * @param {Array<number>} quantities - Array of quantities corresponding to each item ID.
   * @returns {Object} - Response object with { success, data: validatedItems, message } indicating success or failure.
   * @throws {Error} - If database operations or validation fail.
   * @how - Verifies items exist and are in stock, reduces quantities in the Item model, and updates status to 'out-of-stock' if quantity reaches zero.
   */
    static async validateAndLinkItems(itemIds, quantities) {
        try {
          if (!Array.isArray(itemIds) || !Array.isArray(quantities) || itemIds.length !== quantities.length) {
            return { success: false, message: 'Invalid item IDs or quantities array' };
          }
      
          const items = await Item.find({ _id: { $in: itemIds }, status: 'in-stock' });
          if (items.length !== itemIds.length) {
            return { success: false, message: 'Some items are out of stock or invalid' };
          }
      
          // Validate and reduce quantities
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const requestedQty = quantities[i];
            if (item.quantity < requestedQty) {
              return { success: false, message: `Insufficient stock for ${item.name}` };
            }
            await Item.findByIdAndUpdate(item._id, { $inc: { quantity: -requestedQty } });
            if (item.quantity - requestedQty === 0) {
              await Item.findByIdAndUpdate(item._id, { status: 'out-of-stock' });
            }
          }
      
          return { success: true, data: items };
        } catch (error) {
          console.error('Error validating and linking items:', error);
          return { success: false, message: 'Could not validate and link items' };
        }
    }


    /**
   * @description Creates a new invoice with the provided details, including client association and item validation.
   * @param {Object} params - Invoice creation parameters.
   * @param {Date} params.issueDate - The date the invoice is issued.
   * @param {Date} params.dueDate - The due date for the invoice payment.
   * @param {string} params.clientId - The MongoDB ID of the associated client.
   * @param {Array<Object>} params.items - Array of items with _id and quantity (e.g., [{ _id: 'itemId', quantity: 2 }]).
   * @returns {Object} - Response object with { success, data: invoice, message } indicating success or failure.
   * @throws {Error} - If validation fails or database operations encounter issues.
   * @how - Validates client existence, checks item availability, calculates total, generates a unique invoice number, and saves the invoice.
   */
    static async createInvoice({ issueDate, dueDate, clientId, items }) {
        try {
          if (!issueDate || !dueDate || !clientId || !items || !Array.isArray(items)) {
            return { success: false, message: 'Missing or invalid required fields' };
          }
      
          const client = await Client.findById(clientId);
          if (!client) {
            return { success: false, message: 'Client not found' };
          }
      
          const itemIds = items.map(item => item._id);
          const quantities = items.map(item => item.quantity);
          const validationResult = await validateAndLinkItems(itemIds, quantities);
          if (!validationResult.success) {
            return validationResult;
          }
      
          const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const invoiceNumber = `INV-${Date.now()}`;
          const invoice = new Invoice({ invoiceNumber, issueDate, dueDate, client: clientId, items: itemIds, total });
          await invoice.save();
      
          return { success: true, data: invoice };
        } catch (error) {
          console.error('Error creating invoice:', error);
          return { success: false, message: 'Could not create invoice' };
        }
    }

    /**
   * @description Retrieves a paginated list of invoices with optional status filtering.
   * @param {Object} [params={}] - Pagination and filter parameters.
   * @param {number} [params.page=1] - The page number for pagination.
   * @param {number} [params.limit=10] - The number of items per page.
   * @param {string} [params.status] - Filter by invoice status (e.g., 'paid', 'unpaid').
   * @returns {Object} - Response object with { success, data: { invoices, links }, message } including pagination links.
   * @throws {Error} - If database query fails.
   * @how - Queries invoices with population of client names, applies pagination and sorting by due date, and generates pagination links.
   */
    static async getInvoices({ page = 1, limit = 10, status } = {}) {
        try {
          const queryFilter = {};
          if (status) {
            queryFilter.status = status;
          }
    
          const skip = (page - 1) * limit;
          const invoices = await Invoice.find(queryFilter)
            .populate('client', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ dueDate: 1 });
    
          const totalInvoices = await Invoice.countDocuments(queryFilter);
          const totalPages = Math.ceil(totalInvoices / limit);
    
          const paginationLinks = {
            first: `/invoices/list?page=1&limit=${limit}${status ? `&status=${status}` : ''}`,
            prev: page > 1 ? `/invoices/list?page=${page - 1}&limit=${limit}${status ? `&status=${status}` : ''}` : null,
            next: page < totalPages ? `/invoices/list?page=${page + 1}&limit=${limit}${status ? `&status=${status}` : ''}` : null,
            last: `/invoices/list?page=${totalPages}&limit=${limit}${status ? `&status=${status}` : ''}`,
          };
    
          return {
            success: true,
            data: {
              invoices,
              links: {
                first: paginationLinks.first,
                prev: paginationLinks.prev,
                next: paginationLinks.next,
                last: paginationLinks.last,
                currentPage: page,
                totalPages,
                totalPerPage: limit,
                total: totalInvoices,
              },
            },
          };
        } catch (error) {
          console.error('Error fetching invoices:', error);
          return { success: false, message: 'Could not fetch invoices' };
        }
    }

    /**
   * @description Updates the status of an existing invoice to 'paid' or 'unpaid'.
   * @param {string} invoiceId - The MongoDB ID of the invoice to update.
   * @param {string} status - The new status ('paid' or 'unpaid').
   * @returns {Object} - Response object with { success, data: updatedInvoice, message } indicating success or failure.
   * @throws {Error} - If the invoice is not found or status is invalid.
   * @how - Validates the status, finds and updates the invoice in the database, and returns the updated document.
   */
    static async updateInvoiceStatus(invoiceId, status) {
        try {
          if (!['paid', 'unpaid'].includes(status)) {
            return { success: false, message: 'Invalid status' };
          }
    
          const invoice = await Invoice.findByIdAndUpdate(invoiceId, { status }, { new: true });
          if (!invoice) {
            return { success: false, message: 'Invoice not found' };
          }
    
          return { success: true, data: invoice };
        } catch (error) {
          console.error('Error updating invoice status:', error);
          return { success: false, message: 'Could not update invoice status' };
        }
    }
};