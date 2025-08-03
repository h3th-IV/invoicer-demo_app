const { errorResponse, successResponse } = require('../utils/response');
const ClientService = require('../services/clientService');

module.exports = class ClientController {
  /**
   * @description Creates a new client with the provided details.
   * @param {Object} req - Express request object with body.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with created client or error details.
   */
  static async createClient(req, res) {
    try {
      const { name, phone_number, email, address, billingAddress } = req.body;
      if (!name) {
        return errorResponse(res, 400, 'Name is required');
      }

      const response = await ClientService.createClient({ name, phone_number, email, address, billingAddress });
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 201, 'Client created successfully', response.data);
    } catch (error) {
      console.error('Error in createClient:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Updates an existing client's details.
   * @param {Object} req - Express request object with params and body.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with updated client or error details.
   */
  static async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { name, phone_number, email, address, billingAddress, status } = req.body;
      if (!id) {
        return errorResponse(res, 400, 'Client ID is required');
      }

      const response = await ClientService.updateClient(id, { name, phone_number, email, address, billingAddress, status });
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, 'Client updated successfully', response.data);
    } catch (error) {
      console.error('Error in updateClient:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }

  /**
   * @description Marks an existing client as inactive.
   * @param {Object} req - Express request object with params.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with success message or error details.
   */
  static async deleteClient(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 400, 'Client ID is required');
      }

      const response = await ClientService.deleteClient(id);
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, response.message);
    } catch (error) {
      console.error('Error in deleteClient:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }

  /**
   * @description Retrieves a paginated list of active clients.
   * @param {Object} req - Express request object with query parameters.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with client list or error details.
   */
  static async getActiveClients(req, res) {
    try {
      const { page, limit, search } = req.query;
      const response = await ClientService.getActiveClients({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
      });

      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, 'Active clients retrieved successfully', response.data);
    } catch (error) {
      console.error('Error in getActiveClients:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }

  /**
   * @description Retrieves a single client by ID.
   * @param {Object} req - Express request object with params.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with client data or error details.
   */
  static async getClient(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 400, 'Client ID is required');
      }

      const response = await ClientService.getClient(id);
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, 'Client retrieved successfully', response.data);
    } catch (error) {
      console.error('Error in getClient:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }
};