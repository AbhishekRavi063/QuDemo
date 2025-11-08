import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, UserIcon, EnvelopeIcon, BuildingOfficeIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getNodeApiUrl } from '../config/api';

const ViewInteractions = () => {
  const { qudemoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState(null);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [expandedSessions, setExpandedSessions] = useState(new Set());

  useEffect(() => {
    fetchInteractions();
  }, [qudemoId]);

  useEffect(() => {
    if (interactions && interactions.sessions) {
      filterSessions();
    }
  }, [interactions, searchTerm, dateFilter]);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        getNodeApiUrl(`/api/qudemos/visitor-interactions/${qudemoId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch interactions');
      }

      const data = await response.json();
      console.log('📊 Interactions data:', data);

      if (data.success) {
        setInteractions(data.data);
        setFilteredSessions(data.data.sessions || []);
      } else {
        console.error('❌ Failed to load interactions:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    if (!interactions || !interactions.sessions) return;

    let filtered = interactions.sessions;

    // Filter by search term (name, email, or company)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(session => 
        (session.visitor_name && session.visitor_name.toLowerCase().includes(search)) ||
        (session.visitor_email && session.visitor_email.toLowerCase().includes(search)) ||
        (session.visitor_company && session.visitor_company.toLowerCase().includes(search))
      );
    }

    // Filter by date range
    if (dateFilter.from) {
      const fromDate = new Date(dateFilter.from);
      filtered = filtered.filter(session => 
        new Date(session.first_interaction) >= fromDate
      );
    }

    if (dateFilter.to) {
      const toDate = new Date(dateFilter.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(session => 
        new Date(session.first_interaction) <= toDate
      );
    }

    setFilteredSessions(filtered);
  };

  const toggleSession = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const exportToCSV = () => {
    if (!filteredSessions || filteredSessions.length === 0) return;

    // Create CSV content
    const headers = ['Date', 'Name', 'Email', 'Company', 'Question', 'Answer'];
    const rows = [];

    filteredSessions.forEach(session => {
      session.interactions.forEach((interaction, index) => {
        rows.push([
          new Date(interaction.created_at).toLocaleString(),
          index === 0 ? (session.visitor_name || 'Anonymous') : '',
          index === 0 ? (session.visitor_email || 'N/A') : '',
          index === 0 ? (session.visitor_company || 'N/A') : '',
          interaction.question,
          interaction.answer
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitor-interactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/qudemos')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to QuDemos</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Visitor Interactions
                </h1>
                {interactions && (
                  <p className="text-sm text-gray-600">
                    {interactions.qudemo_title}
                  </p>
                )}
              </div>
            </div>

            {/* Export Button */}
            {filteredSessions.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {interactions && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{interactions.total_sessions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{interactions.total_interactions}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Questions/Session</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {interactions.total_sessions > 0 ? 
                      (interactions.total_interactions / interactions.total_sessions).toFixed(1) : 
                      '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date filters */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="From"
              />
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="To"
              />
            </div>

            {/* Clear filters */}
            {(searchTerm || dateFilter.from || dateFilter.to) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter({ from: '', to: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interactions Yet</h3>
            <p className="text-gray-600">
              {searchTerm || dateFilter.from || dateFilter.to
                ? 'No interactions match your filters.'
                : 'Visitor interactions will appear here once people start using your QuDemo widget.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.session_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Session Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSession(session.session_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {session.visitor_name
                              ? session.visitor_name.charAt(0).toUpperCase()
                              : '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {session.visitor_name || 'Anonymous Visitor'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {session.visitor_email && (
                              <span className="flex items-center space-x-1">
                                <EnvelopeIcon className="w-4 h-4" />
                                <span>{session.visitor_email}</span>
                              </span>
                            )}
                            {session.visitor_company && (
                              <span className="flex items-center space-x-1">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>{session.visitor_company}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatTimestamp(session.first_interaction)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>{session.interactions.length} question{session.interactions.length !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          expandedSessions.has(session.session_id) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Session Details (Expanded) */}
                {expandedSessions.has(session.session_id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Conversation History</h4>
                    <div className="space-y-3">
                      {session.interactions.map((interaction, index) => (
                        <div key={interaction.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start space-x-2 mb-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Q{index + 1}
                            </span>
                            <p className="text-sm font-medium text-gray-900 flex-1">
                              {interaction.question}
                            </p>
                          </div>
                          <div className="pl-8">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {interaction.answer}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(interaction.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInteractions;

