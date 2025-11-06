// Welcome Flow - Main Orchestrator Component
const { useState, useEffect } = React;

const WelcomeFlow = () => {
  const {
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
    error
  } = window.useFormContext ? window.useFormContext() : {};

  const [questionConfig, setQuestionConfig] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);

  // Load configuration
  useEffect(() => {
    // Load question tree
    if (window.questionTree) {
      setQuestionConfig(window.questionTree[currentStep]);
    } else {
      // Fallback: import or use inline config
      const config = getStepConfig(currentStep);
      setQuestionConfig(config);
    }

    // Load facilities
    if (window.facilitiesConfig) {
      setFacilities(window.facilitiesConfig);
    } else if (window.getRecommendedFacilities && formData.interest) {
      const recommended = window.getRecommendedFacilities(formData.interest);
      setFacilities(recommended.length > 0 ? recommended : window.facilitiesConfig || []);
    }
  }, [currentStep, formData.interest]);

  // Get step configuration
  const getStepConfig = (step) => {
    const configs = {
      1: {
        id: 'user_type',
        question: 'Who are you?',
        subtext: 'This helps us personalize your virtual tour experience',
        type: 'single-select',
        options: [
          { value: 'prospective_student', label: 'Prospective Student', icon: '🎓', description: "I'm considering Truman for college", nextStep: 2 },
          { value: 'parent', label: 'Parent/Guardian', icon: '👨‍👩‍👧', description: 'Learning about Truman for my child', nextStep: 2 },
          { value: 'current_student', label: 'Current Student', icon: '📚', description: 'I attend Truman', nextStep: 3 },
          { value: 'alumni', label: 'Alumni', icon: '🎉', description: 'I graduated from Truman', nextStep: 3 },
          { value: 'visitor', label: 'Just Visiting', icon: '👋', description: 'Exploring the campus', nextStep: 3 }
        ]
      },
      2: {
        id: 'interest',
        question: 'What are you interested in?',
        subtext: 'Select your primary area of interest',
        type: 'single-select',
        options: [
          { value: 'computer_science', label: 'Computer Science', icon: '💻', description: 'Programming, software, technology', nextStep: 3 },
          { value: 'liberal_arts', label: 'Liberal Arts', icon: '📖', description: 'Humanities, languages, philosophy', nextStep: 3 },
          { value: 'sciences', label: 'Sciences', icon: '🔬', description: 'Biology, chemistry, physics', nextStep: 3 },
          { value: 'athletics', label: 'Athletics', icon: '⚽', description: 'Sports, recreation, fitness', nextStep: 3 },
          { value: 'business', label: 'Business', icon: '💼', description: 'Accounting, management, economics', nextStep: 3 },
          { value: 'education', label: 'Education', icon: '🍎', description: 'Teaching, learning sciences', nextStep: 3 },
          { value: 'undecided', label: 'Undecided', icon: '🤔', description: 'Still exploring options', nextStep: 3 }
        ]
      }
    };
    return configs[step];
  };

  // Handle step 1-2: Question answers
  const handleQuestionAnswer = async (answer) => {
    if (!questionConfig) return;

    // Update form data
    if (currentStep === 1) {
      updateFormData('userType', answer);
      
      // Determine next step based on answer
      const option = questionConfig.options.find(opt => opt.value === answer);
      const nextStepNum = option?.nextStep || 2;
      
      // Save response
      if (sessionId) {
        await submitResponse(questionConfig.id, questionConfig.question, answer);
      }
      
      // Skip step 2 if user type doesn't need it
      if (nextStepNum === 3) {
        setCurrentStep(3);
      } else {
        nextStep();
      }
    } else if (currentStep === 2) {
      updateFormData('interest', answer);
      
      // Save response
      if (sessionId) {
        await submitResponse(questionConfig.id, questionConfig.question, answer);
      }
      
      nextStep();
    }
  };

  // Handle step 3: Facility selection
  const handleFacilitySelection = (selectedIds) => {
    updateFormData('selectedFacilities', selectedIds);
    nextStep();
  };

  // Handle step 4: Contact form
  const handleContactSubmit = (contactData) => {
    updateFormData('contactInfo', contactData);
    handleComplete();
  };

  const handleContactSkip = () => {
    handleComplete();
  };

  // Complete flow and transition to tour
  const handleComplete = async () => {
    setShowCompletion(true);
    
    const success = await completeFlow();
    
    // Build transition URL with proper encoding
    const buildTransitionURL = () => {
      const baseURL = window.location.origin;
      const params = new URLSearchParams();
      
      if (sessionId) {
        params.append('sessionId', sessionId);
      }
      
      if (formData.selectedFacilities && formData.selectedFacilities.length > 0) {
        params.append('facilities', formData.selectedFacilities.join(','));
      }
      
      // Add delay parameter (2 seconds for transition page)
      params.append('delay', '2000');
      
      const queryString = params.toString();
      return `${baseURL}/transition${queryString ? '?' + queryString : ''}`;
    };
    
    // Redirect to transition page after a short delay
    setTimeout(() => {
      const transitionURL = buildTransitionURL();
      console.log('Redirecting to transition page:', transitionURL);
      window.location.href = transitionURL;
    }, 500);
  };

  // Render current step
  const renderStep = () => {
    if (showCompletion) {
      return (
        <div className="completion-screen text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get ready for your tour!</h2>
          <p className="text-lg text-gray-600 mb-8">Preparing your personalized virtual experience...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        </div>
      );
    }

    if (isLoading && !sessionId) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing your session...</p>
        </div>
      );
    }

    if (error && !sessionId) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
      case 2:
        if (!questionConfig) return null;
        return (
          <QuestionStep
            questionId={questionConfig.id}
            questionText={questionConfig.question}
            questionSubtext={questionConfig.subtext}
            options={questionConfig.options}
            onAnswer={handleQuestionAnswer}
            allowMultiple={false}
            required={true}
            selectedValue={currentStep === 1 ? formData.userType : formData.interest}
          />
        );

      case 3:
        // Get facilities based on interest
        const availableFacilities = window.facilitiesConfig || [];
        return (
          <FacilitySelector
            facilities={availableFacilities}
            selectedFacilities={formData.selectedFacilities}
            onSelectionChange={handleFacilitySelection}
            minSelections={1}
            maxSelections={5}
          />
        );

      case 4:
        return (
          <ContactForm
            contactInfo={formData.contactInfo}
            onUpdate={handleContactSubmit}
            onSkip={handleContactSkip}
            allowSkip={true}
          />
        );

      default:
        return null;
    }
  };

  const stepLabels = ['About You', 'Interests', 'Tour Selection', 'Contact'];

  return (
    <div className="welcome-flow-container min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />

        {/* Back Button */}
        {currentStep > 1 && !showCompletion && (
          <div className="mb-6">
            <button
              onClick={previousStep}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        )}

        {/* Current Step Content */}
        <div className="step-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.WelcomeFlow = WelcomeFlow;
}

export default WelcomeFlow;

