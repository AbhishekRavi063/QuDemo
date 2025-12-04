import React from 'react';

/**
 * Mobile Landing Page (Epic 1 - Foundation)
 *
 * This is a placeholder component for the mobile landing page.
 * Will be fully implemented in Epic 2 with:
 * - Session management
 * - Audio unlock
 * - Avatar widget integration
 *
 * For now, it just confirms mobile routing is working.
 */
function MobileLandingPage() {
  return (
    <div
      style={{
        height: '100dvh', // Mobile-optimized viewport height (fallback: 100vh via CSS)
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '600' }}>
          🎉 Mobile Route Working!
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
          You've been successfully routed to the mobile version.
        </p>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '24px',
          }}
        >
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>
            <strong>Epic 1: Foundation</strong> ✅
          </p>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>
            Mobile detection and routing completed.
            <br />
            Next: Epic 2 - Core Session Management
          </p>
        </div>
      </div>
    </div>
  );
}

export default MobileLandingPage;
