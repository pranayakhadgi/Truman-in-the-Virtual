// API Service Layer
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

class APIService {
  async createSession(userType = 'unknown') {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType })
      });
      
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
      // Handle CORS and network errors
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.error('API Error - CORS or Network Issue:', error);
        console.error('   Make sure backend is running on:', API_BASE_URL);
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      console.error('API Error - createSession:', error);
      throw error;
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

