const { errorResponse, successResponse } = require('../utils/response');
const InvoiceService = require('../services/invoiceService');

module.exports = class InvoiceController {
    /**
     * @description Handles the creation of a new invoice.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Object} - JSON response with success or error details.
     */
    static async createInvoice(req, res) {
        try {
        const { issueDate, dueDate, items, clientId } = req.body;
        
        if (!issueDate || !dueDate || !items || !Array.isArray(items) || !clientId) {
            return errorResponse(res, 400, 'Missing or invalid required fields');
        }

        const response = await InvoiceService.createInvoice({ issueDate, dueDate, clientId, items });
        if (!response.success) {
            return errorResponse(res, 400, response.message);
        }

        return successResponse(res, 201, 'Invoice created successfully', response.data);
        } catch (error) {
        console.error('Error in createInvoice:', error);
        return errorResponse(res, 500, 'An unexpected error occurred');
        }
    }

    /**
     * @description Retrieves a paginated list of invoices with optional status filtering.
     * @param {Object} req - Express request object with query parameters.
     * @param {Object} res - Express response object.
     * @returns {Object} - JSON response with invoice list or error details.
     */
    static async getInvoices(req, res) {
        try {
        const { page, limit, status } = req.query;
        
        const response = await InvoiceService.getInvoices({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            status
        });

        if (!response.success) {
            return errorResponse(res, 400, response.message);
        }

        // Add overdue information to invoices
        response.data.invoices = InvoiceService.addOverdueInfo(response.data.invoices);

        return successResponse(res, 200, 'Invoices retrieved successfully', response.data);
        } catch (error) {
        console.error('Error in getInvoices:', error);
        return errorResponse(res, 500, 'Server error');
        }
    }

    /**
     * @description Updates the status of an existing invoice.
     * @param {Object} req - Express request object with params and body.
     * @param {Object} res - Express response object.
     * @returns {Object} - JSON response with updated invoice or error details.
     */
    static async updateStatus(req, res) {
        try {
        const { id } = req.params;
        const { status } = req.body;
        if (!id || !status) {
            return errorResponse(res, 400, 'Invoice ID and status are required');
        }

        const response = await InvoiceService.updateInvoiceStatus(id, status);
        if (!response.success) {
            return errorResponse(res, 400, response.message);
        }

        return successResponse(res, 200, 'Invoice status updated successfully', response.data);
        } catch (error) {
        console.error('Error in updateStatus:', error);
        return errorResponse(res, 500, 'Server error');
        }
    }

    /**
     * @description Retrieves a single invoice by ID.
     * @param {Object} req - Express request object with params.
     * @param {Object} res - Express response object.
     * @returns {Object} - JSON response with invoice details or error.
     */
    static async getSingleInvoice(req, res) {
        try {
        const { id } = req.params;
        if (!id) {
            return errorResponse(res, 400, 'Invoice ID is required');
        }
    
        const response = await InvoiceService.getSingleInvoice(id);
        if (!response.success) {
            return errorResponse(res, 400, response.message);
        }

        // Add overdue information
        const invoiceWithOverdue = InvoiceService.addOverdueInfo([response.data])[0];
    
        return successResponse(res, 200, 'Invoice retrieved successfully', invoiceWithOverdue);
        } catch (error) {
        console.error('Error in getSingleInvoice:', error);
        return errorResponse(res, 500, 'An unexpected error occurred');
        }
    }
};