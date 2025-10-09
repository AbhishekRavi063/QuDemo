import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { EyeIcon, ChatBubbleLeftRightIcon, ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';

const OverviewPage = () => {
  const { company } = useCompany();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalViews: 0,
    questionsAsked: 0,
    avgEngagement: 0
  });

  const [recentInteractions, setRecentInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch overview stats from the backend
        const response = await fetch(`${process.env.REACT_APP_NODE_API_URL || 'http://localhost:5000'}/api/analytics/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Failed to fetch overview stats');
        }

        // Fetch recent interactions
        const interactionsResponse = await fetch(`${process.env.REACT_APP_NODE_API_URL || 'http://localhost:5000'}/api/analytics/recent-interactions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (interactionsResponse.ok) {
          const interactionsData = await interactionsResponse.json();
          console.log('Recent interactions data:', interactionsData);
          console.log('Interactions length:', interactionsData?.length);
          setRecentInteractions(interactionsData.slice(0, 4)); // Show only latest 4
        } else {
          console.error('Failed to fetch recent interactions:', interactionsResponse.status, interactionsResponse.statusText);
          const errorText = await interactionsResponse.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching overview stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCreateQudemo = () => {
    // Navigate to create qudemo page
    navigate('/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pt-6 pl-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Overview</h1>
          <p className="text-lg text-gray-600 mt-2 text-left">
            Welcome back! Here's what's happening with your demos.
          </p>
        </div>
        
        <button
          onClick={handleCreateQudemo}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl mr-6"
        >
           <PlusIcon className="w-5 h-5" />
          Create Qudemo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
        {/* Total Demo Views */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex items-center justify-between h-full">
             <div className="flex-1 text-left">
               <h3 className="text-base font-bold text-gray-600 mb-1 text-left">Total Demo Views</h3>
               <p className="text-4xl font-bold text-gray-900 text-left">{stats.totalViews.toLocaleString()}</p>
             </div>
            <div className="p-2 bg-blue-100 rounded-lg ml-4">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Questions Asked */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex items-center justify-between h-full">
             <div className="flex-1 text-left">
               <h3 className="text-base font-bold text-gray-600 mb-1 text-left">Questions Asked</h3>
               <p className="text-4xl font-bold text-gray-900 text-left">{stats.questionsAsked.toLocaleString()}</p>
             </div>
            <div className="p-2 bg-blue-100 rounded-lg ml-4">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Avg. Engagement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 min-h-[140px]">
          <div className="flex items-center justify-between h-full">
             <div className="flex-1 text-left">
               <h3 className="text-base font-bold text-gray-600 mb-1 text-left">Avg. Engagement</h3>
               <p className="text-4xl font-bold text-gray-900 text-left">{stats.avgEngagement}%</p>
             </div>
            <div className="p-2 bg-blue-100 rounded-lg ml-4">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interactions Section */}
      <div className="max-w-5xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 text-left">Recent Interactions</h2>
          <button
            onClick={() => navigate('/customer-interactions')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            View in Detail
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {recentInteractions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentInteractions.map((interaction, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {interaction.client_name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {interaction.client_company || 'No company'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 font-medium">
                        {interaction.questionCount || 0} questions
                      </p>
                      <p className="text-xs text-gray-500">
                        {interaction.lastInteractionDate ? 
                          new Date(interaction.lastInteractionDate).toLocaleDateString() : 
                          'No date'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No recent interactions found</p>
              <p className="text-gray-400 text-xs mt-1">Start sharing your QuDemos to see interactions here</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OverviewPage;
