const { errorResponse, successResponse } = require('../utils/response');
const AuthService = require('../services/authService');

module.exports = class AuthController {
  /**
   * @description Registers a new staff member
   * @param {Object} req - Express request object with body
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with token and staff data
   */
  static async registerStaff(req, res) {
    try {
      const { email, password, name, role } = req.body;
      
      const response = await AuthService.registerStaff({ email, password, name, role });
      if (!response.success) {
        return errorResponse(res, 400, response.message);
      }

      return successResponse(res, 201, 'Staff registered successfully', response.data);
    } catch (error) {
      console.error('Error in registerStaff:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Authenticates staff login
   * @param {Object} req - Express request object with body
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with token and staff data
   */
  static async loginStaff(req, res) {
    try {
      const { email, password } = req.body;
      const response = await AuthService.loginStaff(email, password);
      if (!response.success) {
        return errorResponse(res, 401, response.message);
      }

      return successResponse(res, 200, 'Staff logged in successfully', response.data);
    } catch (error) {
      console.error('Error in loginStaff:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }

  /**
   * @description Gets current user profile
   * @param {Object} req - Express request object (with user from auth middleware)
   * @param {Object} res - Express response object
   * @returns {Object} - JSON response with user data
   */
  static async getProfile(req, res) {
    try {
      const user = req.user;
      // Ensure the type field is included
      const userWithType = { ...user, type: user.type };
      return successResponse(res, 200, 'Profile retrieved successfully', { user: userWithType });
    } catch (error) {
      console.error('Error in getProfile:', error);
      return errorResponse(res, 500, 'An unexpected error occurred');
    }
  }
}; 