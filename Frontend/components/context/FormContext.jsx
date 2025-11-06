// FormContext - Global State Management
const { createContext, useContext, useState, useEffect } = React;

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    userType: null,
    interest: null,
    parentContext: {
      childGradeLevel: null,
      plannedEnrollmentYear: null
    },
    selectedFacilities: [],
    contactInfo: {
      email: '',
      phone: '',
      name: '',
      zipCode: '',
      optInForUpdates: false
    }
  });

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiService = window.apiService || await import('../../services/api.js').then(m => m.default);
      const response = await apiService.createSession('unknown');
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
        console.log('Session initialized:', response.sessionId);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setError('Failed to initialize session. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => {
      // Handle nested fields like contactInfo.email
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const submitResponse = async (questionId, question, answer) => {
    if (!sessionId) {
      console.warn('Cannot submit response: No session ID');
      return;
    }

    try {
      const apiService = window.apiService || await import('../../services/api.js').then(m => m.default);
      await apiService.saveResponse(sessionId, questionId, question, answer);
      console.log('Response saved:', { questionId, answer });
    } catch (error) {
      console.error('Failed to save response:', error);
      // Don't throw - allow user to continue
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeFlow = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const apiService = window.apiService || await import('../../services/api.js').then(m => m.default);
      
      // Save contact info if provided
      if (formData.contactInfo.email || formData.contactInfo.name) {
        await apiService.updateContactInfo(sessionId, formData.contactInfo);
      }
      
      // Save facility selections
      for (const facilityId of formData.selectedFacilities) {
        await apiService.saveFacilitySelection(sessionId, facilityId);
      }
      
      // Complete session
      await apiService.completeSession(sessionId);
      
      console.log('Flow completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to complete flow:', error);
      setError('Failed to complete session. You can still continue to the tour.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    sessionId,
    currentStep,
    setCurrentStep,
    totalSteps,
    formData,
    updateFormData,
    submitResponse,
    nextStep,
    previousStep,
    completeFlow,
    isLoading,
    error,
    setError
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
};

// Make available globally for non-module environments
if (typeof window !== 'undefined') {
  window.FormContext = FormContext;
  window.FormProvider = FormProvider;
  window.useFormContext = useFormContext;
}

