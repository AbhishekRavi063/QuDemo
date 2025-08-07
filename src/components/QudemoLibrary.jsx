import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import HybridVideoPlayer from "./HybridVideoPlayer";
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
  if (q.thumbnail_url) return q.thumbnail_url;
  
  // If YouTube link, extract video ID and return the default thumbnail
  const ytMatch = q.video_url && q.video_url.match(
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  
  // Loom logic
  const loomId = getLoomVideoId(q.video_url);
  if (loomId) {
    return `https://cdn.loom.com/sessions/thumbnails/${loomId}-with-play.gif`;
  }
  
  // Vimeo logic
  if (q.video_url && q.video_url.includes('vimeo.com/')) {
    const videoId = q.video_url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
    if (videoId) {
      return `https://vumbnail.com/${videoId}.jpg`;
    }
  }
  
  return "https://via.placeholder.com/400x200?text=No+Thumbnail";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewingQudemo, setPreviewingQudemo] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  // Function to enable audio after user interaction
  const enableAudio = () => {
    setAudioEnabled(true);
    // Enable audio on all video elements
    setTimeout(() => {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.muted = false;
        video.volume = 1.0;
        video.play().catch(e => console.log('Autoplay prevented:', e));
      });
      
      // Also handle ReactPlayer instances
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe.src.includes('loom.com')) {
          // For Loom videos, try to unmute via postMessage
          try {
            iframe.contentWindow.postMessage({ type: 'unmute' }, '*');
          } catch (e) {
            console.log('Could not unmute Loom video:', e);
          }
        } else if (iframe.src.includes('vimeo.com')) {
          // For Vimeo videos, try to unmute via postMessage
          try {
            iframe.contentWindow.postMessage({ method: 'setVolume', value: 1 }, '*');
          } catch (e) {
            console.log('Could not unmute Vimeo video:', e);
          }
        }
      });
    }, 100);
  };

  const fetchQudemos = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = getNodeApiUrl(`/api/qudemos?companyId=${company.id}`);
      
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        const newQudemos = data.data || [];
        const currentCount = newQudemos.length;
        
        setQudemos(newQudemos);
        setLastCount(currentCount);
      } else {
        setError(data.error || "Failed to fetch demos.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!company || isLoading) return;
    fetchQudemos();
  }, [company, isLoading]);

  // Auto-refresh removed

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQudemos();
  };

  const filteredQudemos = qudemos.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );



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
      ) : qudemos.length === 0 ? (
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
                        e.target.src = "https://via.placeholder.com/400x200?text=Thumbnail+Error";
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
                  <div className="text-blue-900 font-semibold text-lg mb-1">
                    {q.video_name || q.title}
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
    </div>
  );
};

export default QudemoLibrary;
