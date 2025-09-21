import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getNodeApiUrl } from '../config/api';
import { useCompany } from '../context/CompanyContext';

const EditQudemo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company } = useCompany();
  
  const [qudemo, setQudemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [removingVideoId, setRemovingVideoId] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videos, setVideos] = useState([]);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  
  // New item states
  const [newVideo, setNewVideo] = useState({ url: '', title: '', description: '' });
  const [newKnowledge, setNewKnowledge] = useState({ url: '', title: '', description: '' });
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);

  useEffect(() => {
    fetchQudemo();
  }, [id]);

  const fetchQudemo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQudemo(data.data);
        setTitle(data.data.title || '');
        setDescription(data.data.description || '');
        setVideos(data.data.videos || []);
        setKnowledgeSources(data.data.knowledge_sources || []);
      } else {
        setError(data.error || 'Failed to fetch qudemo');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          videos,
          knowledgeSources
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh qudemo data
        await fetchQudemo();
        alert('Qudemo updated successfully!');
      } else {
        setError(data.error || 'Failed to update qudemo');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addVideo = () => {
    if (!newVideo.url.trim()) {
      alert('Please enter a video URL');
      return;
    }

    const videoType = getVideoType(newVideo.url);
    if (!videoType) {
      alert('Please enter a valid YouTube, Loom, or Vimeo URL');
      return;
    }

    const video = {
      id: Date.now(), // Temporary ID for frontend
      video_url: newVideo.url,
      video_type: videoType,
      title: newVideo.title || 'Untitled Video',
      description: newVideo.description || '',
      order_index: videos.length + 1
    };

    setVideos([...videos, video]);
    setNewVideo({ url: '', title: '', description: '' });
    setShowVideoForm(false);
  };

  const removeVideo = async (videoId) => {
    try {
      setRemovingVideoId(videoId);
      
      // Remove video from local state first
      const updatedVideos = videos.filter(v => v.id !== videoId);
      setVideos(updatedVideos);
      
      // If this was the last video, delete the entire QuDemo
      if (updatedVideos.length === 0) {
        const confirmDelete = window.confirm(
          `This is the last video in "${qudemo.title}". Deleting it will remove the entire QuDemo. Are you sure you want to continue?`
        );
        
        if (confirmDelete) {
          await deleteEntireQudemo();
        } else {
          // User cancelled, restore the video
          setVideos(videos);
        }
      } else {
        // Save the updated videos list
        await saveVideoChanges(updatedVideos);
      }
    } catch (error) {
      console.error('Error removing video:', error);
      // Restore the video on error
      setVideos(videos);
      alert('Failed to remove video. Please try again.');
    } finally {
      setRemovingVideoId(null);
    }
  };

  const deleteEntireQudemo = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('QuDemo deleted successfully because it had no videos remaining.');
        navigate('/qudemos');
      } else {
        alert('Failed to delete QuDemo: ' + (data.error || 'Unknown error'));
        // Restore the video on error
        setVideos(videos);
      }
    } catch (error) {
      console.error('Error deleting QuDemo:', error);
      alert('Failed to delete QuDemo. Please try again.');
      // Restore the video on error
      setVideos(videos);
    } finally {
      setSaving(false);
    }
  };

  const saveVideoChanges = async (updatedVideos) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          videos: updatedVideos,
          knowledgeSources
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Video removed successfully');
      } else {
        throw new Error(data.error || 'Failed to update QuDemo');
      }
    } catch (error) {
      console.error('Error saving video changes:', error);
      throw error;
    }
  };

  const addKnowledgeSource = () => {
    if (!newKnowledge.url.trim()) {
      alert('Please enter a URL');
      return;
    }

    const sourceType = getSourceType(newKnowledge.url);
    const source = {
      id: Date.now(), // Temporary ID for frontend
      source_url: newKnowledge.url,
      source_type: sourceType,
      title: newKnowledge.title || 'Untitled Source',
      description: newKnowledge.description || '',
      status: 'processing'
    };

    setKnowledgeSources([...knowledgeSources, source]);
    setNewKnowledge({ url: '', title: '', description: '' });
    setShowKnowledgeForm(false);
  };

  const removeKnowledgeSource = (sourceId) => {
    setKnowledgeSources(knowledgeSources.filter(s => s.id !== sourceId));
  };

  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('loom.com')) return 'loom';
    if (url.includes('vimeo.com')) return 'vimeo';
    return null;
  };

  const getSourceType = (url) => {
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('.doc') || url.includes('.docx')) return 'document';
    return 'website';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => navigate('/qudemos')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Qudemos
        </button>
      </div>
    );
  }

  if (!qudemo) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Qudemo Not Found</h3>
        <button
          onClick={() => navigate('/qudemos')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Qudemos
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/qudemos')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Qudemos
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Qudemo</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/qudemos')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'videos', name: 'Videos' },
              { id: 'knowledge', name: 'Knowledge Sources' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter qudemo title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter qudemo description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PlayIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Videos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentDuplicateIcon className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Knowledge Sources</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{knowledgeSources.length}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckIcon className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-sm font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Videos</h3>
                <button
                  onClick={() => setShowVideoForm(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Video
                </button>
              </div>

              {/* Add Video Form */}
              {showVideoForm && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL *
                      </label>
                      <input
                        type="url"
                        value={newVideo.url}
                        onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="YouTube, Loom, or Vimeo URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Video title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newVideo.description}
                        onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Video description"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addVideo}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Add Video
                    </button>
                    <button
                      onClick={() => {
                        setShowVideoForm(false);
                        setNewVideo({ url: '', title: '', description: '' });
                      }}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Videos List */}
              <div className="space-y-4">
                {videos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PlayIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No videos added yet</p>
                    <p className="text-sm">Click "Add Video" to get started</p>
                  </div>
                ) : (
                  videos.map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <PlayIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{video.title}</h4>
                          <p className="text-sm text-gray-500">{video.video_url}</p>
                          {video.description && (
                            <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeVideo(video.id)}
                        disabled={removingVideoId === video.id || saving}
                        className={`text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                          removingVideoId === video.id ? 'animate-pulse' : ''
                        }`}
                      >
                        {removingVideoId === video.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Knowledge Sources Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Knowledge Sources</h3>
                <button
                  onClick={() => setShowKnowledgeForm(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Source
                </button>
              </div>

              {/* Add Knowledge Source Form */}
              {showKnowledgeForm && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL *
                      </label>
                      <input
                        type="url"
                        value={newKnowledge.url}
                        onChange={(e) => setNewKnowledge({ ...newKnowledge, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Website, PDF, or document URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newKnowledge.title}
                        onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Source title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newKnowledge.description}
                        onChange={(e) => setNewKnowledge({ ...newKnowledge, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Source description"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addKnowledgeSource}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Add Source
                    </button>
                    <button
                      onClick={() => {
                        setShowKnowledgeForm(false);
                        setNewKnowledge({ url: '', title: '', description: '' });
                      }}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Knowledge Sources List */}
              <div className="space-y-4">
                {knowledgeSources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No knowledge sources added yet</p>
                    <p className="text-sm">Click "Add Source" to get started</p>
                  </div>
                ) : (
                  knowledgeSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <LinkIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{source.title}</h4>
                          <p className="text-sm text-gray-500">{source.source_url}</p>
                          {source.description && (
                            <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                          )}
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(source.status)}`}>
                            {source.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeKnowledgeSource(source.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQudemo;

