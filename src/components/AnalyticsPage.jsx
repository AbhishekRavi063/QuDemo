import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ShareIcon,
  QuestionMarkCircleIcon,
  EyeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQudemos, setExpandedQudemos] = useState(new Set());
  const [expandedShares, setExpandedShares] = useState(new Set());

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const baseUrl = getApiUrl('node');
      const response = await fetch(`${baseUrl}/api/analytics/qudemos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const toggleQudemoExpansion = (qudemoId) => {
    const newExpanded = new Set(expandedQudemos);
    if (newExpanded.has(qudemoId)) {
      newExpanded.delete(qudemoId);
    } else {
      newExpanded.add(qudemoId);
    }
    setExpandedQudemos(newExpanded);
  };

  const toggleShareExpansion = (shareId) => {
    const newExpanded = new Set(expandedShares);
    if (newExpanded.has(shareId)) {
      newExpanded.delete(shareId);
    } else {
      newExpanded.add(shareId);
    }
    setExpandedShares(newExpanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">Track your QuDemo performance, share links, and user interactions</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total QuDemos</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_qudemos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShareIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Share Links</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_share_links}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Q&A Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_qa_entries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <XCircleIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Irrelevant Answers</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_irrelevant_answers || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_access_count}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QuDemos List */}
        <div className="space-y-6">
          {analyticsData.map((item) => (
            <div key={item.qudemo.id} className="bg-white rounded-lg shadow">
              {/* QuDemo Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleQudemoExpansion(item.qudemo.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {expandedQudemos.has(item.qudemo.id) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-3" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.qudemo.title}</h3>
                      <p className="text-sm text-gray-600">{item.qudemo.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ShareIcon className="h-4 w-4 mr-1" />
                      {item.total_shares} links
                    </div>
                    <div className="flex items-center">
                      <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                      {item.total_qa_entries} Q&As
                    </div>
                    {item.total_irrelevant_answers > 0 && (
                      <div className="flex items-center text-red-600">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        {item.total_irrelevant_answers} irrelevant
                      </div>
                    )}
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {item.total_access_count} views
                    </div>
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {formatDate(item.qudemo.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedQudemos.has(item.qudemo.id) && (
                <div className="border-t border-gray-200 p-6">
                  {/* QuDemo Description */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{item.qudemo.description || 'No description provided'}</p>
                  </div>

                  {/* Share Links Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <ShareIcon className="h-4 w-4 mr-2" />
                      Share Links ({item.total_shares})
                    </h4>
                    
                    {item.share_links.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No share links created yet</p>
                    ) : (
                      <div className="space-y-3">
                        {item.share_links.map((share) => (
                          <div key={share.id} className="border border-gray-200 rounded-lg p-4">
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleShareExpansion(share.id)}
                            >
                              <div className="flex items-center">
                                {expandedShares.has(share.id) ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-400 mr-2" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {share.share_token.substring(0, 8)}...
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Created: {formatDate(share.created_at)} | 
                                    Views: {share.access_count} | 
                                    Last accessed: {formatDate(share.last_accessed_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(share.share_url);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Copy Link
                                </button>
                                <a
                                  href={share.share_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </a>
                              </div>
                            </div>

                            {/* Expanded Share Link Details */}
                            {expandedShares.has(share.id) && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium text-gray-700">Share URL:</p>
                                    <p className="text-gray-600 break-all">{share.share_url}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-700">Expires:</p>
                                    <p className="text-gray-600">{formatDate(share.expires_at)}</p>
                                  </div>
                                </div>

                                {/* Q&A Data for this specific share */}
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
                                    Q&A for this Share Link
                                  </h5>
                                  
                                  {item.qa_data.filter(qa => qa.share_token === share.share_token).length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No Q&A data for this share link</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {item.qa_data
                                        .filter(qa => qa.share_token === share.share_token)
                                        .map((qa) => (
                                          <div key={qa.id} className={`rounded-lg p-3 ${
                                            qa.is_irrelevant 
                                              ? 'bg-red-50 border border-red-200' 
                                              : 'bg-gray-50'
                                          }`}>
                                            {/* Irrelevant Answer Indicator */}
                                            {qa.is_irrelevant && (
                                              <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded-md">
                                                <div className="flex items-center">
                                                  <svg className="h-4 w-4 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                  </svg>
                                                  <span className="text-xs font-medium text-red-800">
                                                    Irrelevant Answer
                                                    {qa.irrelevant_reason && `: ${qa.irrelevant_reason}`}
                                                  </span>
                                                </div>
                                              </div>
                                            )}

                                            <div className="mb-2">
                                              <p className="text-sm font-medium text-gray-700">Q:</p>
                                              <p className={`text-sm ${qa.is_irrelevant ? 'text-red-600' : 'text-gray-600'}`}>
                                                {qa.question}
                                              </p>
                                            </div>
                                            <div className="mb-2">
                                              <p className="text-sm font-medium text-gray-700">A:</p>
                                              <p className={`text-sm ${qa.is_irrelevant ? 'text-red-600' : 'text-gray-600'}`}>
                                                {qa.answer}
                                              </p>
                                            </div>
                                            
                                            {/* Additional Q&A Details */}
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                                              {qa.confidence_score && (
                                                <span>Confidence: {(qa.confidence_score * 100).toFixed(1)}%</span>
                                              )}
                                              {qa.difficulty_level && qa.difficulty_level !== 'unknown' && (
                                                <span>Difficulty: {qa.difficulty_level}</span>
                                              )}
                                              {qa.answer_source && (
                                                <span>Source: {qa.answer_source.replace('_', ' ')}</span>
                                              )}
                                            </div>

                                            {qa.video_url && (
                                              <div className="mb-2">
                                                <a 
                                                  href={qa.video_url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                                >
                                                  Watch Video
                                                  {qa.formatted_timestamp && ` (${qa.formatted_timestamp})`}
                                                </a>
                                              </div>
                                            )}

                                            <p className="text-xs text-gray-500">
                                              {formatDate(qa.created_at)}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* All Q&A Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                      All Q&A Data ({item.total_qa_entries})
                    </h4>
                    
                    {item.qa_data.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No Q&A data available</p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {item.qa_data.map((qa) => (
                          <div key={qa.id} className={`border rounded-lg p-4 ${
                            qa.is_irrelevant 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-gray-200 bg-white'
                          }`}>
                            {/* Irrelevant Answer Indicator */}
                            {qa.is_irrelevant && (
                              <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded-md">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                      Irrelevant Answer Detected
                                    </h3>
                                    {qa.irrelevant_reason && (
                                      <div className="mt-1 text-sm text-red-700">
                                        Reason: {qa.irrelevant_reason}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">Question:</p>
                              <p className={`text-sm ${qa.is_irrelevant ? 'text-red-600' : 'text-gray-600'}`}>
                                {qa.question}
                              </p>
                            </div>
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">Answer:</p>
                              <p className={`text-sm ${qa.is_irrelevant ? 'text-red-600' : 'text-gray-600'}`}>
                                {qa.answer}
                              </p>
                            </div>
                            
                            {/* Additional Q&A Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 mb-3">
                              {qa.confidence_score && (
                                <div>
                                  <span className="font-medium">Confidence:</span>
                                  <span className="ml-1">{(qa.confidence_score * 100).toFixed(1)}%</span>
                                </div>
                              )}
                              {qa.search_score && (
                                <div>
                                  <span className="font-medium">Search Score:</span>
                                  <span className="ml-1">{(qa.search_score * 100).toFixed(1)}%</span>
                                </div>
                              )}
                              {qa.difficulty_level && qa.difficulty_level !== 'unknown' && (
                                <div>
                                  <span className="font-medium">Difficulty:</span>
                                  <span className="ml-1 capitalize">{qa.difficulty_level}</span>
                                </div>
                              )}
                              {qa.estimated_time && qa.estimated_time !== 'unknown' && (
                                <div>
                                  <span className="font-medium">Time:</span>
                                  <span className="ml-1">{qa.estimated_time}</span>
                                </div>
                              )}
                            </div>

                            {/* Video Information */}
                            {qa.video_url && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-gray-700">Video Reference:</p>
                                <div className="flex items-center space-x-2">
                                  <a 
                                    href={qa.video_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    Watch Video
                                  </a>
                                  {qa.formatted_timestamp && (
                                    <span className="text-xs text-gray-500">
                                      ({qa.formatted_timestamp})
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Answer Source */}
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-700">Answer Source:</p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600 capitalize">
                                  {qa.answer_source?.replace('_', ' ')}
                                </span>
                                {qa.search_method && qa.search_method !== 'standard' && (
                                  <span className="text-xs text-gray-500">
                                    ({qa.search_method})
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                              <span>Share Token: {qa.share_token?.substring(0, 8)}...</span>
                              <span>{formatDate(qa.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {analyticsData.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No QuDemos found</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first QuDemo to see analytics here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
