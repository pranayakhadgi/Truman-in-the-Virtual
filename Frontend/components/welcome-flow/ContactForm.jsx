// Contact Form Component - Optional contact information
const { useState, useEffect } = React;

const ContactForm = ({
  contactInfo = {},
  onUpdate,
  onSkip,
  allowSkip = true
}) => {
  const [formData, setFormData] = useState({
    email: contactInfo.email || '',
    name: contactInfo.name || '',
    phone: contactInfo.phone || '',
    zipCode: contactInfo.zipCode || '',
    optInForUpdates: contactInfo.optInForUpdates || false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      email: contactInfo.email || '',
      name: contactInfo.name || '',
      phone: contactInfo.phone || '',
      zipCode: contactInfo.zipCode || '',
      optInForUpdates: contactInfo.optInForUpdates || false
    });
  }, [contactInfo]);

  const validateEmail = (email) => {
    if (!email) return true; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'phone') {
      processedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onUpdate) {
      onUpdate(formData);
    }
  };

  return (
    <div className="contact-form animate-fadeIn max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Your information is only used by Truman Admissions and is never shared.{' '}
            <a href="#" className="text-purple-700 hover:underline">Privacy Policy</a>
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              maxLength={14}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
              placeholder="12345"
              maxLength={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Opt-in Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="optIn"
              checked={formData.optInForUpdates}
              onChange={(e) => handleChange('optInForUpdates', e.target.checked)}
              className="mt-1 h-4 w-4 text-purple-700 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="optIn" className="ml-2 text-sm text-gray-700">
              Send me updates about Truman State University
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors"
          >
            Continue to Tour
          </button>
          {allowSkip && (
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

if (typeof window !== 'undefined') {
  window.ContactForm = ContactForm;
}

export default ContactForm;

