import React, { useState, useRef } from "react";
import {
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCompany } from "../context/CompanyContext";
import { getNodeApiUrl } from "../config/api";
import { useNavigate } from "react-router-dom";


const CreateQuDemo = () => {
  const { company, isLoading } = useCompany();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [videoUrls, setVideoUrls] = useState([""]);
  const [sources, setSources] = useState([""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0); // Track last submission time
  
  // Video processing notification state

  
  // New state for Product Knowledge Sources
  // const [websiteUrl, setWebsiteUrl] = useState(""); // Not used
  // const [documentFile, setDocumentFile] = useState(null); // Not used
  // const [isProcessingKnowledge, setIsProcessingKnowledge] = useState(false); // Not used
  // const [knowledgeSources, setKnowledgeSources] = useState([]); // Not used
  // const [currentTaskId, setCurrentTaskId] = useState(null); // Not used
  const [scrapingProgress, setScrapingProgress] = useState(null);
  // const [progressInterval, setProgressInterval] = useState(null); // Not used
  // const documentInputRef = useRef(null); // Not used

  // const handleSourceChange = (index, value) => { // Not used
  //   const updated = [...sources];
  //   updated[index] = value;
  //   setSources(updated);
  // };

  // const addSourceField = () => { // Not used
  //   setSources([...sources, ""]);
  // };

  // const removeSourceField = (index) => { // Not used
  //   const updated = sources.filter((_, i) => i !== index);
  //   setSources(updated);
  // };

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

  // Knowledge Sources handlers - COMMENTED OUT (not used)
  // const handleWebsiteUrlChange = (e) => {
  //   setWebsiteUrl(e.target.value);
  // };

  // const handleDocumentUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setDocumentFile(file);
  //   }
  // };

  // Progress tracking functions - COMMENTED OUT (not used)
  // const startProgressTracking = (taskId) => {
  //   setCurrentTaskId(taskId);
  //   setScrapingProgress({
  //     status: "starting",
  //     progress: { current: 0, total: 0, percentage: 0 },
  //     stats: { urls_scraped: 0, urls_skipped: 0 }
  //   });
    
  //   // Poll for progress updates every 5 seconds
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetch(getNodeApiUrl(`/scraping-progress/${taskId}`));
  //       if (response.ok) {
  //         const data = await response.json();
  //         if (data.success) {
  //           setScrapingProgress(data.data);
            
  //           // Stop tracking if completed or failed
  //           if (data.data.status === 'completed' || data.data.status === 'failed') {
  //             stopProgressTracking();
  //           }
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch progress:", err);
  //     }
  //   }, 5000);
    
  //   setProgressInterval(interval);
  // };

  // const stopProgressTracking = () => {
  //   if (progressInterval) {
  //     clearInterval(progressInterval);
  //     setProgressInterval(null);
  //   }
  //   setCurrentTaskId(null);
  //   setScrapingProgress(null);
  // };

  // const processDocumentKnowledge = async () => { // Not used
  //   if (!documentFile) {
  //     setError("Please select a document file");
  //     return;
  //   }

  //   setIsProcessingKnowledge(true);
  //   setError("");
  //   setSuccess("");

  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     const formData = new FormData();
  //     formData.append('file', documentFile);
  //     formData.append('companyName', company.name);

  //     const response = await fetch(getNodeApiUrl('/api/knowledge/process-document'), {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: formData
  //     });

  //     const data = await response.json();

  //     if (response.ok && data.success) {
  //       setSuccess("Document knowledge processed successfully!");
  //       setDocumentFile(null);
  //       if (documentInputRef.current) {
  //         documentInputRef.current.value = "";
  //       }
  //       // Refresh knowledge sources list
  //       fetchKnowledgeSources();
  //     } else {
  //       setError(data.error || "Failed to process document");
  //     }
  //   } catch (err) {
  //     setError("Network error. Please try again.");
  //   } finally {
  //     setIsProcessingKnowledge(false);
  //   }
  // };

  // const fetchKnowledgeSources = async () => { // Not used
  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     const response = await fetch(getNodeApiUrl(`/api/knowledge/sources/${company.name}`), {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setKnowledgeSources(data.data || []);
        
  //       // Check if any sources are still processing
  //       const processingSources = data.data?.filter(source => source.status === 'processing') || [];
  //       if (processingSources.length > 0) {
  //         setSuccess(`⏳ ${processingSources.length} knowledge source(s) still processing... Please wait.`);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch knowledge sources:", err);
  //   }
  // };

  // Load knowledge sources on component mount - COMMENTED OUT (not used)
  // React.useEffect(() => {
  //   if (company) {
  //     fetchKnowledgeSources();
  //   }
  // }, [company]);

  // Add video URL validation (Loom, Vimeo, and YouTube) - COMMENTED OUT (not used)
  // const validateVideoUrl = (url) => {
  //   if (!url || !url.trim()) {
  //     return { isValid: false, error: "Video URL is required" };
  //   }
  //   if (!url.startsWith('http')) {
  //     return { isValid: false, error: "Please provide a valid URL starting with http" };
  //   }
  //   const isLoomVideo = url.includes('loom.com');
  //   const isVimeoVideo = url.includes('vimeo.com');
  //   const isYouTubeVideo = url.includes('youtube.com') || url.includes('youtu.be');
    
  //   if (!isLoomVideo && !isVimeoVideo && !isYouTubeVideo) {
  //     return { isValid: false, error: "Only Loom, Vimeo, and YouTube video URLs are supported" };
  //   }
  //   return { isValid: true, error: null };
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Prevent rapid submissions
    const now = Date.now();
    if (now - lastSubmissionTime < 2000) {
      setError("Please wait a moment before submitting again.");
      return;
    }
    setLastSubmissionTime(now);
    
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!company || !company.id) {
        setError("Company information is required. Please refresh the page and try again.");
        return;
      }

      // Check if any content is provided
      const validVideoUrls = videoUrls.filter(url => url.trim());
      // const validWebsiteUrl = websiteUrl.trim(); // Not used
      
      if (validVideoUrls.length === 0) { // Removed websiteUrl check
        setError("Please provide at least one video URL or website URL to create a QuDemo.");
        return;
      }

      // Create qudemo first
      const qudemoData = {
        title: title || "Untitled Qudemo",
        description: "No description provided",
        companyId: company.id,
        videos: videoUrls.filter(url => url.trim()).map((url, index) => ({
          url: url.trim(),
          type: url.includes('loom.com') ? 'loom' : 'youtube',
          title: `Video ${index + 1}`,
          order: index + 1
        })),
        knowledgeSources: sources.filter(source => source.trim()).map(source => ({
          url: source.trim(),
          type: 'website'
        }))
      };

      console.log('🎯 Creating qudemo with data:', qudemoData);

      const token = localStorage.getItem('accessToken');
      const createResponse = await fetch(getNodeApiUrl('/api/qudemos'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(qudemoData)
      });

      const createResult = await createResponse.json();
      
      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create qudemo');
      }

      const qudemoId = createResult.data.id;
      console.log('✅ Qudemo created successfully:', qudemoId);

      setSuccess("Please wait, your video is now processing. This may take a few minutes. Once it's ready, you'll be redirected to your Qudemos page.");

      // Process all content automatically using the new endpoint
      
      if (validVideoUrls.length > 0) { // Removed websiteUrl check
        try {
          const contentResponse = await fetch(getNodeApiUrl(`/api/qudemos/process-content/${company.name}/${qudemoId}`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              video_urls: validVideoUrls,
              website_url: null // Not used
            })
          });

          const contentResult = await contentResponse.json();
          
          if (contentResult.success) {
            const { videos_processed, website_processed, total_chunks, processing_order } = contentResult;
            
            let successMessage = "🎉 All content processed successfully!";
            if (videos_processed > 0) {
              successMessage += `\n📹 ${videos_processed} video(s) processed`;
            }
            if (website_processed) {
              successMessage += `\n🌐 Website processed (${total_chunks} chunks created)`;
            }
            if (processing_order.length > 0) {
              successMessage += `\n⏱️ Processing order: ${processing_order.join(' → ')}`;
            }
            
            // Hide the processing message and show completion
            setSuccess("");
          } else {
            // Handle processing failure with detailed error message
            const { processing_errors, has_anti_bot_protection } = contentResult; // message not used
            
            let errorMessage = "❌ Content processing failed!\n\n";
            
            // Show specific failed content with detailed reasons
            if (processing_errors && processing_errors.length > 0) {
              errorMessage += "📋 Failed Content Details:\n\n";
              
              processing_errors.forEach((error, index) => {
                if (error.type === 'website') {
                  errorMessage += `🌐 WEBSITE FAILED:\n`;
                  errorMessage += `   URL: ${error.url}\n`;
                  errorMessage += `   Reason: ${error.error}\n`;
                  
                  if (error.error_type) {
                    errorMessage += `   Error Type: ${error.error_type.toUpperCase()}\n`;
                  }
                  
                  if (error.protection_detected) {
                    errorMessage += `   🛡️ Anti-Bot Protection: YES\n`;
                  }
                  
                  errorMessage += `\n`;
                  
                } else if (error.type === 'video') {
                  errorMessage += `📹 VIDEO FAILED:\n`;
                  errorMessage += `   URL: ${error.url}\n`;
                  errorMessage += `   Reason: ${error.error}\n`;
                  
                  if (error.error_type) {
                    errorMessage += `   Error Type: ${error.error_type.toUpperCase()}\n`;
                  }
                  
                  errorMessage += `\n`;
                }
              });
            }
            
            // Add general anti-bot protection notice if detected
            if (has_anti_bot_protection) {
              errorMessage += "🛡️ Anti-Bot Protection Summary:\n";
              errorMessage += "One or more websites have security measures that prevent automated scraping.\n";
              errorMessage += "This is common with sites using Cloudflare, reCAPTCHA, or similar protection.\n\n";
            }
            
            // Add helpful suggestions based on what failed
            errorMessage += "💡 What you can do:\n";
            
            const hasWebsiteErrors = processing_errors?.some(e => e.type === 'website');
            const hasVideoErrors = processing_errors?.some(e => e.type === 'video');
            
            if (hasWebsiteErrors && !hasVideoErrors) {
              errorMessage += "• Try a different website URL (avoid sites with anti-bot protection)\n";
              errorMessage += "• Use only video content for this QuDemo\n";
              errorMessage += "• Contact the website owner for API access\n";
            } else if (hasVideoErrors && !hasWebsiteErrors) {
              errorMessage += "• Check that your video URLs are valid and accessible\n";
              errorMessage += "• Try different video URLs (YouTube, Loom, Vimeo)\n";
              errorMessage += "• Use only website content for this QuDemo\n";
            } else if (hasWebsiteErrors && hasVideoErrors) {
              errorMessage += "• Try different content sources (both videos and websites failed)\n";
              errorMessage += "• Check that all URLs are valid and accessible\n";
              errorMessage += "• Contact support for assistance\n";
            } else {
              errorMessage += "• Try different content sources\n";
              errorMessage += "• Check that all URLs are valid and accessible\n";
              errorMessage += "• Contact support if you need assistance\n";
            }
            
            errorMessage += "\n⚠️ QuDemo will not be created without successful content.";
            
            // Show error notification and don't redirect
            setError(errorMessage);
            return; // Don't proceed with navigation
          }
        } catch (contentError) {
          console.error('❌ Content processing error:', contentError);
          setError(`Content processing failed: ${contentError.message}. The qudemo was created but content processing needs to be retried.`);
        }
      }

      // Hide the processing message
      setSuccess("");
      
      // Reset form
      setTitle("");
      setVideoUrls([""]);
      setSources([""]);
      // setWebsiteUrl(""); // Not used
      
      // Navigate to qudemos page after a short delay to show success message
      setTimeout(() => {
        navigate('/qudemos');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Create qudemo error:', error);
      setError(error.message || "Failed to create qudemo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-8">
      <div className="w-full max-w-2xl mx-auto px-4">
        {/* Main Heading and Subheading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Create New Qudemo
          </h1>
          <p className="text-lg text-gray-600">
            Create an interactive demo that allows buyers to learn about your product at their own pace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-16">
          {/* Qudemo Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 text-left">
              Qudemo Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter qudemo title"
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 text-left">
              Link to Loom or YouTube demo videos
            </label>
            {videoUrls.map((url, index) => (
              <div className="flex items-center gap-2 mb-2" key={index}>
                <input
                  type="text"
                  value={url}
                  onChange={e => handleVideoUrlChange(index, e.target.value)}
                  placeholder="https://www.loom.com/share/your-video-id or https://youtube.com/watch?v="
                  className="flex-1 border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {videoUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoUrlField(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={addVideoUrlField}
                className="text-blue-600 hover:underline text-sm font-medium flex items-center justify-center gap-1"
              >
                <span className="text-blue-600 font-bold">+</span> Add another video
              </button>
            </div>
          </div>

        {/* PRODUCT KNOWLEDGE SOURCES - TEMPORARILY COMMENTED OUT */}
        {/*
        <div className="mt-6">
          <label className="block font-medium text-gray-700 mb-2">
            Product Knowledge Sources
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Add website content and documents to enhance your AI assistant's knowledge base.
          </p>

          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">🌐 Website Knowledge</h4>
            <p className="text-sm text-gray-600 mb-3">
              Enter a website URL to automatically scrape and add to your knowledge base. 
              <span className="text-blue-600 font-medium"> This will be processed automatically when you save the QuDemo.</span>
            </p>
            <input
              type="text"
              value={websiteUrl}
              onChange={handleWebsiteUrlChange}
              placeholder="https://example.com/faq or https://docs.example.com"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            />
          </div>

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

        </div>
        */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Processing Content...' : 'Create Qudemo'}
          </button>

          {/* Processing Indicator */}
          {isSubmitting && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-100 border border-blue-300 text-blue-800 px-6 py-3 rounded shadow z-20 text-center w-[320px] animate-fade-in">
              <div className="font-semibold mb-1">Content is being processed...</div>
              <div className="text-xs">Videos and website content are being processed. This may take some time.</div>
            </div>
          )}
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Processing Failed</h3>
                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">{error}</div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Message Popup */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md w-full mx-4" style={{ margin: '0 auto' }}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-800">Processing</h3>
                  <div className="mt-2 text-sm text-blue-700">{success}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Video Processing Notification */}
      {scrapingProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-900">
              {scrapingProgress.status === 'completed' ? '✅' : scrapingProgress.status === 'failed' ? '❌' : '🔄'} Smart Scraping Progress
            </h3>
            <span className={`font-medium ${
              scrapingProgress.status === 'completed' ? 'text-green-600' : scrapingProgress.status === 'failed' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {scrapingProgress.status.charAt(0).toUpperCase() + scrapingProgress.status.slice(1)}
            </span>
          </div>
          
          {scrapingProgress.progress && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress: {scrapingProgress.progress.current}/{scrapingProgress.progress.total}</span>
                <span>{scrapingProgress.progress.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scrapingProgress.progress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {scrapingProgress.stats && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded p-2">
                <div className="font-medium text-green-700">✅ Scraped</div>
                <div className="text-lg font-bold">{scrapingProgress.stats.urls_scraped}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-medium text-orange-700">⏭️ Skipped</div>
                <div className="text-lg font-bold">{scrapingProgress.stats.urls_skipped}</div>
              </div>
            </div>
          )}
          
          {scrapingProgress.current_url && (
            <div className="mt-3 text-sm text-gray-600">
              <div className="font-medium">Current URL:</div>
              <div className="truncate">{scrapingProgress.current_url}</div>
            </div>
          )}
          
          {scrapingProgress.status === 'completed' && (
            <button
              onClick={() => setScrapingProgress(null)} // Simplified - just close the progress
              className="mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              Close Progress
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateQuDemo;
