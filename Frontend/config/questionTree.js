// Question Tree Configuration - Branching Logic
const questionTree = {
  1: {
    id: 'user_type',
    question: 'Who are you?',
    subtext: 'This helps us personalize your virtual tour experience',
    type: 'single-select',
    required: true,
    options: [
      {
        value: 'prospective_student',
        label: 'Prospective Student',
        icon: '🎓',
        description: "I'm considering Truman for college",
        nextStep: 2
      },
      {
        value: 'parent',
        label: 'Parent/Guardian',
        icon: '👨‍👩‍👧',
        description: 'Learning about Truman for my child',
        nextStep: 2,
        additionalFields: ['childGradeLevel', 'plannedYear']
      },
      {
        value: 'current_student',
        label: 'Current Student',
        icon: '📚',
        description: 'I attend Truman',
        nextStep: 3 // Skip interest question
      },
      {
        value: 'alumni',
        label: 'Alumni',
        icon: '🎉',
        description: 'I graduated from Truman',
        nextStep: 3 // Skip interest question
      },
      {
        value: 'visitor',
        label: 'Just Visiting',
        icon: '👋',
        description: 'Exploring the campus',
        nextStep: 3 // Skip interest question
      }
    ]
  },
  
  2: {
    id: 'interest',
    question: 'What are you interested in?',
    subtext: 'Select your primary area of interest',
    type: 'single-select',
    required: true,
    showWhen: (formData) => {
      return ['prospective_student', 'parent'].includes(formData.userType);
    },
    options: [
      {
        value: 'computer_science',
        label: 'Computer Science',
        icon: '💻',
        description: 'Programming, software, technology',
        nextStep: 3,
        recommendedFacilities: ['violette_hall', 'cs_lab', 'library_tech']
      },
      {
        value: 'liberal_arts',
        label: 'Liberal Arts',
        icon: '📖',
        description: 'Humanities, languages, philosophy',
        nextStep: 3,
        recommendedFacilities: ['mcclain_hall', 'library', 'baldwin_hall']
      },
      {
        value: 'sciences',
        label: 'Sciences',
        icon: '🔬',
        description: 'Biology, chemistry, physics',
        nextStep: 3,
        recommendedFacilities: ['magruder_hall', 'science_labs', 'greenhouse']
      },
      {
        value: 'athletics',
        label: 'Athletics',
        icon: '⚽',
        description: 'Sports, recreation, fitness',
        nextStep: 3,
        recommendedFacilities: ['stokes_stadium', 'pershing_arena', 'rec_center']
      },
      {
        value: 'business',
        label: 'Business',
        icon: '💼',
        description: 'Accounting, management, economics',
        nextStep: 3,
        recommendedFacilities: ['violette_business', 'student_union']
      },
      {
        value: 'education',
        label: 'Education',
        icon: '🍎',
        description: 'Teaching, learning sciences',
        nextStep: 3,
        recommendedFacilities: ['education_building', 'lab_school']
      },
      {
        value: 'undecided',
        label: 'Undecided',
        icon: '🤔',
        description: 'Still exploring options',
        nextStep: 3,
        recommendedFacilities: [] // Show all facilities
      }
    ]
  },
  
  3: {
    id: 'facilities',
    question: 'What would you like to see?',
    subtext: 'Select one or more locations to visit',
    type: 'multi-select',
    required: true,
    minSelections: 1,
    maxSelections: 5,
    nextStep: 4
  },
  
  4: {
    id: 'contact',
    question: 'Stay connected with Truman',
    subtext: 'Optional - help us provide you with relevant information',
    type: 'form',
    required: false,
    allowSkip: true,
    nextStep: 'complete',
    fields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: false,
        validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      {
        name: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: false
      },
      {
        name: 'phone',
        type: 'tel',
        label: 'Phone Number (Optional)',
        placeholder: '(555) 123-4567',
        required: false
      },
      {
        name: 'zipCode',
        type: 'text',
        label: 'Zip Code',
        placeholder: '12345',
        required: false,
        maxLength: 10
      },
      {
        name: 'optInForUpdates',
        type: 'checkbox',
        label: 'Send me updates about Truman State University',
        defaultValue: false
      }
    ]
  }
};

// Navigation Logic
const getNextStep = (currentStep, answer, formData) => {
  const currentConfig = questionTree[currentStep];
  
  if (currentConfig.type === 'single-select') {
    const selectedOption = currentConfig.options.find(opt => opt.value === answer);
    return selectedOption?.nextStep || currentStep + 1;
  }
  
  return currentConfig.nextStep;
};

const shouldShowStep = (stepNumber, formData) => {
  const stepConfig = questionTree[stepNumber];
  
  if (!stepConfig.showWhen) return true;
  
  return stepConfig.showWhen(formData);
};

// Make available globally
if (typeof window !== 'undefined') {
  window.questionTree = questionTree;
  window.getNextStep = getNextStep;
  window.shouldShowStep = shouldShowStep;
}

