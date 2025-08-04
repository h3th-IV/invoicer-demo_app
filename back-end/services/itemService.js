const Item = require('../models/item');

module.exports = class ItemService {
    /**
   * @description Adds a new item to the inventory with specified details.
   * @param {Object} params - Item creation parameters.
   * @param {string} params.name - The name of the item (required).
   * @param {number} params.quantity - The available quantity (required, min 1).
   * @param {number} params.unitPrice - The unit price (required, min 0).
   * @param {string} [params.status='in-stock'] - The item status ('in-stock' or 'out-of-stock').
   * @returns {Object} - Response object with { success, data: item, message } indicating success or failure.
   * @throws {Error} - If validation fails or database operations encounter issues.
   * @how - Validates input data, sets default status, and saves the item to the database.
   */
  static async addItem({ name, quantity, unitPrice, status = 'in-stock' }) {
    try {
      if (!name || quantity == null || unitPrice == null) {
        return { success: false, message: 'Name, quantity, and unit price are required' };
      }
      if (quantity < 1 || unitPrice < 0) {
        return { success: false, message: 'Invalid quantity or unit price' };
      }
      if (!['in-stock', 'out-of-stock'].includes(status)) {
        return { success: false, message: 'Invalid status' };
      }

      const item = new Item({ name, quantity, unitPrice, status });
      await item.save();

      return { success: true, data: item };
    } catch (error) {
      console.error('Error adding item:', error);
      return { success: false, message: 'Could not add item' };
    }
  }

  /**
   * @description Updates an existing item's details.
   * @param {string} itemId - The MongoDB ID of the item to update.
   * @param {Object} params - Update parameters (name, quantity, unitPrice, status).
   * @param {string} [params.name] - The updated name.
   * @param {number} [params.quantity] - The updated quantity.
   * @param {number} [params.unitPrice] - The updated unit price.
   * @param {string} [params.status] - The updated status ('in-stock' or 'out-of-stock').
   * @returns {Object} - Response object with { success, data: updatedItem, message } indicating success or failure.
   * @throws {Error} - If the item is not found or validation fails.
   * @how - Applies updates with validation and returns the updated item document.
   */
  static async updateItem(itemId, { name, quantity, unitPrice, status }) {
    try {
      const updateData = { name, quantity, unitPrice };
      if (status && ['in-stock', 'out-of-stock'].includes(status)) updateData.status = status;

      const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true, runValidators: true });
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      return { success: true, data: item };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, message: 'Could not update item' };
    }
  }

  /**
   * @description Retrieves a single item by ID.
   * @param {string} itemId - The MongoDB ID of the item to retrieve.
   * @returns {Object} - Response object with { success, data: item, message } indicating success or failure.
   * @throws {Error} - If database operations fail.
   * @how - Queries the database for the item by ID and returns the document.
   */
  static async getSingleItem(itemId) {
    try {
      if (!itemId) {
        return { success: false, message: 'Item ID is required' };
      }

      const item = await Item.findById(itemId);
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      return { success: true, data: item };
    } catch (error) {
      console.error('Error retrieving item:', error);
      return { success: false, message: 'Could not retrieve item' };
    }
  }

  /**
   * @description Retrieves a paginated list of all items with optional search.
   * @param {Object} [params={}] - Pagination and search parameters.
   * @param {number} [params.page=1] - The page number for pagination.
   * @param {number} [params.limit=10] - The number of items per page.
   * @param {string} [params.search] - Search term to filter item names.
   * @returns {Object} - Response object with { success, data: { items, links }, message } including pagination links.
   * @throws {Error} - If database query fails.
   * @how - Applies search filter on item names, paginates results, and generates pagination links.
   */
  static async getAllItems({ page = 1, limit = 10, search } = {}) {
    try {
      const queryFilter = {};
      const searchRegex = search ? new RegExp(search, 'i') : null;

      const skip = (page - 1) * limit;
      const items = await Item.find({
        ...queryFilter,
        ...(searchRegex ? { name: searchRegex } : {}),
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Assuming createdAt exists; add if missing

      const totalItems = await Item.countDocuments({
        ...queryFilter,
        ...(searchRegex ? { name: searchRegex } : {}),
      });

      const totalPages = Math.ceil(totalItems / limit);

      const paginationLinks = {
        first: `/items?page=1&limit=${limit}${search ? `&search=${search}` : ''}`,
        prev: page > 1 ? `/items?page=${page - 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
        next: page < totalPages ? `/items?page=${page + 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
        last: `/items?page=${totalPages}&limit=${limit}${search ? `&search=${search}` : ''}`,
      };

      return {
        success: true,
        data: {
          items,
          links: {
            first: paginationLinks.first,
            prev: paginationLinks.prev,
            next: paginationLinks.next,
            last: paginationLinks.last,
            currentPage: page,
            totalPages,
            totalPerPage: limit,
            total: totalItems,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      return { success: false, message: 'Could not fetch items' };
    }
  }

  /**
   * @description Deletes an existing item from the inventory.
   * @param {string} itemId - The MongoDB ID of the item to delete.
   * @returns {Object} - Response object with { success, message } indicating success or failure.
   * @throws {Error} - If the item is not found or deletion fails.
   * @how - Finds and removes the item from the database.
   */
  static async deleteItem(itemId) {
    try {
      const item = await Item.findByIdAndDelete(itemId);
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      return { success: true, message: 'Item deleted' };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: 'Could not delete item' };
    }
  }

  /**
   * @description Marks an existing item as 'out-of-stock'.
   * @param {string} itemId - The MongoDB ID of the item to mark.
   * @returns {Object} - Response object with { success, data: updatedItem, message } indicating success or failure.
   * @throws {Error} - If the item is not found or update fails.
   * @how - Updates the item's status to 'out-of-stock' and returns the updated document.
   */
  static async markOutOfStock(itemId) {
    try {
      const item = await Item.findByIdAndUpdate(itemId, { status: 'out-of-stock' }, { new: true });
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      return { success: true, data: item };
    } catch (error) {
      console.error('Error marking item out of stock:', error);
      return { success: false, message: 'Could not mark item out of stock' };
    }
  }
};