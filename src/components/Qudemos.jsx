import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import { getNodeApiUrl } from '../config/api';
import ReactPlayer from "react-player";
import HybridVideoPlayer from "./HybridVideoPlayer";
import QudemoPreview from "./QudemoPreview";
import UpgradeModal from "./UpgradeModal";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  PlayIcon,
  ClockIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Qudemos = () => {
  const [qudemos, setQudemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { company } = useCompany();
  
  // Check subscription status
  const subscriptionPlan = company?.subscription_plan || 'free';
  const subscriptionStatus = company?.subscription_status || 'active';
  const isActive = ['active', 'trialing'].includes(subscriptionStatus);
  const isPro = ['pro', 'enterprise'].includes(subscriptionPlan) && isActive;
  const isEnterprise = subscriptionPlan === 'enterprise' && isActive;
  const [previewingQudemo, setPreviewingQudemo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [deletingQudemoId, setDeletingQudemoId] = useState(null);
  const [sharingQudemo, setSharingQudemo] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [qudemoToDelete, setQudemoToDelete] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useNotification();

  // Share functionality
  const handleShareQudemo = async (qudemo) => {
    
    // Prevent multiple simultaneous requests for the same qudemo
    if (sharingQudemo && sharingQudemo.id === qudemo.id) {
      return;
    }
    
    setSharingQudemo(qudemo);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${qudemo.id}/share`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShareLink(data.shareUrl);
        setShowShareModal(true);
        
        // Show different message based on whether it's a new or existing link
        if (data.isNewLink) {
          showSuccess('Share link generated successfully!');
        } else {
          showSuccess('Share link retrieved successfully!');
        }
      } else {
        const errorData = await response.json();
        
        // Check if it's a subscription error
        if (errorData.requiresUpgrade) {
          if (errorData.isCancelled) {
            // Show popup modal for cancelled subscriptions
            setShowUpgradeModal(true);
            // Store error details for the modal
            setErrorDetails({
              title: errorData.error,
              message: errorData.message,
              currentPlan: errorData.currentPlan,
              isCancelled: true
            });
          } else if (errorData.currentPlan === 'free') {
            showError('Share functionality requires Pro or Enterprise plan. Please upgrade to continue.');
            // Optionally redirect to pricing page
            setTimeout(() => {
              window.location.href = '/pricing';
            }, 2000);
          } else {
            // Show popup modal for other upgrade scenarios
            setShowUpgradeModal(true);
            setErrorDetails({
              title: errorData.error,
              message: errorData.message,
              currentPlan: errorData.currentPlan,
              isCancelled: false
            });
          }
        } else {
          console.error('❌ Failed to generate share link:', errorData.error);
          showError('Failed to generate share link. Please try again.');
        }
      }
    } catch (err) {
      console.error('❌ Error generating share link:', err);
      showError('Network error. Please try again.');
    } finally {
      setSharingQudemo(null);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      showSuccess('Share link copied to clipboard!');
    } catch (err) {
      console.error('❌ Failed to copy to clipboard:', err);
      showError('Failed to copy link. Please copy manually.');
    }
  };

  const handleConfirmDelete = async () => {
    if (qudemoToDelete) {
      setDeletingQudemoId(qudemoToDelete.id);
      setShowDeleteModal(false);
      await deleteQudemo(qudemoToDelete.id);
      setDeletingQudemoId(null);
      setQudemoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setQudemoToDelete(null);
  };

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
  // Removed aggressive refresh to prevent UI refresh issues
  // useEffect(() => {
  //   const handleFocus = () => {
  //     fetchQudemos();
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [company]);

  const handleDropdownAction = async (action, qudemo) => {
    setDropdownOpen(null);

    switch (action) {
      case 'preview':
        setPreviewingQudemo(qudemo);
        break;
      case 'edit':
        navigate(`/view-qudemo/${qudemo.id}`);
        break;
      case 'delete':
        setQudemoToDelete(qudemo);
        setShowDeleteModal(true);
        break;
      case 'share':
        handleShareQudemo(qudemo);
        break;
      default:
        break;
    }
  };

  const deleteQudemo = async (qudemoId) => {
    try {
      // Don't set global loading, just track the specific qudemo being deleted
      
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
        
        // Clean up localStorage data for the deleted qudemo
        const chatKey = `qudemo_chat_${qudemoId}`;
        localStorage.removeItem(chatKey);
        
        // Show success message
        
        // Show success notification
        showSuccess('Qudemo deleted successfully!');
        
      } else {
        console.error('❌ Failed to delete qudemo:', data.error);
        showError('Failed to delete qudemo: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error deleting qudemo:', error);
      showError('Failed to delete qudemo. Please try again.');
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
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchQudemos}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh qudemos"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Qudemo</span>
          </button>
        </div>
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
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 ${
                deletingQudemoId === qudemo.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {/* Video Thumbnail */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {/* Delete Loading Overlay */}
                {deletingQudemoId === qudemo.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-t-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Deleting...</p>
                    </div>
                  </div>
                )}
                {qudemo.videos && qudemo.videos.length > 0 ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="relative w-full h-full group">
                      {/* Video Player Preview */}
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full">
                          {(() => {
                            const videoUrl = qudemo.videos[0].video_url;
                            const isLoomVideo = videoUrl && videoUrl.includes('loom.com');
                            const isYouTubeVideo = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
                            const isVimeoVideo = videoUrl && videoUrl.includes('vimeo.com');
                            
                            // For Loom videos, use custom iframe since ReactPlayer doesn't support them well
                            if (isLoomVideo) {
                              const loomVideoId = videoUrl.split('loom.com/share/')[1]?.split('?')[0];
                              const loomEmbedUrl = `https://www.loom.com/embed/${loomVideoId}?autoplay=0&muted=1&hide_share=1&hide_title=1&hide_owner=1&hide_embed_top_bar=1`;
                              
                              return (
                                <iframe
                                  src={loomEmbedUrl}
                                  width="100%"
                                  height="100%"
                                  frameBorder="0"
                                  allowFullScreen
                                  title="Loom video preview"
                                  className="rounded-t-lg"
                                  style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                                  onError={() => {
                                    console.warn('Loom video preview failed to load');
                                  }}
                                />
                              );
                            }
                            
                            // For YouTube, Vimeo, and other videos, use ReactPlayer
                            return (
                              <ReactPlayer
                                url={videoUrl}
                                width="100%"
                                height="100%"
                                controls={false}
                                playing={false}
                                muted={true}
                                loop={true}
                                className="rounded-t-lg"
                                onError={(error) => {
                                  console.warn('Video preview error:', error);
                                }}
                                onReady={() => {
                                }}
                                fallback={
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                    <div className="text-center text-white">
                                      <PlayIcon className="w-12 h-12 mx-auto mb-2 opacity-80" />
                                      <p className="text-sm opacity-80">Video Preview</p>
                                    </div>
                                  </div>
                                }
                                config={{
                                  file: {
                                    attributes: {
                                      style: { borderRadius: '0.5rem 0.5rem 0 0' }
                                    }
                                  },
                                  youtube: {
                                    playerVars: {
                                      rel: 0,
                                      modestbranding: 1,
                                      iv_load_policy: 3,
                                      fs: 0,
                                      cc_load_policy: 0,
                                      disablekb: 1,
                                      playsinline: 1,
                                      showinfo: 0,
                                      loop: 0,
                                      end: 0,
                                      wmode: 'opaque',
                                      origin: window.location.origin,
                                      widget_referrer: window.location.origin,
                                      html5: 1,
                                      vq: 'hd720',
                                      disable_polymer: 1,
                                      no_https: 1,
                                      hl: 'en',
                                      cc_lang_pref: 'en'
                                    }
                                  },
                                  vimeo: {
                                    playerVars: {
                                      autoplay: false,
                                      controls: false,
                                      muted: true,
                                      loop: true,
                                      playsinline: true,
                                      preload: 'metadata'
                                    }
                                  }
                                }}
                              />
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('preview', qudemo);
                          }}
                          className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 hover:scale-110 transition-all duration-300 shadow-lg"
                        >
                          <PlayIcon className="w-8 h-8 text-white ml-1" />
                        </button>
                      </div>
                      
                      {/* Video Duration Badge */}
                      {qudemo.videos[0].duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {qudemo.videos[0].duration}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
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
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('share', qudemo);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                            !isPro ? 'text-gray-400' : ''
                          }`}
                        >
                          <ShareIcon className="w-4 h-4" />
                          {!isPro && <LockClosedIcon className="w-3 h-3" />}
                          <span>Share</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('delete', qudemo);
                          }}
                          disabled={deletingQudemoId === qudemo.id}
                          className={`w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center space-x-2 ${
                            deletingQudemoId === qudemo.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingQudemoId === qudemo.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                          <span>{deletingQudemoId === qudemo.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-3 space-y-2">
                  {/* Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownAction('preview', qudemo);
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200 py-2 px-3 rounded-lg border border-blue-200"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview Qudemo</span>
                  </button>
                  
                  {/* Share Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownAction('share', qudemo);
                    }}
                    className={`w-full flex items-center justify-center space-x-2 transition-colors duration-200 py-2 px-3 rounded-lg border ${
                      !isPro 
                        ? 'text-gray-400 border-gray-200 hover:bg-gray-50' 
                        : 'text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200'
                    }`}
                  >
                    <ShareIcon className="w-4 h-4" />
                    {!isPro && <LockClosedIcon className="w-3 h-3" />}
                    <span className="text-sm font-medium">Share Qudemo</span>
                  </button>
                </div>

                 {/* Stats */}
                 <div className="flex items-center justify-between text-sm text-gray-500">
                   <div className="flex items-center space-x-4">
                     {/* Video count - keep as is */}
                     <div className="flex items-center space-x-1">
                       <VideoCameraIcon className="w-4 h-4" />
                       <span>{qudemo.video_count || 0}</span>
                     </div>
                     
                     {/* Document icon - only show if documents were processed */}
                     {qudemo.document_count > 0 && (
                       <div className="flex items-center">
                         <DocumentTextIcon className="w-4 h-4" />
                       </div>
                     )}
                     
                     {/* Website icon - only show if websites were processed */}
                     {qudemo.website_count > 0 && (
                       <div className="flex items-center">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                         </svg>
                       </div>
                     )}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Qudemo</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Share this Qudemo with anyone using the link below:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This link is public and can be accessed by anyone without authentication. 
                  The shared page will show your company name and the Qudemo content.
                </p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && qudemoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Qudemo</h3>
                <button
                  onClick={handleCancelDelete}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4 text-left">
                  Are you sure you want to delete <strong>"{qudemoToDelete.title}"</strong>?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-left">
                      <h4 className="text-sm font-medium text-red-800">This action will permanently delete:</h4>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1 text-left">
                        <li>The qudemo and all its videos</li>
                        <li>All knowledge sources</li>
                        <li>All analytics data</li>
                      </ul>
                      <p className="mt-2 text-sm font-medium text-red-800 text-left">This action cannot be undone.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200"
                >
                  Delete Qudemo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => {
          setShowUpgradeModal(false);
          setErrorDetails(null);
        }}
        errorDetails={errorDetails}
      />
    </div>
  );
};

export default Qudemos;
