/**
 * Converts technical error messages into human-readable messages
 */

export function getHumanReadableError(error: unknown, context?: string): string {
  let errorMessage = '';
  
  // Extract the error message from different error formats
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  // Remove any JSON formatting artifacts
  errorMessage = errorMessage.replace(/^\{?"?error"?:?"?/i, '').replace(/["}]+$/, '').trim();
  
  // Convert specific technical errors to user-friendly messages
  const errorMap: Record<string, string> = {
    // LinkedIn errors
    'No active LinkedIn member token found': 'Please connect your LinkedIn account first. Click "Connect LinkedIn" in the settings.',
    'LinkedIn token expired': 'Your LinkedIn connection has expired. Please reconnect your LinkedIn account.',
    'No LinkedIn organization token': 'Please reconnect your LinkedIn account to access organization pages.',
    
    // Facebook errors
    'No active Facebook token found': 'Please connect your Facebook account first. Click "Connect Facebook" in the settings.',
    'No active Facebook page token': 'Please connect your Facebook page. Go to settings and link your Facebook page.',
    'Facebook token expired': 'Your Facebook connection has expired. Please reconnect your Facebook account.',
    
    // Authentication errors
    'User not authenticated': 'Your session has expired. Please log in again.',
    'Unauthorized': 'Your session has expired. Please log in again.',
    '401': 'Your session has expired. Please log in again.',
    
    // Network errors
    'Failed to fetch': 'Unable to connect to the server. Please check your internet connection and try again.',
    'Network request failed': 'Unable to connect to the server. Please check your internet connection and try again.',
    'NetworkError': 'Unable to connect to the server. Please check your internet connection and try again.',
    
    // Validation errors
    'Invalid input': 'Please check your input and try again.',
    'Validation failed': 'Please check that all required fields are filled correctly.',
    
    // Generic server errors
    'Internal Server Error': 'Something went wrong on our end. Please try again in a moment.',
    '500': 'Something went wrong on our end. Please try again in a moment.',
  };

  // Check if we have a direct mapping
  for (const [techError, humanError] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(techError.toLowerCase())) {
      return humanError;
    }
  }

  // Handle specific patterns
  if (errorMessage.match(/token.*not found/i)) {
    return 'Please connect your social media account first. Go to settings to link your account.';
  }
  
  if (errorMessage.match(/token.*expired/i)) {
    return 'Your social media connection has expired. Please reconnect your account in settings.';
  }
  
  if (errorMessage.match(/not found|404/i)) {
    return 'The requested resource was not found. Please try again.';
  }
  
  if (errorMessage.match(/permission|forbidden|403/i)) {
    return 'You don\'t have permission to perform this action. Please check your account settings.';
  }

  // If we have a clean error message (not JSON), use it
  if (errorMessage && !errorMessage.startsWith('{') && !errorMessage.includes('"error"')) {
    // Capitalize first letter if needed
    const cleanMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
    
    // If message is too technical (contains code patterns), provide generic message
    if (cleanMessage.match(/\w+Error:|stack|trace|undefined|null/i)) {
      return context 
        ? `Something went wrong while ${context}. Please try again.`
        : 'Something went wrong. Please try again.';
    }
    
    return cleanMessage;
  }

  // Fallback message based on context
  if (context) {
    return `Unable to ${context}. Please try again.`;
  }
  
  return 'Something went wrong. Please try again.';
}

/**
 * Specific helper for social media posting errors
 */
export function getSocialMediaError(error: unknown, platform: string): string {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for token-related errors
  if (errorMessage.toLowerCase().includes('token')) {
    if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('no active')) {
      return `Please connect your ${platformName} account first. Go to the Social Connect tab to link your account.`;
    }
    if (errorMessage.toLowerCase().includes('expired')) {
      return `Your ${platformName} connection has expired. Please reconnect your account in the Social Connect tab.`;
    }
  }
  
  // Use the general error handler with context
  return getHumanReadableError(error, `post to ${platformName}`);
}
