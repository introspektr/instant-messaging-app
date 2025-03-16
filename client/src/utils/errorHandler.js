/**
 * Utility for handling API errors in a consistent way
 * @param {Error|Response} error - The error object or response
 * @param {Function} callback - Function to call with the error message
 * @param {string} defaultMessage - Default message to use if error details can't be extracted
 * @returns {Promise<void>}
 */
export const handleApiError = async (error, callback, defaultMessage = 'An error occurred') => {
  let errorMessage = defaultMessage;

  try {
    // If it's a Response object from fetch
    if (error instanceof Response) {
      try {
        const data = await error.json();
        errorMessage = data.error || data.message || `Error: ${error.status}`;
      } catch {
        errorMessage = `Error: ${error.status} ${error.statusText}`;
      }
    } 
    // If it's an Error object with a message
    else if (error instanceof Error) {
      errorMessage = error.message;
    }
    // If it's an object with an error or message property
    else if (error && typeof error === 'object') {
      errorMessage = error.error || error.message || defaultMessage;
    }
  } catch (e) {
    // If anything goes wrong parsing the error, use the default message
    console.error('Error parsing error:', e);
  }

  // Call the callback with the error message
  if (callback && typeof callback === 'function') {
    callback(errorMessage);
  }
}; 