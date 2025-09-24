import React, { useState, useEffect } from 'react';
import { authenticatedFetch, getNodeApiUrl } from '../utils/api';

const PublicQAAnalytics = ({ qudemoId, companyId }) => {
  const [interactions, setInteractions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('interactions');

  useEffect(() => {
    fetchData();
  }, [qudemoId, companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch interactions and stats in parallel
      const [interactionsResponse, statsResponse] = await Promise.all([
        authenticatedFetch(getNodeApiUrl(`/api/qudemos/public-qa/${qudemoId}?limit=100`)),
        authenticatedFetch(getNodeApiUrl(`/api/qudemos/public-qa-stats/${companyId}`))
      ]);

      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json();
        setInteractions(interactionsData.data || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

    } catch (err) {
      console.error('Error fetching public Q&A data:', err);
      setError('Failed to load public Q&A analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfidence = (score) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading public Q&A analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Public Q&A Analytics</h3>
        <p className="text-sm text-gray-500">Questions and answers from public QuDemo interactions</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('interactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Interactions ({interactions.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'interactions' && (
          <div className="space-y-4">
            {interactions.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No public interactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Questions from public users will appear here.</p>
              </div>
            ) : (
              interactions.map((interaction) => (
                <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Q: {interaction.question}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        A: {interaction.answer}
                      </p>
                    </div>
                    <div className="ml-4 text-right text-xs text-gray-500">
                      <div>{formatDate(interaction.created_at)}</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatConfidence(interaction.confidence_score)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Source: {interaction.answer_source}</span>
                    <span>Method: {interaction.search_method}</span>
                    {interaction.formatted_timestamp && (
                      <span>Time: {interaction.formatted_timestamp}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total_interactions}</div>
              <div className="text-sm text-blue-800">Total Interactions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.unique_qudemos}</div>
              <div className="text-sm text-green-800">Unique QuDemos</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {formatConfidence(stats.avg_confidence)}
              </div>
              <div className="text-sm text-yellow-800">Avg Confidence</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formatConfidence(stats.avg_search_score)}
              </div>
              <div className="text-sm text-purple-800">Avg Search Score</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicQAAnalytics;
