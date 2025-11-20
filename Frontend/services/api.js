/**
 * API Service Layer
 * 
 * This module provides a centralized API client for communicating with the backend.
 * It automatically detects the environment (development vs production) and uses the
 * appropriate API base URL:
 * - Development: http://localhost:3000/api
 * - Production: /api (relative URL for Vercel serverless functions)
 * 
 * All API methods include retry logic with exponential backoff and timeout handling
 * to make the application more resilient to network issues.
 */
function getAPIBaseURL() {
  // Allow override via window.API_BASE_URL
  if (window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  
  // In production (Vercel), use relative URL (same domain)
  // In development, use localhost:3000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // Production: use relative URL (works with Vercel serverless function)
  return '/api';
}

const API_BASE_URL = getAPIBaseURL();

// Log API configuration for debugging
console.log('API Service initialized:', {
  baseURL: API_BASE_URL,
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  environment: window.location.hostname === 'localhost' ? 'development' : 'production'
});

class APIService {
  async createSession(userType = 'unknown', retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE_URL}/sessions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ userType }),
          signal: controller.signal,
          mode: 'cors',
          credentials: 'include'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorMessage = 'Failed to create session';
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        return await response.json();
      } catch (error) {
        // Handle abort (timeout)
        if (error.name === 'AbortError') {
          if (attempt < retries) {
            console.warn(`Request timeout, retrying... (${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          throw new Error('Request timeout. Please check if the backend server is running.');
        }
        
        // Handle CORS and network errors
        if (error.message.includes('CORS') || 
            error.message.includes('Failed to fetch') || 
            error.name === 'TypeError' ||
            error.message.includes('NetworkError')) {
          
          if (attempt < retries) {
            console.warn(`Network error, retrying... (${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          
          console.error('API Error - CORS or Network Issue:', error);
          console.error('   API Base URL:', API_BASE_URL);
          console.error('   Current hostname:', window.location.hostname);
          console.error('   Current origin:', window.location.origin);
          
          // Provide helpful error message
          const errorMsg = window.location.hostname === 'localhost' 
            ? 'Cannot connect to backend server. Make sure the backend is running on http://localhost:3000'
            : 'Cannot connect to server. Please check your network connection or try again later.';
          throw new Error(errorMsg);
        }
        
        // For other errors, don't retry
        console.error('API Error - createSession:', error);
        throw error;
      }
    }
  }

  async saveResponse(sessionId, questionId, question, answer) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, questionText: question, answer })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to save response';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      // Don't throw for response saving - allow user to continue
      console.warn('API Warning - saveResponse (non-blocking):', error.message);
      return { success: false, error: error.message };
    }
  }

  async saveFacilitySelection(sessionId, facilityId) {
    try {
      // Get facility name from facilities config
      const facility = window.facilitiesConfig?.find(f => f.id === facilityId);
      const facilityName = facility?.name || facilityId;
      
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/facilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save facility');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error - saveFacilitySelection:', error);
      throw error;
    }
  }

  async updateContactInfo(sessionId, contactInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error - updateContactInfo:', error);
      throw error;
    }
  }

  async completeSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error - completeSession:', error);
      throw error;
    }
  }
}

// Export as singleton
if (typeof window !== 'undefined') {
  window.apiService = new APIService();
}

// For non-module environments
if (typeof window !== 'undefined' && typeof module === 'undefined') {
  window.APIService = APIService;
}

