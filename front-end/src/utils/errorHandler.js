/**
 * Extracts the error message from API response
 * @param {Error} error - The error object from axios
 * @returns {string} - The error message to display
 */
export const extractErrorMessage = (error) => {
  // Check if it's an axios error with response
  if (error.response && error.response.data) {
    const { data } = error.response;
    
    // Check if the backend returns error in the expected format
    if (data.error) {
      return data.error;
    }
    
    // Check if the backend returns message field
    if (data.message) {
      return data.message;
    }
    
    // Check if there's a specific error message
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }
    
    // Fallback to status text
    if (error.response.statusText) {
      return error.response.statusText;
    }
  }
  
  // Check if it's a network error
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    return 'Network error: Unable to connect to the server. Please check your internet connection.';
  }
  
  // Check if it's a timeout error
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return 'Request timeout: The server took too long to respond. Please try again.';
  }
  
  // Check if it's a CORS error
  if (error.message.includes('CORS')) {
    return 'CORS error: Unable to access the server. Please check if the backend is running.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Handles API errors and shows appropriate toast messages
 * @param {Error} error - The error object from axios
 * @param {Function} toast - The toast function from react-hot-toast
 * @param {string} defaultMessage - Default message if error extraction fails
 */
export const handleApiError = (error, toast, defaultMessage = 'Operation failed') => {
  const errorMessage = extractErrorMessage(error);
  toast.error(errorMessage || defaultMessage);
  console.error('API Error:', error);
}; 