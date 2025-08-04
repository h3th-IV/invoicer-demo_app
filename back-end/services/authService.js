const Staff = require('../models/staff');
const { generateToken } = require('../middleware/auth');

module.exports = class AuthService {
  /**
   * @description Registers a new staff member
   * @param {Object} params - Staff registration parameters
   * @param {string} params.email - Staff email
   * @param {string} params.password - Staff password
   * @param {string} params.name - Staff name
   * @param {string} [params.role] - Staff role (admin or staff)
   * @returns {Object} - Response object with token and staff data
   */
  static async registerStaff({ email, password, name, role = 'staff' }) {
    try {
      if (!email || !password || !name) {
        return { success: false, message: 'Email, password, and name are required' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      // Check if staff already exists
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return { success: false, message: 'Staff with this email already exists' };
      }

      const staff = new Staff({ email, password, name, role });
      await staff.save();

      const token = generateToken({ id: staff._id, type: 'staff' });

      const userData = staff.toPublicJSON();
      userData.type = 'staff';
      
      console.log('Staff register - userData:', userData);

      return {
        success: true,
        data: {
          token,
          user: userData
        }
      };
    } catch (error) {
      console.error('Error registering staff:', error);
      return { success: false, message: 'Could not register staff' };
    }
  }

  /**
   * @description Authenticates staff login
   * @param {string} email - Staff email
   * @param {string} password - Staff password
   * @returns {Object} - Response object with token and staff data
   */
  static async loginStaff(email, password) {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const staff = await Staff.findOne({ email });
      if (!staff) {
        return { success: false, message: 'Invalid credentials' };
      }

      if (staff.status !== 'active') {
        return { success: false, message: 'Account is inactive' };
      }

      const isPasswordValid = await staff.comparePassword(password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      const token = generateToken({ id: staff._id, type: 'staff' });

      const userData = staff.toPublicJSON();
      userData.type = 'staff';
      
      console.log('Staff login - userData: ', userData);

      return {
        success: true,
        data: {
          token,
          user: userData
        }
      };
    } catch (error) {
      console.error('Error logging in staff:', error);
      return { success: false, message: 'Login failed' };
    }
  }
}; 