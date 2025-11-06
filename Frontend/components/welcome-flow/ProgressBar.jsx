// Progress Bar Component
const ProgressBar = ({ currentStep, totalSteps, stepLabels = [] }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step <= currentStep
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
              {stepLabels[index] && (
                <span className="mt-2 text-xs text-gray-600 text-center">
                  {stepLabels[index]}
                </span>
              )}
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                  step < currentStep ? 'bg-purple-700' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Percentage */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-purple-700 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.ProgressBar = ProgressBar;
}

export default ProgressBar;

