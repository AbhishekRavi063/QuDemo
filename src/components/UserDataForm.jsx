import React, { useState } from 'react';

const UserDataForm = ({ field, onSubmit, onSkip }) => {
  const [value, setValue] = useState('');
  
  const getTitle = () => {
    switch(field) {
      case 'name': return "What's your name?";
      case 'email': return 'How can we reach you?';
      case 'company': return 'Which company are you with?';
      default: return '';
    }
  };
  
  const getPlaceholder = () => {
    switch(field) {
      case 'name': return 'Enter your name';
      case 'email': return 'Enter your email';
      case 'company': return 'Enter your company name';
      default: return '';
    }
  };
  
  const getInputType = () => {
    return field === 'email' ? 'email' : 'text';
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(field, value.trim());  // Pass BOTH field and value
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSubmit(e);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
          {getTitle()}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 text-center">
          Help us personalize your experience
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type={getInputType()}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-base"
            autoFocus
          />
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium"
            >
              Skip
            </button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 Optional - You can skip and still explore the demo
        </p>
      </div>
    </div>
  );
};

export default UserDataForm;

