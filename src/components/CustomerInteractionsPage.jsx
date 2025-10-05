import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import { getNodeApiUrl } from '../config/api';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const CustomerInteractionsPage = () => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { company } = useCompany();
  const { showError } = useNotification();

  // Fetch customer interactions data
  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(getNodeApiUrl('/api/analytics/customer-interactions'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interactions');
      }

      const data = await response.json();
      setInteractions(data.data || []);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      setError('Failed to load customer interactions');
      showError('Failed to load customer interactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchInteractions();
    }
  }, [company?.id]);

  // Filter interactions based on search term
  const filteredInteractions = interactions.filter(interaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      interaction.client_name?.toLowerCase().includes(searchLower) ||
      interaction.client_email?.toLowerCase().includes(searchLower) ||
      interaction.client_company?.toLowerCase().includes(searchLower) ||
      interaction.qudemo_title?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredInteractions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInteractions = filteredInteractions.slice(startIndex, endIndex);

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    
    // Fix floating point precision issues by rounding to 2 decimal places
    const roundedSeconds = Math.round(seconds * 100) / 100;
    
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = Math.floor(roundedSeconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle view details
  const handleViewDetails = (interaction) => {
    setSelectedInteraction(interaction);
    setActiveTab('overview'); // Reset to overview tab when opening modal
    setShowDetailsModal(true);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchInteractions}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Interactions</h1>
        
        {/* Pagination Control */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, company or demo watched..."
          value={searchTerm}
          onChange={handleSearch}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Interactions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demo Watched
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mx-auto" />
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <ClockIcon className="h-4 w-4 mx-auto" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInteractions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No interactions found matching your search.' : 'No interactions found.'}
                  </td>
                </tr>
              ) : (
                paginatedInteractions.map((interaction, index) => (
                  <tr key={interaction.share_id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {interaction.client_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {interaction.client_company || 'Unknown Company'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {interaction.qudemo_title || 'Unknown Demo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {interaction.question_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {formatDuration(interaction.total_duration)}
                      </div>
                    </td>
                    <td className="pl-6 pr-1 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(interaction)}
                        className="px-3 py-1 bg-white border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-600 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredInteractions.length)}</span> of{' '}
                <span className="font-medium">{filteredInteractions.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInteraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-0">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {selectedInteraction.client_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    
                    {/* Customer Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedInteraction.client_name || 'Unknown Customer'} - Customer Interaction Details
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{selectedInteraction.client_email || 'No email'}</span>
                        <span>•</span>
                        <span>{selectedInteraction.client_company || 'No company'}</span>
                        <span>•</span>
                        <span>
                          {selectedInteraction.last_accessed_at 
                            ? new Date(selectedInteraction.last_accessed_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })
                            : 'Never accessed'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button 
                    onClick={() => handleTabClick('overview')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => handleTabClick('questions')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'questions'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Questions
                  </button>
                  <button 
                    onClick={() => handleTabClick('past-interactions')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === 'past-interactions'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Past Interactions
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {activeTab === 'overview' && (
                  <>
                    {/* AI Insight Summary */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium text-blue-900">AI Insight Summary</span>
                      </div>
                      <p className="text-blue-800">
                        {selectedInteraction.questions && selectedInteraction.questions.length > 0
                          ? `The prospect has shown interest in ${selectedInteraction.qudemo_title} with ${selectedInteraction.question_count} questions. They spent ${formatDuration(selectedInteraction.total_duration)} engaging with the demo, indicating active interest in your product.`
                          : `The prospect accessed ${selectedInteraction.qudemo_title} but hasn't asked any questions yet. They spent ${formatDuration(selectedInteraction.total_duration)} viewing the demo.`
                        }
                      </p>
                    </div>

                    {/* Interaction Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Demo Watched */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Demo Watched</p>
                            <p className="text-lg font-semibold text-gray-900">{selectedInteraction.qudemo_title || 'Unknown Demo'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Time Spent */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Time Spent</p>
                            <p className="text-lg font-semibold text-gray-900">{formatDuration(selectedInteraction.total_duration)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Questions Asked */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Questions Asked</p>
                            <p className="text-lg font-semibold text-gray-900">{selectedInteraction.question_count || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unique Link Details */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="font-medium text-blue-900">Unique Link Details</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Unique Customer Link
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-800 font-medium">URL:</span>
                          <code className="flex-1 bg-white border border-blue-200 rounded px-2 py-1 text-sm text-blue-900">
                            {window.location.origin}/share/{selectedInteraction.share_token}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/share/${selectedInteraction.share_token}`);
                              // You could add a toast notification here
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Copy
                          </button>
                        </div>
                        
                        <div>
                          <span className="text-sm text-blue-800">
                            <span className="font-medium">Generated on:</span> {
                              selectedInteraction.last_accessed_at 
                                ? new Date(selectedInteraction.last_accessed_at).toLocaleDateString('en-US', {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'questions' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Questions & Responses</h4>
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {selectedInteraction.questions && selectedInteraction.questions.length > 0 ? (
                        selectedInteraction.questions.map((qa, index) => (
                          <div key={index} className="space-y-3">
                            {/* Question */}
                            <div className="flex items-start space-x-3 bg-gray-100 rounded-lg p-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {selectedInteraction.client_name ? selectedInteraction.client_name.charAt(0).toUpperCase() : 'C'}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{qa.question}</p>
                                <p className="text-xs text-gray-500 mt-1">Asked during session</p>
                              </div>
                            </div>
                            
                            {/* Answer */}
                            <div className="flex items-start space-x-3 bg-white rounded-lg p-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                                  AI
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{qa.answer}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No questions asked</h3>
                          <p className="mt-1 text-sm text-gray-500">This customer hasn't asked any questions yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'past-interactions' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Past Interactions History</h4>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Demo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Questions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time Spent
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedInteraction.questions && selectedInteraction.questions.length > 0 ? (
                            (() => {
                              // Group questions into sessions (same logic as backend)
                              const questions = selectedInteraction.questions || [];
                              if (questions.length === 0) return null;

                              const SESSION_GAP_HOURS = 2;
                              const SESSION_GAP_MS = SESSION_GAP_HOURS * 60 * 60 * 1000;
                              
                              const sessions = [];
                              let currentSession = {
                                questions: [questions[0]],
                                startTime: questions[0].created_at,
                                endTime: questions[0].created_at
                              };

                              for (let i = 1; i < questions.length; i++) {
                                const timeDiff = new Date(questions[i].created_at) - new Date(questions[i-1].created_at);
                                
                                if (timeDiff > SESSION_GAP_MS) {
                                  sessions.push(currentSession);
                                  currentSession = {
                                    questions: [questions[i]],
                                    startTime: questions[i].created_at,
                                    endTime: questions[i].created_at
                                  };
                                } else {
                                  currentSession.questions.push(questions[i]);
                                  currentSession.endTime = questions[i].created_at;
                                }
                              }
                              sessions.push(currentSession);

                              // Display each session as a row
                              return sessions.map((session, sessionIndex) => {
                                const sessionDate = new Date(session.startTime);
                                const now = new Date();
                                const diffTime = Math.abs(now - sessionDate);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                let dateDisplay;
                                if (diffDays === 1) {
                                  dateDisplay = "Today";
                                } else if (diffDays === 2) {
                                  dateDisplay = "Yesterday";
                                } else if (diffDays <= 7) {
                                  dateDisplay = `${diffDays - 1} days ago`;
                                } else {
                                  dateDisplay = sessionDate.toLocaleDateString();
                                }

                                // Calculate session duration
                                const sessionDuration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
                                const questionTime = session.questions.length * 45;
                                const demoTime = sessionIndex === 0 ? Math.min(sessionDuration * 0.3, 300) : 0;
                                const totalSessionTime = Math.max(sessionDuration + questionTime + demoTime, session.questions.length * 30);

                                return (
                                  <tr key={sessionIndex} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {dateDisplay}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {selectedInteraction.qudemo_title || 'Product Demo'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {session.questions.length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {formatDuration(Math.min(totalSessionTime, 1800))}
                                    </td>
                                  </tr>
                                );
                              });
                            })()
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                No past interactions found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInteractionsPage;
