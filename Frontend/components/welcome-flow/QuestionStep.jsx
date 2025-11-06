// Question Step Component - Reusable Question Interface
const { useState, useEffect } = React;

const QuestionStep = ({
  questionId,
  questionText,
  questionSubtext,
  options = [],
  onAnswer,
  allowMultiple = false,
  required = true,
  selectedValue = null,
  selectedValues = []
}) => {
  const [selected, setSelected] = useState(
    allowMultiple ? selectedValues : selectedValue
  );
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (allowMultiple) {
      setSelected(selectedValues || []);
    } else {
      setSelected(selectedValue);
    }
  }, [selectedValue, selectedValues, allowMultiple]);

  const handleOptionClick = (optionValue) => {
    if (allowMultiple) {
      const newSelected = selected.includes(optionValue)
        ? selected.filter(v => v !== optionValue)
        : [...selected, optionValue];
      setSelected(newSelected);
      onAnswer(newSelected);
    } else {
      setSelected(optionValue);
      onAnswer(optionValue);
      setValidationError('');
    }
  };

  const handleContinue = () => {
    if (required) {
      if (allowMultiple) {
        if (!selected || selected.length === 0) {
          setValidationError('Please select at least one option');
          return;
        }
      } else {
        if (!selected) {
          setValidationError('Please select an option');
          return;
        }
      }
    }
    
    if (onAnswer) {
      onAnswer(selected);
    }
  };

  return (
    <div className="welcome-question-step animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {questionText}
        </h2>
        {questionSubtext && (
          <p className="text-lg text-gray-600">{questionSubtext}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
        {options.map((option) => {
          const isSelected = allowMultiple
            ? selected?.includes(option.value)
            : selected === option.value;

          return (
            <div
              key={option.value}
              className={`option-card p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-purple-700 bg-purple-50 shadow-lg transform scale-105'
                  : 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-md'
              }`}
              onClick={() => handleOptionClick(option.value)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionClick(option.value);
                }
              }}
              aria-pressed={isSelected}
            >
              <div className="flex items-start">
                <div className="text-4xl mr-4">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {option.label}
                  </h3>
                  {option.description && (
                    <p className="text-gray-600 text-sm">
                      {option.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="text-purple-700">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {validationError && (
        <div className="text-center mb-4">
          <p className="text-red-600 text-sm">{validationError}</p>
        </div>
      )}

      {!allowMultiple && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={required && !selected}
            className="px-8 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.QuestionStep = QuestionStep;
}

export default QuestionStep;

