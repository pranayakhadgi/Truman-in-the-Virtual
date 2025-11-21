// Facility Selector Component - Multi-select for tour locations
const { useState, useEffect } = React;

const FacilitySelector = ({
  facilities = [],
  selectedFacilities = [],
  onSelectionChange,
  minSelections = 1,
  maxSelections = 5
}) => {
  const [selected, setSelected] = useState(selectedFacilities || []);
  const [filter, setFilter] = useState('all');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setSelected(selectedFacilities);
  }, [selectedFacilities]);

  const categories = ['all', ...new Set(facilities.map(f => f.category))];

  const filteredFacilities = filter === 'all'
    ? facilities
    : facilities.filter(f => f.category === filter);

  const handleFacilityToggle = (facilityId) => {
    let newSelected;
    
    if (selected.includes(facilityId)) {
      newSelected = selected.filter(id => id !== facilityId);
    } else {
      if (selected.length >= maxSelections) {
        setValidationError(`Maximum ${maxSelections} facilities can be selected`);
        setTimeout(() => setValidationError(''), 3000);
        return;
      }
      newSelected = [...selected, facilityId];
    }
    
    setSelected(newSelected);
    setValidationError('');
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredFacilities.map(f => f.id);
    const limited = allIds.slice(0, maxSelections);
    setSelected(limited);
    if (onSelectionChange) {
      onSelectionChange(limited);
    }
  };

  const handleClearAll = () => {
    setSelected([]);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const canContinue = selected.length >= minSelections;

  return (
    <div className="facility-selector animate-fadeIn">
      <div className="mb-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === category
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Select All / Clear All */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={handleSelectAll}
            className="text-sm text-purple-700 hover:text-purple-800 font-medium"
          >
            Select All ({Math.min(filteredFacilities.length, maxSelections)})
          </button>
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-6">
        {filteredFacilities.map(facility => {
          const isSelected = selected.includes(facility.id);
          
          return (
            <div
              key={facility.id}
              className={`facility-card p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-purple-700 bg-purple-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-md'
              } ${selected.length >= maxSelections && !isSelected ? 'opacity-50' : ''}`}
              onClick={() => handleFacilityToggle(facility.id)}
            >
              <div className="relative mb-3">
                <img
                  src={facility.thumbnail}
                  alt={facility.name}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/public/images/truman_clocktower.webp';
                  }}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-purple-700 text-white rounded-full p-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{facility.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{facility.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>⏱ {facility.estimatedTime}</span>
                <span>{facility.sceneCount} scenes</span>
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

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          {selected.length} of {maxSelections} selected
          {selected.length < minSelections && ` (minimum ${minSelections} required)`}
        </p>
        <button
          onClick={() => onSelectionChange && onSelectionChange(selected)}
          disabled={!canContinue}
          className="px-8 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.FacilitySelector = FacilitySelector;
}

export default FacilitySelector;

