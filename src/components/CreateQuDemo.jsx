import React, { useState, useRef, useContext } from "react";
import {
  ArrowUpTrayIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCompany } from "../context/CompanyContext";
import { getNodeApiUrl } from "../config/api";
import { CompanyContext } from "../context/CompanyContext";


const CreateQuDemo = () => {
  const { company, isLoading } = useCompany();
  const [videoUrls, setVideoUrls] = useState([""]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sources, setSources] = useState([""]);
  const [meetingLink, setMeetingLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0); // Track last submission time
  const fileInputRefs = useRef([]);
  
  // Video processing notification state

  
  // New state for Product Knowledge Sources
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [isProcessingKnowledge, setIsProcessingKnowledge] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [scrapingProgress, setScrapingProgress] = useState(null);
  const [progressInterval, setProgressInterval] = useState(null);
  const documentInputRef = useRef(null);

  const handleSourceChange = (index, value) => {
    const updated = [...sources];
    updated[index] = value;
    setSources(updated);
  };

  const addSourceField = () => {
    setSources([...sources, ""]);
  };

  const removeSourceField = (index) => {
    const updated = sources.filter((_, i) => i !== index);
    setSources(updated);
  };

  const handleVideoUrlChange = (index, value) => {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  };

  const addVideoUrlField = () => {
    setVideoUrls([...videoUrls, ""]);
  };

  const removeVideoUrlField = (index) => {
    const updated = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(updated);
  };

  // Knowledge Sources handlers
  const handleWebsiteUrlChange = (e) => {
    setWebsiteUrl(e.target.value);
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  // Progress tracking functions
  const startProgressTracking = (taskId) => {
    setCurrentTaskId(taskId);
    setScrapingProgress({
      status: "starting",
      progress: { current: 0, total: 0, percentage: 0 },
      stats: { urls_scraped: 0, urls_skipped: 0 }
    });
    
    // Poll for progress updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(getNodeApiUrl(`/scraping-progress/${taskId}`));
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setScrapingProgress(data.data);
            
            // Stop tracking if complete
            if (data.data.status === "completed" || data.data.status === "failed") {
              clearInterval(interval);
              setProgressInterval(null);
              setCurrentTaskId(null);
            }
          }
        }
      } catch (err) {
        console.error("Progress tracking error:", err);
      }
    }, 5000);
    
    setProgressInterval(interval);
  };

  const stopProgressTracking = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setCurrentTaskId(null);
    setScrapingProgress(null);
  };

  const processWebsiteKnowledge = async () => {
    if (!websiteUrl) {
      setError("Please enter a website URL");
      return;
    }

    setIsProcessingKnowledge(true);
    setError("");
    setSuccess("");

    // Show initial progress message
    setSuccess("🧠 Starting smart website processing... This will only scrape demo-relevant content.");

    try {
      const token = localStorage.getItem('accessToken');
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7200000); // 120 minutes timeout
      
      const response = await fetch(getNodeApiUrl('/api/knowledge/process-website'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: company.name,
          websiteUrl: websiteUrl
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.success) {
        // Start progress tracking if task ID is provided
        if (data.data && data.data.task_id) {
          startProgressTracking(data.data.task_id);
        }
        
        setSuccess("✅ Website processing started! Monitoring progress...");
        setWebsiteUrl("");
        // Refresh knowledge sources list
        fetchKnowledgeSources();
      } else {
        setError(data.error || "Failed to process website");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("⏱️ Website processing is taking longer than expected. Please check the status in a few minutes.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsProcessingKnowledge(false);
    }
  };

  const processDocumentKnowledge = async () => {
    if (!documentFile) {
      setError("Please select a document file");
      return;
    }

    setIsProcessingKnowledge(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('companyName', company.name);

      const response = await fetch(getNodeApiUrl('/api/knowledge/process-document'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Document knowledge processed successfully!");
        setDocumentFile(null);
        if (documentInputRef.current) {
          documentInputRef.current.value = "";
        }
        // Refresh knowledge sources list
        fetchKnowledgeSources();
      } else {
        setError(data.error || "Failed to process document");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessingKnowledge(false);
    }
  };

  const fetchKnowledgeSources = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/knowledge/sources/${company.name}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKnowledgeSources(data.data || []);
        
        // Check if any sources are still processing
        const processingSources = data.data?.filter(source => source.status === 'processing') || [];
        if (processingSources.length > 0) {
          setSuccess(`⏳ ${processingSources.length} knowledge source(s) still processing... Please wait.`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch knowledge sources:", err);
    }
  };

  // Load knowledge sources on component mount
  React.useEffect(() => {
    if (company) {
      fetchKnowledgeSources();
    }
  }, [company]);

  // Add video URL validation (Loom, Vimeo, and YouTube)
  const validateVideoUrl = (url) => {
    if (!url || !url.trim()) {
      return { isValid: false, error: "Video URL is required" };
    }
    if (!url.startsWith('http')) {
      return { isValid: false, error: "Please provide a valid URL starting with http" };
    }
    const isLoomVideo = url.includes('loom.com');
    const isVimeoVideo = url.includes('vimeo.com');
    const isYouTubeVideo = url.includes('youtube.com') || url.includes('youtu.be');
    
    if (!isLoomVideo && !isVimeoVideo && !isYouTubeVideo) {
      return { isValid: false, error: "Only Loom, Vimeo, and YouTube video URLs are supported" };
    }
    return { isValid: true, error: null };
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('video', file);
      formData.append('companyId', company.id);
      // You may want to add more fields as needed
      const res = await fetch(getNodeApiUrl('/api/video/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success && data.videoUrl) {
        // Set the uploaded video URL in the corresponding field
        const updated = [...videoUrls];
        updated[index] = data.videoUrl;
        setVideoUrls(updated);
        setSuccess("Video uploaded successfully!");
      } else {
        setError(data.error || "Failed to upload video.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple rapid submissions (debounce)
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    if (timeSinceLastSubmission < 3000) { // 3 seconds debounce
      console.log(`⚠️ Submission blocked - too soon after last submission (${timeSinceLastSubmission}ms ago)`);
      setError("Please wait a few seconds before submitting again.");
      return;
    }
    
    setError("");
    setSuccess("");
    if (!videoUrls.some(url => url.trim() !== "")) {
      setError("At least one Video URL is required.");
      return;
    }
    
    // Get all non-empty video URLs
    const validVideoUrls = videoUrls.filter(url => url.trim() !== "");
    
    // Validate all video URLs
    for (const videoUrl of validVideoUrls) {
      const validation = validateVideoUrl(videoUrl);
      if (!validation.isValid) {
        setError(`Invalid URL: ${videoUrl} - ${validation.error}`);
        return;
      }
    }
    
    setIsSubmitting(true);
    setLastSubmissionTime(now); // Update last submission time
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Process all videos
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < validVideoUrls.length; i++) {
        const videoUrl = validVideoUrls[i];
        const source = sources[i] || sources[0] || "loom"; // Use corresponding source or fallback
        
        console.log(`🎬 Processing video ${i + 1}/${validVideoUrls.length}: ${videoUrl}`);
        
        // Create request body for this video
        const requestBody = {
          videoUrl: videoUrl,
          companyId: company.id,
          source: source,
          meetingLink: meetingLink || null
        };
        
        try {
          const res = await fetch(getNodeApiUrl('/api/video/videos'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
          });
          
          const data = await res.json();
          
          console.log(`📊 Video ${i + 1} response:`, { status: res.status, data });
          
                    if (res.ok && data.success) {
            successCount++;
            results.push({ videoUrl, status: 'success', data });
          } else {
          errorCount++;
          const errorMessage = data.error || data.details || 'Unknown error';
          results.push({ videoUrl, status: 'error', error: errorMessage });
          console.error(`❌ Video ${i + 1} failed:`, { error: data.error, details: data.details, status: res.status });
        }
          
        } catch (err) {
          errorCount++;
          results.push({ videoUrl, status: 'error', error: 'Network error' });
          console.error(`❌ Network error for video ${i + 1}:`, err);
        }
        
        // Add a small delay between video processing requests to prevent overwhelming the backend
        if (i < validVideoUrls.length - 1) {
          console.log(`⏳ Waiting 2 seconds before processing next video...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      

      
      // Update final status
      if (successCount > 0 && errorCount === 0) {
        setSuccess(`Successfully submitted ${successCount} video(s) for processing!`);
      } else if (successCount > 0 && errorCount > 0) {
        setSuccess(`Submitted ${successCount} video(s) successfully. ${errorCount} video(s) failed.`);
        setError(`Failed videos: ${results.filter(r => r.status === 'error').map(r => r.videoUrl).join(', ')}`);
      } else {
        console.error('❌ All videos failed. Results:', results);
        setError(`Failed to submit any videos. Please try again. Check console for details.`);
      }
      
      // Show results to user
      console.log('📊 Final results:', { successCount, errorCount, results });
      
      // Reset form if all videos were successful
      if (errorCount === 0) {
        setVideoUrls([""]);
        setThumbnailUrl("");
        setSources([""]);
        setMeetingLink("");
      }
      
    } catch (err) {
      console.error('❌ General error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress display component
  const ProgressDisplay = () => {
    if (!scrapingProgress) return null;

    const { status, progress, stats, current_url } = scrapingProgress;
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'text-green-600';
        case 'failed': return 'text-red-600';
        case 'processing': return 'text-blue-600';
        default: return 'text-gray-600';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'completed': return '✅';
        case 'failed': return '❌';
        case 'processing': return '🔄';
        default: return '⏳';
      }
    };

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900">
            {getStatusIcon(status)} Smart Scraping Progress
          </h3>
          <span className={`font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        {progress && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress: {progress.current}/{progress.total}</span>
              <span>{progress.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {stats && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded p-2">
              <div className="font-medium text-green-700">✅ Scraped</div>
              <div className="text-lg font-bold">{stats.urls_scraped}</div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="font-medium text-orange-700">⏭️ Skipped</div>
              <div className="text-lg font-bold">{stats.urls_skipped}</div>
            </div>
          </div>
        )}
        
        {current_url && (
          <div className="mt-3 text-sm text-gray-600">
            <div className="font-medium">Current URL:</div>
            <div className="truncate">{current_url}</div>
          </div>
        )}
        
        {status === 'completed' && (
          <button
            onClick={stopProgressTracking}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Close Progress
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
          You need to create a company before you can create a QuDemo.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold">Qudemo Details</h2>
      <p className="text-gray-600">
        Create an interactive demo that allows buyers to learn about your
        product at their own pace.
      </p>
      <form onSubmit={handleSubmit}>
        {/* Video URL & Thumbnail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Video URL
            </label>
            {videoUrls.map((url, index) => (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2" key={index}>
                <div className="flex flex-col sm:flex-row flex-1 w-full">
                  <input
                    type="text"
                    value={url}
                    onChange={e => handleVideoUrlChange(index, e.target.value)}
                    placeholder="https://www.loom.com/share/your-video-id or https://vimeo.com/your-video-id"
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                  />
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    ref={el => fileInputRefs.current[index] = el}
                    onChange={e => handleFileUpload(index, e)}
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 py-2 border border-t-0 sm:border-t border-l-0 sm:border-l border-gray-300 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none bg-gray-100 hover:bg-gray-200"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    disabled={isSubmitting}
                  >
                    <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
                    <span className="ml-1 text-sm">Upload</span>
                  </button>
                </div>
                {videoUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoUrlField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addVideoUrlField}
              className="flex items-center text-sm text-blue-600 hover:underline mt-1"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add another video
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Link to your Loom product demo video or upload a new one.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Only Loom video URLs are supported for optimal performance and reliability.
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Thumbnail Image URL
            </label>
            <div className="flex flex-col sm:flex-row">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="flex-1 border border-gray-300 px-4 py-2 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
              />
              <button type="button" className="flex items-center justify-center px-3 py-2 border border-t-0 sm:border-t border-l-0 sm:border-l border-gray-300 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none bg-gray-100 hover:bg-gray-200">
                <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
                <span className="ml-1 text-sm">Upload</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              An image that represents your demo (optional).
            </p>
          </div>
        </div>

        {/* Product Knowledge Sources */}
        <div className="mt-6">
          <label className="block font-medium text-gray-700 mb-2">
            Product Knowledge Sources
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Add website content and documents to enhance your AI assistant's knowledge base.
          </p>

          {/* Website Knowledge */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">🌐 Website Content</h4>
            <p className="text-sm text-gray-600 mb-3">
              Scrape website content (e.g., FAQ pages, documentation) to improve AI responses.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={websiteUrl}
                onChange={handleWebsiteUrlChange}
                placeholder="https://example.com/faq or https://docs.example.com"
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
              />
              <button
                type="button"
                onClick={processWebsiteKnowledge}
                disabled={isProcessingKnowledge || !websiteUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessingKnowledge ? 'Processing...' : 'Process Website'}
              </button>
            </div>
          </div>

          {/* Document Knowledge */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">📄 Document Upload</h4>
            <p className="text-sm text-gray-600 mb-3">
              Upload PDF, DOC, DOCX, TXT, or CSV files to add to your knowledge base.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                ref={documentInputRef}
                onChange={handleDocumentUpload}
                accept=".pdf,.doc,.docx,.txt,.csv"
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
              />
              <button
                type="button"
                onClick={processDocumentKnowledge}
                disabled={isProcessingKnowledge || !documentFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessingKnowledge ? 'Processing...' : 'Process Document'}
              </button>
            </div>
          </div>

          {/* Knowledge Sources List */}
          {knowledgeSources.length > 0 && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">📚 Current Knowledge Sources</h4>
              <div className="space-y-2">
                {knowledgeSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        source.status === 'processed' ? 'bg-green-500' : 
                        source.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-sm">{source.title}</div>
                        <div className="text-xs text-gray-500">
                          {source.source_type} • {new Date(source.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{source.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Meeting Link */}
        <div className="mt-6">
          <label className="block font-medium text-gray-700 mb-1">
            Meeting Link
          </label>
          <input
            type="text"
            value={meetingLink}
            onChange={e => setMeetingLink(e.target.value)}
            placeholder="https://meet.example.com/session"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 relative flex flex-col items-center">
          {isSubmitting && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-blue-100 border border-blue-300 text-blue-800 px-6 py-3 rounded shadow z-20 text-center w-[320px] animate-fade-in">
              <div className="font-semibold mb-1">Video is being processed...</div>
              <div className="text-xs">This may take some time. After processing, you will see your video in the library.</div>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded font-medium"
          >
            {isSubmitting ? 'Saving...' : 'Save QuDemo'}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
      
      {/* Video Processing Notification */}
      {scrapingProgress && <ProgressDisplay />}
    </div>
  );
};

export default CreateQuDemo;
