const { errorResponse, successResponse } = require('../utils/response');
const ItemService = require('../services/itemService');

module.exports = class ItemController {
  /**
   * @description Adds a new item to the inventory.
   * @param {Object} req - Express request object with body.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with created item or error details.
   */
  static async addItem(req, res) {
    try {
      const { name, quantity, unitPrice, status } = req.body;
      if (!name || quantity == null || unitPrice == null) {
        return errorResponse(res, 400, 'Name, quantity, and unit price are required');
      }

      const response = await ItemService.addItem({ name, quantity, unitPrice, status });
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 201, 'Item added successfully', response.data);
    } catch (error) {
      console.error('Error in addItem:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Updates an existing item's details.
   * @param {Object} req - Express request object with params and body.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with updated item or error details.
   */
  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name, quantity, unitPrice, status } = req.body;
      if (!id) {
        return errorResponse(res, 400, 'Item ID is required');
      }

      const response = await ItemService.updateItem(id, { name, quantity, unitPrice, status });
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, 'Item updated successfully', response.data);
    } catch (error) {
      console.error('Error in updateItem:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }

  /**
   * @description Retrieves a paginated list of all items.
   * @param {Object} req - Express request object with query parameters.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with item list or error details.
   */
  static async getAllItems(req, res) {
    try {
      const { page, limit, search } = req.query;
      const response = await ItemService.getAllItems({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
      });

      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, 'Items retrieved successfully', response.data);
    } catch (error) {
      console.error('Error in getAllItems:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }

  /**
   * @description Deletes an existing item from the inventory.
   * @param {Object} req - Express request object with params.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with success message or error details.
   */
  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 400, 'Item ID is required');
      }

      const response = await ItemService.deleteItem(id);
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, response.message);
    } catch (error) {
      console.error('Error in deleteItem:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }

  /**
   * @description Marks an existing item as 'out-of-stock'.
   * @param {Object} req - Express request object with params.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response with updated item or error details.
   */
  static async markOutOfStock(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 400, 'Item ID is required');
      }

      const response = await ItemService.markOutOfStock(id);
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 200, 'Item marked out of stock successfully', response.data);
    } catch (error) {
      console.error('Error in markOutOfStock:', error);
      return errorResponse(res, 500, 'Server error');
    }
  }
};