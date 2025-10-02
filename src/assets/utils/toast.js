/**
 * Toast utility functions for consistent, color-coded notifications across the application
 * Uses Shadcn's Sonner component for modern, professional toast notifications
 */

import { toast } from 'sonner';

/**
 * Show a success toast notification
 * @param {string} message - Success message to display
 * @param {object} options - Additional toast options
 */
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    ...options,
  });
};

/**
 * Show an error toast notification
 * @param {string} message - Error message to display
 * @param {object} options - Additional toast options
 */
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    duration: 6000, // Errors stay a bit longer
    ...options,
  });
};

/**
 * Show a warning toast notification
 * @param {string} message - Warning message to display
 * @param {object} options - Additional toast options
 */
export const showWarningToast = (message, options = {}) => {
  return toast.warning || toast(message, {
    duration: 5000,
    icon: '⚠️',
    ...options,
  });
};

/**
 * Show an info toast notification
 * @param {string} message - Info message to display
 * @param {object} options - Additional toast options
 */
export const showInfoToast = (message, options = {}) => {
  return toast.info || toast(message, {
    duration: 4000,
    icon: 'ℹ️',
    ...options,
  });
};

/**
 * Show a loading toast notification
 * @param {string} message - Loading message to display
 * @param {object} options - Additional toast options
 */
export const showLoadingToast = (message = 'Loading...', options = {}) => {
  return toast.loading(message, {
    duration: Infinity, // Loading toasts persist until dismissed
    ...options,
  });
};

/**
 * Handle API errors and show appropriate toast notifications
 * @param {Error} error - The error object from API calls
 * @param {string} defaultMessage - Default message if no specific error found
 * @param {object} options - Additional toast options
 */
export const handleApiErrorToast = (error, defaultMessage = "An unexpected error occurred", options = {}) => {
  let errorMessage = defaultMessage;

  // Extract error message from various API response formats
  if (error.response?.data) {
    const errorData = error.response.data;
    
    if (typeof errorData === 'string') {
      errorMessage = errorData;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData)) {
      errorMessage = errorData.join(', ');
    } else if (typeof errorData === 'object') {
      const errorValues = Object.values(errorData).flat();
      if (errorValues.length > 0) {
        errorMessage = errorValues.join(', ');
      }
    }
  }

  // Handle HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        errorMessage = "Invalid request. Please check your input and try again.";
        break;
      case 401:
        errorMessage = "Authentication failed. Please sign in again.";
        break;
      case 403:
        errorMessage = "You don't have permission to perform this action.";
        break;
      case 404:
        errorMessage = "The requested resource was not found.";
        break;
      case 409:
        errorMessage = "This action conflicts with existing data.";
        break;
      case 429:
        errorMessage = "Too many requests. Please wait a moment and try again.";
        break;
      case 500:
        errorMessage = "Server error. Please try again later.";
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = "Service temporarily unavailable. Please try again later.";
        break;
      default:
        errorMessage = `Request failed with status ${error.response.status}`;
    }
  }

  // Handle network errors
  if (error.message) {
    if (error.message.includes('Network Error')) {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (error.message.includes('timeout')) {
      errorMessage = "Request timeout. Please try again.";
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      errorMessage = "Unable to connect to server. Please check your internet connection.";
    }
  }

  console.error('API Error:', error);
  return showErrorToast(errorMessage, options);
};

/**
 * Show a promise-based toast that updates based on promise state
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Object with loading, success, and error messages
 * @param {object} options - Additional toast options
 */
export const showPromiseToast = (promise, messages = {}, options = {}) => {
  const {
    loading = 'Loading...',
    success = 'Operation completed successfully',
    error = 'Operation failed',
  } = messages;

  return toast.promise(promise, {
    loading,
    success: (data) => {
      if (typeof success === 'function') {
        return success(data);
      }
      return success;
    },
    error: (err) => {
      if (typeof error === 'function') {
        return error(err);
      }
      return error;
    },
    ...options,
  });
};

/**
 * Dismiss a specific toast by ID
 * @param {string} toastId - ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  return toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  return toast.dismiss();
};

/**
 * Show a custom toast with advanced options
 * @param {string|ReactNode} content - Toast content
 * @param {object} options - Toast options
 */
export const showCustomToast = (content, options = {}) => {
  return toast(content, options);
};
