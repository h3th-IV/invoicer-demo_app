const Client = require('../models/client');

module.exports = class ClientService {
    /**
   * @description Creates a new client with the provided details.
   * @param {Object} params - Client creation parameters.
   * @param {string} params.name - The name of the client (required).
   * @param {string} [params.phone_number] - The client's phone number (unique).
   * @param {string} [params.email] - The client's email (unique).
   * @param {string} [params.address] - The client's address.
   * @param {string} [params.billingAddress] - The client's billing address.
   * @returns {Object} - Response object with { success, data: client, message } indicating success or failure.
   * @throws {Error} - If validation fails or database operations encounter issues.
   * @how - Validates the name, checks for duplicate phone/email, and saves the client with default 'active' status.
   */
  static async createClient({ name, phone_number, email, address, billingAddress }) {
    try {
      if (!name) {
        return { success: false, message: 'Name is required' };
      }

      const client = new Client({ name, phone_number, email, address, billingAddress, status: 'active' });
      await client.save();

      return { success: true, data: client };
    } catch (error) {
      console.error('Error creating client:', error);
      if (error.code === 11000) { // Duplicate key error (unique phone_number or email)
        return { success: false, message: 'Phone number or email already exists' };
      }
      return { success: false, message: 'Could not create client' };
    }
  }

  /**
   * @description Updates an existing client's details.
   * @param {string} clientId - The MongoDB ID of the client to update.
   * @param {Object} params - Update parameters (name, phone_number, email, address, billingAddress, status).
   * @param {string} [params.name] - The updated name.
   * @param {string} [params.phone_number] - The updated phone number.
   * @param {string} [params.email] - The updated email.
   * @param {string} [params.address] - The updated address.
   * @param {string} [params.billingAddress] - The updated billing address.
   * @param {string} [params.status] - The updated status ('active' or 'inactive').
   * @returns {Object} - Response object with { success, data: updatedClient, message } indicating success or failure.
   * @throws {Error} - If the client is not found or validation fails.
   * @how - Validates and applies updates, ensuring status is within enum if provided, and returns the updated client.
   */
  static async updateClient(clientId, { name, phone_number, email, address, billingAddress, status }) {
    try {
      const updateData = { name, phone_number, email, address, billingAddress };
      if (status && ['active', 'inactive'].includes(status)) updateData.status = status;

      const client = await Client.findByIdAndUpdate(clientId, updateData, { new: true, runValidators: true });
      if (!client) {
        return { success: false, message: 'Client not found' };
      }

      return { success: true, data: client };
    } catch (error) {
      console.error('Error updating client:', error);
      if (error.code === 11000) {
        return { success: false, message: 'Phone number or email already exists' };
      }
      return { success: false, message: 'Could not update client' };
    }
  }

  /**
   * @description Marks an existing client as inactive instead of deleting it.
   * @param {string} clientId - The MongoDB ID of the client to mark inactive.
   * @returns {Object} - Response object with { success, message } indicating success or failure.
   * @throws {Error} - If the client is not found or update fails.
   * @how - Updates the client's status to 'inactive' and returns a success message.
   */
  static async deleteClient(clientId) {
    try {
      const client = await Client.findByIdAndUpdate(clientId, { status: 'inactive' }, { new: true });
      if (!client) {
        return { success: false, message: 'Client not found' };
      }

      return { success: true, message: 'Client marked as inactive' };
    } catch (error) {
      console.error('Error marking client as inactive:', error);
      return { success: false, message: 'Could not update client status' };
    }
  }

  /**
   * @description Retrieves a single client by ID.
   * @param {string} clientId - The MongoDB ID of the client to retrieve.
   * @returns {Object} - Response object with { success, data: client, message } indicating success or failure.
   * @throws {Error} - If the client is not found or query fails.
   * @how - Queries the database for the client by ID and returns the document.
   */
  static async getClient(clientId) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        return { success: false, message: 'Client not found' };
      }

      return { success: true, data: client };
    } catch (error) {
      console.error('Error fetching client:', error);
      return { success: false, message: 'Could not fetch client' };
    }
  }

  /**
   * @description Retrieves a paginated list of active clients with optional search.
   * @param {Object} [params={}] - Pagination and search parameters.
   * @param {number} [params.page=1] - The page number for pagination.
   * @param {number} [params.limit=10] - The number of items per page.
   * @param {string} [params.search] - Search term to filter client fields.
   * @returns {Object} - Response object with { success, data: { clients, links }, message } including pagination links.
   * @throws {Error} - If database query fails.
   * @how - Filters for 'active' clients, applies search across multiple fields, paginates results, and generates pagination links.
   */
  static async getActiveClients({ page = 1, limit = 10, search } = {}) {
    try {
      const queryFilter = { status: 'active' };
      const searchRegex = search ? new RegExp(search, 'i') : null;

      const skip = (page - 1) * limit;
      const clients = await Client.find({
        ...queryFilter,
        ...(searchRegex ? {
          $or: [
            { name: searchRegex },
            { phone_number: searchRegex },
            { email: searchRegex },
            { address: searchRegex },
            { billingAddress: searchRegex },
          ],
        } : {}),
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalClients = await Client.countDocuments({
        ...queryFilter,
        ...(searchRegex ? {
          $or: [
            { name: searchRegex },
            { phone_number: searchRegex },
            { email: searchRegex },
            { address: searchRegex },
            { billingAddress: searchRegex },
          ],
        } : {}),
      });

      const totalPages = Math.ceil(totalClients / limit);

      const paginationLinks = {
        first: `/clients/active?page=1&limit=${limit}${search ? `&search=${search}` : ''}`,
        prev: page > 1 ? `/clients/active?page=${page - 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
        next: page < totalPages ? `/clients/active?page=${page + 1}&limit=${limit}${search ? `&search=${search}` : ''}` : null,
        last: `/clients/active?page=${totalPages}&limit=${limit}${search ? `&search=${search}` : ''}`,
      };

      return {
        success: true,
        data: {
          clients,
          links: {
            first: paginationLinks.first,
            prev: paginationLinks.prev,
            next: paginationLinks.next,
            last: paginationLinks.last,
            currentPage: page,
            totalPages,
            totalPerPage: limit,
            total: totalClients,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching active clients:', error);
      return { success: false, message: 'Could not fetch active clients' };
    }
  }
};