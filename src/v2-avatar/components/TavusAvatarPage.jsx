import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TavusAvatarWidget } from './TavusAvatarWidget';
import styles from './TavusAvatarPage.module.css';

/**
 * TavusAvatarPage - Fullscreen Tavus avatar page for /v2-avatar route
 *
 * Equivalent to ExtendedAvatarPage but using Tavus/Daily.co instead of HeyGen/LiveKit
 */
const TavusAvatarPage = () => {
  const { personaId } = useParams();
  const [isStarted, setIsStarted] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = () => {
    setIsLoading(true);
    setIsStarted(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleDisconnect = () => {
    setIsStarted(false);
    setIsLoading(false);
    setSessionKey(prev => prev + 1);
  };

  return (
    <div className={styles.container}>
      {!isStarted ? (
        <div className={styles.landingContainer}>
          {/* Avatar Preview Image */}
          <div
            className={styles.avatarPreview}
            style={{ backgroundImage: 'url(/tavus-avatar.jpg)' }}
          />

          <div className={styles.textContainer}>
            <h1 className={styles.title}>Qudemo AI Agent</h1>
            <p className={styles.subtitle}>Click below to start your conversation</p>
          </div>

          <button
            onClick={handleStartConversation}
            className={styles.startButton}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Start Conversation'}
          </button>
        </div>
      ) : (
        <div className={styles.widgetContainer}>
          <div className="tavus-avatar-wrapper">
            <TavusAvatarWidget key={sessionKey} onDisconnect={handleDisconnect} autoExpand={true} personaId={personaId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TavusAvatarPage;
