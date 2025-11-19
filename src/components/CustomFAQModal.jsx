import React, { useState, useRef } from 'react';
import { XMarkIcon, CloudArrowUpIcon, VideoCameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getVideoApiUrl } from '../config/api';

const CustomFAQModal = ({ isOpen, onClose, onSave, companyName, qudemoId }) => {
  const [question, setQuestion] = useState('');
  const [answerType, setAnswerType] = useState('text'); // 'text' or 'video'
  const [textAnswer, setTextAnswer] = useState('');
  const [chatFallback, setChatFallback] = useState('Here is your demo video');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, MOV, WebM)');
      return;
    }

    // Validate file size (300MB = 314572800 bytes)
    const maxSize = 300 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 300MB limit`);
      return;
    }

    setVideoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const handleUploadVideo = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('qudemo_id', qudemoId);
      formData.append('company_name', companyName);

      const response = await fetch(getVideoApiUrl('/upload-custom-faq-video'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      setVideoUrl(data.video_url);
      setUploadProgress(100);
      
      console.log('✅ Video uploaded:', data);
    } catch (error) {
      console.error('❌ Video upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setVideoFile(null);
      setVideoPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    // Validation
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (answerType === 'text' && !textAnswer.trim()) {
      alert('Please enter an answer');
      return;
    }

    if (answerType === 'video' && !videoUrl) {
      alert('Please upload a video first');
      return;
    }

    // Prepare FAQ data
    const faqData = {
      question: question.trim(),
      answer_type: answerType,
      answer: answerType === 'text' ? textAnswer.trim() : '',
      video_url: answerType === 'video' ? videoUrl : null,
      chat_fallback: answerType === 'video' ? chatFallback.trim() : '',
      category: 'custom'
    };

    onSave(faqData);
    handleClose();
  };

  const handleClose = () => {
    setQuestion('');
    setAnswerType('text');
    setTextAnswer('');
    setChatFallback('Here is your demo video');
    setVideoFile(null);
    setVideoUrl('');
    setVideoPreview(null);
    setIsUploading(false);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Add Custom FAQ</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like visitors to ask?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {question.length}/200 characters
            </p>
          </div>

          {/* Answer Type Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Answer Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAnswerType('text')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition ${
                  answerType === 'text'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span className="font-medium">Text Answer</span>
              </button>
              <button
                onClick={() => setAnswerType('video')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition ${
                  answerType === 'video'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <VideoCameraIcon className="h-5 w-5" />
                <span className="font-medium">Video Answer</span>
              </button>
            </div>
          </div>

          {/* Text Answer */}
          {answerType === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Provide a detailed answer..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={1000}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {textAnswer.length}/1000 characters
              </p>
            </div>
          )}

          {/* Video Answer */}
          {answerType === 'video' && (
            <div className="space-y-4">
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Video <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {!videoFile ? (
                    <div className="text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Select Video
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        MP4, MOV, WebM up to 300MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Video Preview */}
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          controls
                          className="w-full max-h-64 rounded-lg mb-4"
                        />
                      )}
                      
                      {/* File Info */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{videoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setVideoFile(null);
                            setVideoPreview(null);
                            setVideoUrl('');
                          }}
                          className="ml-4 text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Upload Button */}
                      {!videoUrl && !isUploading && (
                        <button
                          onClick={handleUploadVideo}
                          className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Upload Video
                        </button>
                      )}

                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Uploading...</span>
                            <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Upload Success */}
                      {videoUrl && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700">✅ Video uploaded successfully!</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Chat Fallback Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chat Fallback Text
                </label>
                <input
                  type="text"
                  value={chatFallback}
                  onChange={(e) => setChatFallback(e.target.value)}
                  placeholder="Text to show in chat alongside video"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This text will appear in the chat when the video plays
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !question.trim() ||
              (answerType === 'text' && !textAnswer.trim()) ||
              (answerType === 'video' && !videoUrl)
            }
          >
            Add Custom FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFAQModal;

