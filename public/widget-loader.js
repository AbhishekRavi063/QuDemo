/**
 * Qudemo Widget Loader
 * This script dynamically loads a Qudemo widget as an iframe on any website
 */

(function() {
  'use strict';

  // Get the script tag that loaded this file
  const currentScript = document.currentScript || document.querySelector('script[src*="widget-loader.js"]');
  
  if (!currentScript) {
    console.error('Qudemo Widget: Could not find script tag');
    return;
  }

  // Extract configuration from data attributes
  const qudemoId = currentScript.getAttribute('data-qudemo-id');
  const companyName = currentScript.getAttribute('data-company-name');
  const theme = currentScript.getAttribute('data-theme') || 'light';
  const position = currentScript.getAttribute('data-position') || 'bottom-right';
  const size = currentScript.getAttribute('data-size') || 'medium';

  if (!qudemoId || !companyName) {
    console.error('Qudemo Widget: Missing required attributes (data-qudemo-id, data-company-name)');
    return;
  }

  // Get the base URL from the script src
  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

  // Size configurations
  const sizeConfig = {
    small: { width: '300px', height: '500px' },
    medium: { width: '350px', height: '600px' },
    large: { width: '400px', height: '650px' }
  };

  const widgetSize = sizeConfig[size] || sizeConfig.medium;

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = `qudemo-widget-container-${qudemoId}`;
  widgetContainer.style.cssText = `
    position: fixed;
    ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    bottom: 20px;
    width: ${widgetSize.width};
    max-width: calc(100vw - 40px);
    height: ${widgetSize.height};
    max-height: calc(100vh - 40px);
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    transition: all 0.3s ease;
  `;

  // Create iframe
  const iframe = document.createElement('iframe');
  const embedUrl = `${baseUrl}/widget-embed/${qudemoId}?theme=${theme}&position=${position}&size=${size}&company=${encodeURIComponent(companyName)}`;
  
  iframe.src = embedUrl;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 16px;
  `;
  iframe.allow = 'microphone';
  iframe.title = 'Qudemo Widget';

  // Add iframe to container
  widgetContainer.appendChild(iframe);

  // Add container to page when DOM is ready
  function init() {
    if (document.body) {
      document.body.appendChild(widgetContainer);
      console.log('Qudemo Widget: Loaded successfully');
    } else {
      setTimeout(init, 100);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle mobile responsiveness
  function handleResize() {
    if (window.innerWidth < 768) {
      widgetContainer.style.width = 'calc(100vw - 40px)';
      widgetContainer.style.maxWidth = '350px';
      widgetContainer.style.height = 'calc(100vh - 80px)';
      widgetContainer.style.maxHeight = '600px';
    } else {
      widgetContainer.style.width = widgetSize.width;
      widgetContainer.style.height = widgetSize.height;
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // Expose API for programmatic control
  window.QudemoWidget = window.QudemoWidget || {};
  window.QudemoWidget[qudemoId] = {
    show: function() {
      widgetContainer.style.display = 'block';
    },
    hide: function() {
      widgetContainer.style.display = 'none';
    },
    toggle: function() {
      widgetContainer.style.display = widgetContainer.style.display === 'none' ? 'block' : 'none';
    },
    destroy: function() {
      if (widgetContainer && widgetContainer.parentNode) {
        widgetContainer.parentNode.removeChild(widgetContainer);
      }
    }
  };

})();

