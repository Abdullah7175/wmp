/**
 * Secure Error Handler
 * Prevents sensitive information disclosure in error messages
 */

/**
 * Get a safe error message for client responses
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message to show in production
 * @returns {string} Safe error message
 */
export function getSafeErrorMessage(error, defaultMessage = 'An error occurred') {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In development, show more details for debugging
  if (isDevelopment) {
    return error.message || defaultMessage;
  }
  
  // In production, return generic message
  return defaultMessage;
}

/**
 * Create a safe error response for API routes
 * @param {Error} error - The error object
 * @param {Object} options - Response options
 * @param {number} options.status - HTTP status code (default: 500)
 * @param {string} options.message - Custom error message
 * @param {boolean} options.includeDetails - Include error details (dev only)
 * @returns {NextResponse} Safe error response
 */
export function createErrorResponse(error, options = {}) {
  const { 
    status = 500, 
    message = 'An error occurred',
    includeDetails = false 
  } = options;
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log full error details server-side (never expose to client)
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name,
    timestamp: new Date().toISOString()
  });
  
  // Build safe response
  const response = {
    error: isDevelopment ? getSafeErrorMessage(error, message) : message
  };
  
  // Only include details in development if explicitly requested
  if (isDevelopment && includeDetails) {
    response.details = {
      message: error.message,
      code: error.code,
      name: error.name
    };
  }
  
  return response;
}

/**
 * Handle database errors securely
 * @param {Error} error - Database error object
 * @param {string} operation - Operation that failed (e.g., 'fetch', 'create', 'update')
 * @returns {Object} Safe error response object
 */
export function handleDatabaseError(error, operation = 'operation') {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log full error server-side
  console.error(`Database error during ${operation}:`, {
    message: error.message,
    code: error.code,
    detail: error.detail,
    hint: error.hint,
    constraint: error.constraint,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific database error codes
  if (error.code === '23505') { // Unique violation
    return {
      error: 'A record with this information already exists',
      status: 400
    };
  }
  
  if (error.code === '23503') { // Foreign key violation
    return {
      error: 'Invalid reference. One or more referenced records do not exist.',
      status: 400
    };
  }
  
  if (error.code === '23502') { // Not null violation
    return {
      error: 'Required field is missing',
      status: 400
    };
  }
  
  if (error.code === '23514') { // Check violation
    return {
      error: 'Data validation failed',
      status: 400
    };
  }
  
  // Connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || 
      error.message?.includes('timeout') || error.message?.includes('connection')) {
    return {
      error: 'Database connection failed. Please try again later.',
      status: 503
    };
  }
  
  // Generic database error
  return {
    error: isDevelopment 
      ? `Database error: ${error.message}` 
      : 'An error occurred while processing your request',
    status: 500
  };
}

/**
 * Handle validation errors securely
 * @param {Error} error - Validation error object
 * @returns {Object} Safe error response object
 */
export function handleValidationError(error) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.error('Validation error:', {
    message: error.message,
    field: error.field,
    value: error.value,
    timestamp: new Date().toISOString()
  });
  
  return {
    error: isDevelopment 
      ? error.message 
      : 'Invalid input provided',
    status: 400
  };
}

/**
 * Handle authentication/authorization errors securely
 * @param {Error} error - Auth error object
 * @returns {Object} Safe error response object
 */
export function handleAuthError(error) {
  console.error('Authentication error:', {
    message: error.message,
    timestamp: new Date().toISOString()
  });
  
  return {
    error: 'Authentication failed',
    status: 401
  };
}
