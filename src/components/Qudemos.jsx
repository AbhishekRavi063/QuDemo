import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { getNodeApiUrl } from '../config/api';
import ReactPlayer from "react-player";
import HybridVideoPlayer from "./HybridVideoPlayer";
import QudemoPreview from "./QudemoPreview";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  PlayIcon,
  ClockIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Qudemos = () => {
  const [qudemos, setQudemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewingQudemo, setPreviewingQudemo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const { company } = useCompany();
  const navigate = useNavigate();

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const fetchQudemos = async () => {
    if (!company?.id) {
      setLoading(false);
      setError('No company found. Please create a company first.');
      setQudemos([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos?companyId=${company.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Qudemos fetched successfully:', data.data);
        setQudemos(data.data || []);
      } else {
        console.error('❌ Failed to fetch qudemos:', data.error);
        setError(data.error || 'Failed to fetch qudemos');
        setQudemos([]);
      }
    } catch (err) {
      console.error('❌ Error fetching qudemos:', err);
      setError('Network error. Please try again.');
      setQudemos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQudemos();
  }, [company]);

  // Refresh data when component comes into focus (e.g., when navigating back)
  useEffect(() => {
    const handleFocus = () => {
      fetchQudemos();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [company]);

  const handleDropdownAction = async (action, qudemo) => {
    setDropdownOpen(null);

    switch (action) {
      case 'preview':
        setPreviewingQudemo(qudemo);
        break;
      case 'edit':
        navigate(`/edit-qudemo/${qudemo.id}`);
        break;
      case 'duplicate':
        await duplicateQudemo(qudemo);
        break;
      case 'delete':
        const confirmDelete = window.confirm(
          `Are you sure you want to delete "${qudemo.title}"?\n\nThis action will permanently delete:\n• The qudemo and all its videos\n• All knowledge sources\n• All analytics data\n\nThis action cannot be undone.`
        );
        if (confirmDelete) {
          await deleteQudemo(qudemo.id);
        }
        break;
      case 'share':
        // TODO: Implement share functionality
        alert('Share functionality coming soon!');
        break;
      default:
        break;
    }
  };

  const duplicateQudemo = async (qudemo) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${qudemo.id}/duplicate`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Qudemo duplicated successfully!');
        fetchQudemos(); // Refresh the list
      } else {
        alert('Failed to duplicate qudemo: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error duplicating qudemo:', error);
      alert('Failed to duplicate qudemo');
    }
  };

  const deleteQudemo = async (qudemoId) => {
    try {
      // Show loading state
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${qudemoId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove the qudemo from the local state immediately for better UX
        setQudemos(prevQudemos => prevQudemos.filter(q => q.id !== qudemoId));
        
        // Close preview modal if the deleted qudemo is being previewed
        if (previewingQudemo && previewingQudemo.id === qudemoId) {
          setPreviewingQudemo(null);
        }
        
        // Show success message
        console.log('✅ Qudemo deleted successfully');
        
        // Optional: Show a toast notification instead of alert
        // For now, we'll use a more user-friendly approach
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = 'Qudemo deleted successfully!';
        document.body.appendChild(successMessage);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          if (successMessage.parentNode) {
            successMessage.parentNode.removeChild(successMessage);
          }
        }, 3000);
        
      } else {
        console.error('❌ Failed to delete qudemo:', data.error);
        alert('Failed to delete qudemo: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error deleting qudemo:', error);
      alert('Failed to delete qudemo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    // Check if it's a "no company" error
    const isNoCompanyError = error.includes('No company found') || error.includes('create a company first');
    
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isNoCompanyError ? 'No Company Found' : 'Error Loading Qudemos'}
        </h3>
        <p className="text-gray-600 mb-6">
          {isNoCompanyError 
            ? 'You need to create a company first before you can create qudemos.'
            : error
          }
        </p>
        {isNoCompanyError ? (
          <button
            onClick={() => navigate('/company-management')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Company
          </button>
        ) : (
          <button
            onClick={fetchQudemos}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Qudemos</h1>
          <p className="text-gray-600">Manage and preview your interactive demos</p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Qudemo</span>
        </button>
      </div>

      {/* Qudemos Grid */}
      {qudemos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlayIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No qudemos created yet</h3>
          <p className="text-gray-600 mb-6">Click 'Create Qudemo' to get started!</p>
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Qudemo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qudemos.map((qudemo) => (
            <div
              key={qudemo.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer"
              onClick={() => handleDropdownAction('preview', qudemo)}
            >
              {/* Video Thumbnail */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {qudemo.videos && qudemo.videos.length > 0 ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Show thumbnail image instead of video player for cards */}
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        {qudemo.videos[0].thumbnail_url ? (
                          <img 
                            src={qudemo.videos[0].thumbnail_url} 
                            alt={qudemo.title}
                            className="w-full h-full object-cover"
                            style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                          />
                        ) : (
                          <div className="text-center">
                            <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Video Preview</p>
                          </div>
                        )}
                      </div>
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <PlayIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No video</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">
                    {qudemo.title}
                  </h3>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === qudemo.id ? null : qudemo.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {dropdownOpen === qudemo.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('preview', qudemo);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Preview Qudemo</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('edit', qudemo);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('duplicate', qudemo);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('share', qudemo);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <ShareIcon className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('delete', qudemo);
                          }}
                          disabled={loading}
                          className={`w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center space-x-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                          <span>{loading ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {qudemo.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <VideoCameraIcon className="w-4 h-4" />
                      <span>{qudemo.video_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{qudemo.knowledge_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{getRelativeTime(qudemo.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Qudemo Preview Modal */}
      {previewingQudemo && (
        <QudemoPreview 
          qudemo={previewingQudemo} 
          onClose={() => setPreviewingQudemo(null)} 
        />
      )}
    </div>
  );
};

export default Qudemos;
