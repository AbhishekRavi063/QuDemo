import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import HybridVideoPlayer from "./HybridVideoPlayer";
import KnowledgeDataPreview from "./KnowledgeDataPreview";
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  PlayIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Link } from 'react-router-dom';
import { useCompany } from "../context/CompanyContext";
import { getNodeApiUrl } from "../config/api";

// Helper to extract Loom video ID
const getLoomVideoId = (url) => {
  if (!url) return null;
  // Remove query params
  const cleanUrl = url.split('?')[0];
  const match = cleanUrl.match(/loom\.com\/(?:share|embed|recordings)\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
};

function getThumbnailUrl(q) {
  // If there's a custom thumbnail URL, use it
  if (q.thumbnail_url) return q.thumbnail_url;
  
  // If YouTube link, extract video ID and return the default thumbnail
  const ytMatch = q.video_url && q.video_url.match(
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  
  // Loom logic - only try if we have a valid Loom ID
  const loomId = getLoomVideoId(q.video_url);
  if (loomId && loomId.length > 10) { // Basic validation for Loom ID
    return `https://cdn.loom.com/sessions/thumbnails/${loomId}-with-play.gif`;
  }
  
  // Vimeo logic - only try if we have a valid Vimeo URL
  if (q.video_url && q.video_url.includes('vimeo.com/')) {
    const videoId = q.video_url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
    if (videoId && videoId.length > 5) { // Basic validation for Vimeo ID
      return `https://vumbnail.com/${videoId}.jpg`;
    }
  }
  
  // Default fallback - use data URL to avoid network issues
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFRodW1ibmFpbDwvdGV4dD4KPC9zdmc+";
}

// Helper function to convert Loom share URL to embed URL
const convertLoomToEmbedUrl = (url) => {
  if (url && url.includes('loom.com/share/')) {
    // Convert share URL to embed URL and add autoplay parameters
    const embedUrl = url.replace('/share/', '/embed/').split('?')[0];
    return `${embedUrl}?autoplay=1&hide_share=1&hide_title=1&muted=0`;
  }
  return url;
};

// Helper function to convert Vimeo share URL to embed URL
const convertVimeoToEmbedUrl = (url) => {
  if (url && url.includes('vimeo.com/')) {
    // Extract video ID from various Vimeo URL formats
    const videoId = url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
    if (videoId) {
      // Convert to embed URL and add autoplay parameters
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&controls=1`;
    }
  }
  return url;
};

const QudemoLibrary = () => {
  const { company, isLoading } = useCompany();
  const [qudemos, setQudemos] = useState([]);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewingQudemo, setPreviewingQudemo] = useState(null);
  const [previewingKnowledgeSource, setPreviewingKnowledgeSource] = useState(null);
  const [knowledgeSourceContent, setKnowledgeSourceContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'knowledge'

  // Function to enable audio after user interaction
  const enableAudio = () => {
    setAudioEnabled(true);
    // Enable audio on all video elements
    setTimeout(() => {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.muted = false;
        video.volume = 1.0;
      });
    }, 100);
  };

  // Function to fetch knowledge source content
  const fetchKnowledgeSourceContent = async (sourceId) => {
    setLoadingContent(true);
    try {
      console.log(`🔍 DEBUG: Fetching content for source: ${sourceId}`);
      console.log(`🔍 DEBUG: Company name: ${company.name}`);
      
      // Call Node.js backend (which will then call Python backend)
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/knowledge/source/${sourceId}/content?company_name=${encodeURIComponent(company.name)}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG: Response data:', data);
        
        if (data.success && data.data) {
          console.log('🔍 DEBUG: Setting knowledge source content:', data.data);
          setKnowledgeSourceContent(data.data);
        } else {
          console.error('❌ Failed to fetch knowledge source content:', data);
          setKnowledgeSourceContent({ error: data.error || 'Failed to load content' });
        }
      } else {
        console.error('❌ Failed to fetch knowledge source content:', response.status);
        console.error('❌ Response text:', await response.text());
        setKnowledgeSourceContent({ error: 'Failed to load content' });
      }
    } catch (err) {
      console.error('Error fetching knowledge source content:', err);
      setKnowledgeSourceContent({ error: 'Error loading content' });
    } finally {
      setLoadingContent(false);
    }
  };

  // Function to preview knowledge source
  const handlePreviewKnowledgeSource = async (source) => {
    console.log('🔍 DEBUG: Preview clicked for source:', source);
    console.log('🔍 DEBUG: Source ID:', source.id);
    console.log('🔍 DEBUG: Source URL:', source.source_url);
    console.log('🔍 DEBUG: Source title:', source.title);
    
    setPreviewingKnowledgeSource(source);
    setKnowledgeSourceContent(null);
    await fetchKnowledgeSourceContent(source.id);
  };

  const fetchQudemos = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = getNodeApiUrl(`/api/qudemos?companyId=${company.id}&limit=100`);
      
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      console.log('📊 QudemoLibrary fetch response:', { status: res.status, data });
      
      if (res.ok && data.success) {
        const newQudemos = data.data || [];
        const currentCount = newQudemos.length;
        
        console.log('📊 Qudemos loaded:', newQudemos.length, 'items');
        setQudemos(newQudemos);
        setLastCount(currentCount);
      } else {
        console.error('❌ QudemoLibrary fetch failed:', data);
        setError(data.error || "Failed to fetch demos.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchKnowledgeSources = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log(`🔍 DEBUG: Fetching knowledge sources for company: "${company.name}"`);
      console.log(`🔍 DEBUG: Company object:`, company);
      
      // Call Node.js backend (which will then call Python backend)
      const response = await fetch(getNodeApiUrl(`/api/knowledge/sources/${company.name}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🔍 DEBUG: Node.js API response:`, data);
        
        // Filter out video content from knowledge sources tab and only show completed sources
        // Videos are displayed in the Videos tab, so we only show documents, websites, and other non-video content here
        const nonVideoSources = (data.data || []).filter(source => 
          source.source_type !== 'video' && 
          source.source_type !== 'youtube' && 
          source.source_type !== 'loom' &&
          (source.status === 'processed' || !source.status) // Only show processed sources
        );
        
        console.log(`🔍 DEBUG: After frontend filtering: ${nonVideoSources.length} non-video sources`);
        setKnowledgeSources(nonVideoSources);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge sources:", err);
    }
  };

  useEffect(() => {
    if (!company || isLoading) return;
    fetchQudemos();
    fetchKnowledgeSources();
  }, [company, isLoading]);

  // Auto-refresh removed

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQudemos();
    fetchKnowledgeSources();
  };

  const filteredQudemos = qudemos.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter knowledge sources to only show completed ones
  console.log('🔍 DEBUG: Current knowledgeSources state:', knowledgeSources);
  console.log('🔍 DEBUG: Current searchTerm:', searchTerm);
  console.log('🔍 DEBUG: Current knowledgeSourceContent state:', knowledgeSourceContent);
  
  const filteredKnowledgeSources = knowledgeSources.filter((source) =>
    source.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log('🔍 DEBUG: Filtered knowledge sources:', filteredKnowledgeSources);

  if (isLoading) {
    return (
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-lg">
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Loading...
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Please wait while we load your company information.
        </p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-lg">
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          No Company Found
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          You need to create a company before you can view or create QuDemos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Qudemo Library</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Create Qudemo
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🎬 Videos ({qudemos.length})
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'knowledge'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📚 Knowledge Sources ({knowledgeSources.length})
        </button>
      </div>

      <div className="relative mb-6 w-full">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search qudemos..."
          className="w-full border border-gray-300 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : activeTab === 'videos' ? (
        // Videos Tab Content
        qudemos.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No videos created yet.</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredQudemos.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">No demos found.</div>
          ) : (
            filteredQudemos.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded shadow-md overflow-hidden flex flex-col relative"
              >
                <div
                  className="relative w-full h-40"
                  style={{ background: `url('${getThumbnailUrl(q)}') center center / cover no-repeat` }}
                >
                  {q.video_url && ReactPlayer.canPlay(q.video_url) ? (
                    <div className="relative w-full h-40">
                      <ReactPlayer
                        url={q.video_url}
                        width="100%"
                        height="100%"
                        controls={false}
                        playing={true}
                        muted={true}
                        light={getThumbnailUrl(q)}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        onReady={() => {
                          // For thumbnail videos, keep them muted but ready for preview
                          console.log('Thumbnail video ready for:', q.video_name);
                        }}
                      />
                      {/* Audio indicator for thumbnail */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        🔊 Click to preview with audio
                      </div>
                    </div>
                  ) : (
                    <img
                      src={getThumbnailUrl(q)}
                      alt={q.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        console.warn(`Failed to load thumbnail for ${q.title}:`, e.target.src);
                        // Prevent infinite loops by checking if we're already using the fallback
                        if (!e.target.src.includes('data:image/svg+xml')) {
                          e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRodW1ibmFpbCBFcnJvcjwvdGV4dD4KPC9zdmc+";
                        }
                      }}
                    />
                  )}
                  {q.is_active && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Active
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-blue-900 font-semibold text-lg">
                      {q.video_name || q.title}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1 flex-grow">{q.description}</p>

                  <div className="flex justify-between items-center text-gray-500 text-sm mt-4 border-t pt-3">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <EyeIcon className="h-5 w-5 mr-1 text-blue-500" />
                        {q.views || 0}
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftIcon className="h-5 w-5 mr-1 text-blue-500" />
                        {q.comments || 0}
                      </div>
                    </div>
                    <div>{q.updated_at ? `Updated ${new Date(q.updated_at).toLocaleDateString()}` : ''}</div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      className="w-full border border-blue-400 text-blue-600 rounded py-2 flex items-center justify-center gap-2 hover:bg-blue-50"
                      onClick={() => {
                        setPreviewingQudemo(q);
                        setAudioEnabled(false); // Reset audio state for new video
                        // Enable audio after user interaction
                        setTimeout(() => {
                          enableAudio();
                        }, 100);
                      }}
                    >
                      <PlayIcon className="w-5 h-5" />
                      Preview Qudemo
                    </button>
                    <button className="w-full border border-blue-400 text-blue-600 rounded py-2 flex items-center justify-center gap-2 hover:bg-blue-50">
                      <UserIcon className="w-5 h-5" />
                      View Interactions
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )
      ) : (
        // Knowledge Sources Tab Content
        <KnowledgeDataPreview 
          companyName={company?.name || "Demo Company"} 
          onDataUpdate={(updatedItems) => {
            console.log('Knowledge data updated:', updatedItems.length, 'items remaining');
            // You can add additional logic here if needed
          }}
        />
      )}

      {/* Modal for video preview */}
      {previewingQudemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative bg-white rounded-lg shadow-lg w-[60vw] h-[60vh] flex flex-col items-center justify-center">
            <button
              className="absolute top-4 right-4 bg-white text-gray-900 hover:text-red-500 rounded-full p-2 shadow-lg z-10"
              style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1, border: '2px solid #eee' }}
              onClick={() => setPreviewingQudemo(null)}
              title="Close"
            >
              ×
            </button>
            
            {/* Use HybridVideoPlayer for all video types */}
            <HybridVideoPlayer
              url={previewingQudemo.video_url}
              width="100%"
              height="100%"
              controls={true}
              playing={true}
              style={{ borderRadius: '0.5rem', background: 'black' }}
              onReady={() => {
                console.log('Video ready:', previewingQudemo.video_name);
              }}
              onPlay={() => {
                console.log('Video playing:', previewingQudemo.video_name);
              }}
            />
            <div className="mt-2 text-lg font-semibold">{previewingQudemo.title}</div>
          </div>
        </div>
      )}

      {/* Knowledge Source Preview Modal */}
      {previewingKnowledgeSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {previewingKnowledgeSource.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Knowledge Source Preview
                </p>
              </div>
              <button
                onClick={() => setPreviewingKnowledgeSource(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading content...</span>
                </div>
              ) : knowledgeSourceContent.error ? (
                <div className="text-center text-red-600 py-8">
                  <p>Error loading content: {knowledgeSourceContent.error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Source Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-900">Source Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 capitalize text-gray-600">
                          {previewingKnowledgeSource.source_type}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 capitalize text-gray-600">
                          {previewingKnowledgeSource.status}
                        </span>
                      </div>
                      {previewingKnowledgeSource.source_url && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">URL:</span>
                          <a 
                            href={previewingKnowledgeSource.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800 break-all"
                          >
                            {previewingKnowledgeSource.source_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing Statistics */}
                  {knowledgeSourceContent.stats && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-green-900">Processing Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Total Chunks:</span>
                          <span className="ml-2 text-gray-600">
                            {knowledgeSourceContent.stats.total_chunks || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Q&A Pairs:</span>
                          <span className="ml-2 text-gray-600">
                            {knowledgeSourceContent.stats.total_qa_pairs || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Total Words:</span>
                          <span className="ml-2 text-gray-600">
                            {knowledgeSourceContent.stats.total_words || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Total Characters:</span>
                          <span className="ml-2 text-gray-600">
                            {knowledgeSourceContent.stats.total_characters || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pre-generated Q&A Pairs */}
                  {knowledgeSourceContent.qa_pairs && knowledgeSourceContent.qa_pairs.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>🤖 Pre-generated Q&A Pairs</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {knowledgeSourceContent.qa_pairs.length} pairs
                        </span>
                      </h3>
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="text-sm text-blue-800">
                          <strong>⚡ Smart Q&A System:</strong> These questions and answers were automatically generated from the content to provide instant, accurate responses to common user queries.
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {knowledgeSourceContent.qa_pairs.map((qa, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-blue-600">
                                  Q&A Pair {index + 1}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  qa.difficulty === 'basic' ? 'bg-green-100 text-green-800' :
                                  qa.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {qa.difficulty}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                  {qa.question_type}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Score: {(qa.score * 100).toFixed(1)}%
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">❓ Question:</div>
                                <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                                  {qa.question}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">✅ Answer:</div>
                                <div className="text-sm text-gray-800 bg-green-50 p-3 rounded">
                                  {qa.answer}
                                </div>
                              </div>
                            </div>
                            
                            {qa.metadata && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500 space-y-1">
                                  {qa.metadata.source_type && (
                                    <div><strong>Content Type:</strong> {qa.metadata.source_type}</div>
                                  )}
                                  {qa.metadata.source_info && (
                                    <div><strong>Source:</strong> {qa.metadata.source_info}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Content */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Extracted Content</h3>
                    {knowledgeSourceContent.chunks && knowledgeSourceContent.chunks.length > 0 ? (
                      <div>
                        {/* Content Summary */}
                        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                          <div className="text-sm text-yellow-800">
                            <strong>📄 Content Summary:</strong> This knowledge source contains {knowledgeSourceContent.chunks.length} text chunks from multiple sources. 
                            Each chunk represents a segment of processed content, not individual pages.
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {knowledgeSourceContent.chunks.map((chunk, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                  Chunk {index + 1}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {chunk.text?.length || 0} characters
                                </span>
                              </div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                {chunk.text || 'No content available'}
                              </div>
                              {chunk.metadata && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="text-xs text-gray-500 space-y-1">
                                    {chunk.metadata.title && (
                                      <div><strong>Title:</strong> {chunk.metadata.title}</div>
                                    )}
                                    {chunk.metadata.url && (
                                      <div><strong>Source URL:</strong> 
                                        <a 
                                          href={chunk.metadata.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="ml-1 text-blue-600 hover:text-blue-800 break-all"
                                        >
                                          {chunk.metadata.url}
                                        </a>
                                      </div>
                                    )}
                                    {chunk.metadata.source_type && (
                                      <div><strong>Content Type:</strong> {chunk.metadata.source_type}</div>
                                    )}
                                    {chunk.metadata.source_info && chunk.metadata.source_info !== chunk.metadata.url && (
                                      <div><strong>Original Source:</strong> {chunk.metadata.source_info}</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>No content available for preview</p>
                        <p className="text-sm mt-2">This knowledge source may not have been processed yet or the content is not available.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QudemoLibrary;
