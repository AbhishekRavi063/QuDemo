import React from 'react';
import KnowledgeDataPreview from './KnowledgeDataPreview';

const KnowledgePreviewDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Knowledge Data Preview Demo
          </h1>
          <p className="text-gray-600">
            This demonstrates how extracted knowledge data is displayed in a well-structured way.
            The data shows FAQ content extracted from Puzzle's website with AI enhancement.
          </p>
        </div>
        
        <KnowledgeDataPreview companyName="Puzzle" />
      </div>
    </div>
  );
};

export default KnowledgePreviewDemo;
