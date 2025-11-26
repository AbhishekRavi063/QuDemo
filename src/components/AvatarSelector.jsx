import React, { useState, useEffect } from 'react';
import { getVideoApiUrl } from '../config/api';
import { CheckCircleIcon, PlayIcon } from '@heroicons/react/24/solid';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

/**
 * AvatarSelector - UI component for selecting HeyGen avatar and voice
 * 
 * @param {object} props
 * @param {boolean} props.enabled - Whether LiveAvatar is enabled
 * @param {function} props.onEnabledChange - Callback when enabled state changes
 * @param {string} props.selectedAvatarId - Currently selected avatar ID
 * @param {function} props.onAvatarChange - Callback when avatar is selected
 * @param {string} props.selectedVoiceId - Currently selected voice ID
 * @param {function} props.onVoiceChange - Callback when voice is selected
 * @param {string} props.quality - Video quality (low, medium, high)
 * @param {function} props.onQualityChange - Callback when quality changes
 */
const AvatarSelector = ({
  enabled = false,
  onEnabledChange,
  selectedAvatarId = null,
  onAvatarChange,
  selectedVoiceId = null,
  onVoiceChange,
  quality = 'medium',
  onQualityChange,
}) => {
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [error, setError] = useState(null);
  const [previewingVoice, setPreviewingVoice] = useState(null);
  
  // Pagination for avatars
  const [avatarPage, setAvatarPage] = useState(0);
  const AVATARS_PER_PAGE = 6;
  
  // Pagination for voices
  const [voicePage, setVoicePage] = useState(0);
  const VOICES_PER_PAGE = 6;

  // Fetch available avatars when component mounts or enabled changes
  useEffect(() => {
    if (enabled) {
      fetchAvatars();
      fetchVoices();
    }
  }, [enabled]);

  const fetchAvatars = async () => {
    try {
      setLoadingAvatars(true);
      setError(null);

      const url = getVideoApiUrl('/liveavatar/avatars');
      console.log('🔍 Fetching avatars from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📋 Avatar API Response:', data);
      console.log('📊 Avatars received:', data.avatars?.length || 0);

      if (data.success && data.avatars) {
        console.log('✅ Setting avatars:', data.avatars.length, 'avatars');
        setAvatars(data.avatars);
        
        // If no avatar selected and avatars available, select first one
        if (!selectedAvatarId && data.avatars.length > 0) {
          console.log('✅ Auto-selecting first avatar:', data.avatars[0].id);
          onAvatarChange(data.avatars[0].id);
        }
      } else {
        console.error('❌ Failed to load avatars:', data);
        setError('Failed to load avatars');
      }
    } catch (err) {
      console.error('❌ Error fetching avatars:', err);
      setError('Could not connect to avatar service');
    } finally {
      setLoadingAvatars(false);
    }
  };

  const fetchVoices = async () => {
    try {
      setLoadingVoices(true);

      const response = await fetch(getVideoApiUrl('/liveavatar/voices'));
      const data = await response.json();

      if (data.success && data.voices) {
        // Filter for English voices only
        const englishVoices = data.voices.filter(v => 
          v.language && v.language.toLowerCase().includes('english')
        );
        setVoices(englishVoices);
        
        // If no voice selected and voices available, select first one
        if (!selectedVoiceId && englishVoices.length > 0) {
          onVoiceChange(englishVoices[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching voices:', err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleVoicePreview = async (voiceId) => {
    setPreviewingVoice(voiceId);
    // In a real implementation, you'd play the preview audio
    // For now, just simulate the preview
    setTimeout(() => {
      setPreviewingVoice(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>🎬</span>
            <span>Live Streaming Avatar</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-normal">
              NEW
            </span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Real-time AI avatar speaks answers instantly (no video generation needed)
          </p>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Configuration (shown when enabled) */}
      {enabled && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Avatar
            </label>
            <p className="text-xs text-blue-600 mb-3 bg-blue-50 border border-blue-200 rounded p-2">
              ℹ️ Select an avatar for <strong>real-time LiveAvatar</strong>. If an avatar isn't compatible, a default streaming avatar will be used automatically.
            </p>
            
            {loadingAvatars ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading avatars...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                {error}
              </div>
            ) : avatars.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-1">⚠️ No streaming avatars available</p>
                <p className="text-xs">Your HeyGen account may not have access to Interactive Avatars. Please check your HeyGen subscription tier or contact support.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {avatars.slice(0, (avatarPage + 1) * AVATARS_PER_PAGE).map((avatar) => (
                    <div
                      key={avatar.id}
                      onClick={() => onAvatarChange(avatar.id)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        selectedAvatarId === avatar.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Avatar Preview */}
                      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                        {avatar.preview_image ? (
                          <img
                            src={avatar.preview_image}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">👤</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Avatar Name */}
                      <div className="p-2 text-center">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {avatar.name}
                        </p>
                        {avatar.gender && (
                          <p className="text-xs text-gray-500">{avatar.gender}</p>
                        )}
                      </div>
                      
                      {/* Selected Indicator */}
                      {selectedAvatarId === avatar.id && (
                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                          <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {avatars.length > AVATARS_PER_PAGE && (
                  <div className="flex items-center justify-center mt-4 space-x-3">
                    {/* Show More Button */}
                    {(avatarPage + 1) * AVATARS_PER_PAGE < avatars.length && (
                      <button
                        onClick={() => setAvatarPage(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Show More Avatars ({Math.min(AVATARS_PER_PAGE, avatars.length - (avatarPage + 1) * AVATARS_PER_PAGE)} more)
                      </button>
                    )}
                    
                    {/* Show Less Button */}
                    {avatarPage > 0 && (
                      <button
                        onClick={() => setAvatarPage(0)}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
                
                {/* Avatar Count Info */}
                <p className="text-xs text-gray-500 text-center mt-2">
                  Showing {Math.min((avatarPage + 1) * AVATARS_PER_PAGE, avatars.length)} of {avatars.length} avatars
                </p>
              </>
            )}
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Voice
            </label>
            
            {loadingVoices ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {voices.slice(0, (voicePage + 1) * VOICES_PER_PAGE).map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => onVoiceChange(voice.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedVoiceId === voice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedVoiceId === voice.id ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {voice.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {voice.gender} • {voice.language}
                          </p>
                        </div>
                      </div>
                      
                      {/* Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoicePreview(voice.id);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                        title="Preview voice"
                      >
                        {previewingVoice === voice.id ? (
                          <SpeakerWaveIcon className="w-5 h-5 text-blue-600 animate-pulse" />
                        ) : (
                          <PlayIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Voice Pagination Controls */}
                {voices.length > VOICES_PER_PAGE && (
                  <div className="flex items-center justify-center mt-4 space-x-3">
                    {/* Show More Button */}
                    {(voicePage + 1) * VOICES_PER_PAGE < voices.length && (
                      <button
                        onClick={() => setVoicePage(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Show More Voices ({Math.min(VOICES_PER_PAGE, voices.length - (voicePage + 1) * VOICES_PER_PAGE)} more)
                      </button>
                    )}
                    
                    {/* Show Less Button */}
                    {voicePage > 0 && (
                      <button
                        onClick={() => setVoicePage(0)}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
                
                {/* Voice Count Info */}
                <p className="text-xs text-gray-500 text-center mt-2">
                  Showing {Math.min((voicePage + 1) * VOICES_PER_PAGE, voices.length)} of {voices.length} voices
                </p>
              </>
            )}
          </div>

          {/* Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Streaming Quality
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => onQualityChange(q)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    quality === q
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold capitalize">{q}</div>
                    <div className="text-xs mt-1 text-gray-500">
                      {q === 'low' && '360p'}
                      {q === 'medium' && '720p'}
                      {q === 'high' && '1080p'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Medium quality recommended for best balance of quality and performance
            </p>
          </div>

          {/* Benefits Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              ✨ Benefits of Live Streaming Avatar
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✅ Instant responses (no video generation wait)</li>
              <li>✅ Dynamic content (avatar speaks any answer)</li>
              <li>✅ Zero storage cost (no video files)</li>
              <li>✅ Always up-to-date (changes take effect immediately)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Pre-recorded Info (when disabled) */}
      {!enabled && (
        <div className="pt-4 border-t border-gray-200">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Traditional Mode:</strong> Avatars will be generated as video files when you save FAQs.
              This takes time but works offline.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              💡 Try Live Streaming Avatar for instant responses!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;

