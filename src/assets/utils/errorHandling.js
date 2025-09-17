/**
 * Utility functions for handling API errors consistently across the application
 */

/**
 * Extracts error message from API response
 * @param {Error} error - The error object from axios or fetch
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} - User-friendly error message
 */
export const extractErrorMessage = (error, defaultMessage = "An unexpected error occurred") => {
  console.log('Extracting error message from:', error);
  
  // Check if error has response data (axios error)
  if (error.response?.data) {
    const errorData = error.response.data;
    console.log('Error data:', errorData);
    
    // Prioritize API error messages - check multiple possible fields
    const apiErrorMessage = 
      errorData.error ||           // Most common API error field
      errorData.message ||         // Alternative error field
      errorData.detail ||          // Django REST framework style
      errorData.error_description; // OAuth style errors
    
    if (apiErrorMessage && typeof apiErrorMessage === 'string' && apiErrorMessage.trim()) {
      console.log('Found API error message:', apiErrorMessage);
      return apiErrorMessage.trim();
    }
    
    // Handle different error response formats
    if (typeof errorData === 'string' && errorData.trim()) {
      console.log('Error data is string:', errorData);
      return errorData.trim();
    }
    
    // Handle validation errors (array of errors)
    if (Array.isArray(errorData) && errorData.length > 0) {
      const errorMessage = errorData.join(', ');
      console.log('Array error message:', errorMessage);
      return errorMessage;
    }
    
    // Handle object with error fields
    if (typeof errorData === 'object') {
      const errorValues = Object.values(errorData)
        .flat()
        .filter(val => typeof val === 'string' && val.trim());
      if (errorValues.length > 0) {
        const errorMessage = errorValues.join(', ');
        console.log('Object error message:', errorMessage);
        return errorMessage;
      }
    }
  }
  
  // Check response status for common HTTP errors only if no API error message found
  if (error.response?.status) {
    console.log('No API error message found, using status code:', error.response.status);
    switch (error.response.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication failed. Please sign in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return `Request failed with status ${error.response.status}`;
    }
  }
  
  // Check for network or other errors
  if (error.message) {
    console.log('Using error message:', error.message);
    // Handle common network errors
    if (error.message.includes('Network Error')) {
      return "Network error. Please check your internet connection.";
    }
    if (error.message.includes('timeout')) {
      return "Request timeout. Please try again.";
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return "Unable to connect to server. Please check your internet connection.";
    }
    return error.message;
  }
  
  // Fallback to default message
  console.log('Using default message:', defaultMessage);
  return defaultMessage;
};

/**
 * Standardized error handler for API calls
 * @param {Error} error - The error object
 * @param {Function} setErrorModal - Function to show error modal
 * @param {string} defaultMessage - Default error message
 */
export const handleApiError = (error, setErrorModal, defaultMessage) => {
  const errorMessage = extractErrorMessage(error, defaultMessage);
  console.error('API Error:', error);
  setErrorModal(errorMessage);
};

/**
 * Create a promise-based error handler for async operations
 * @param {Function} operation - The async operation to execute
 * @param {Function} setErrorModal - Function to show error modal
 * @param {string} defaultMessage - Default error message
 * @returns {Promise} - The wrapped operation
 */
export const withErrorHandling = async (operation, setErrorModal, defaultMessage) => {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, setErrorModal, defaultMessage);
    throw error; // Re-throw to allow caller to handle as needed
  }
};