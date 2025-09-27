import React, { useState, useEffect } from 'react';
import { getNodeApiUrl, authenticatedFetch } from '../utils/api';

const AuthenticatedQAAnalytics = ({ companyId }) => {
  const [stats, setStats] = useState(null);
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyId) {
      fetchAnalytics();
    }
  }, [companyId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsResponse = await authenticatedFetch(
        getNodeApiUrl(`/api/qa/authenticated-stats/${companyId}`)
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch recent interactions (last 10)
      const interactionsResponse = await authenticatedFetch(
        getNodeApiUrl(`/api/qa/authenticated/${localStorage.getItem('userId')}?limit=10`)
      );

      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json();
        setRecentInteractions(interactionsData.data);
      }

    } catch (err) {
      console.error('Error fetching authenticated Q&A analytics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Q&A Analytics</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Q&A Analytics</h3>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Q&A Analytics</h3>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.averageConfidenceScore}%</div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{recentInteractions.length}</div>
            <div className="text-sm text-gray-600">Recent Interactions</div>
          </div>
        </div>
      )}

      {/* Recent Interactions */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3">Recent Q&A Interactions</h4>
        {recentInteractions.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentInteractions.map((interaction) => (
              <div key={interaction.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900 flex-1">
                    Q: {interaction.question}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(interaction.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  A: {interaction.answer.length > 100 
                    ? `${interaction.answer.substring(0, 100)}...` 
                    : interaction.answer}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Confidence: {interaction.confidence_score}%</span>
                  {interaction.video_url && (
                    <span className="text-blue-600">📹 Has Video</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No Q&A interactions yet</div>
        )}
      </div>

      {/* Most Common Questions */}
      {stats && stats.mostCommonQuestions && stats.mostCommonQuestions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Most Common Questions</h4>
          <div className="space-y-2">
            {stats.mostCommonQuestions.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 flex-1">{item.question}</span>
                <span className="text-gray-500 ml-2">({item.count} times)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedQAAnalytics;
