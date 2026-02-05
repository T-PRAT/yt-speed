(function() {
  'use strict';

  const SELECTORS = {
    VIDEO_PRIMARY: '#movie_player video',
    VIDEO_FALLBACK_1: '.html5-main-video',
    VIDEO_FALLBACK_2: 'video',
    CONTROLS_LEFT: '.ytp-left-controls',
    CONTROLS_RIGHT: '.ytp-right-controls',
    SPEED_CONTROL: '.yt-speed-control',
    SPEED_DISPLAY: '.yt-speed-control .speed-display',
    SPEED_DROPDOWN: '.yt-speed-dropdown',
    SPEED_OPTION: '.yt-speed-option',
    PLAYER_CONTAINER: '#movie_player'
  };

  const MIN_SPEED = 0.25;
  const MAX_SPEED = 8.0;
  const DEFAULT_SPEED = 1.0;
  const DEFAULT_STEP = 0.25;

  let videoElement = null;
let currentSpeed = DEFAULT_SPEED;
let stepSize = DEFAULT_STEP;
let speedControlInjected = false;
let buttonPosition = 'right-start';
let activeTooltip = null;
let activeDropdown = null;
let globalScrollListener = null;
let globalResizeListener = null;

function init() {
  findVideoElement();
  setupStorage(() => {
    setupMutationObserver();
    setupMessageListener();
    setupKeyboardShortcuts();
    injectSpeedControl();
  });
}

function findVideoElement() {
  const video = document.querySelector(SELECTORS.VIDEO_PRIMARY) ||
    document.querySelector(SELECTORS.VIDEO_FALLBACK_1) ||
    document.querySelector(SELECTORS.VIDEO_FALLBACK_2);

  if (video && video !== videoElement) {
    videoElement = video;
    loadSavedSpeed();
    videoElement.addEventListener('ratechange', handleSpeedChange);
  }
}

function setupStorage(callback) {
  try {
    chrome.storage.local.get(['stepSize', 'buttonPosition'], (result) => {
      stepSize = result && result.stepSize ? result.stepSize : DEFAULT_STEP;
      buttonPosition = result && result.buttonPosition ? result.buttonPosition : 'right-start';
      if (callback) callback();
    });
  } catch (error) {
    console.error('[YouTube Rabbit] Storage setup failed:', error);
    if (callback) callback();
  }
}

function loadSavedSpeed() {
  try {
    chrome.storage.local.get(['speed'], (result) => {
      const savedSpeed = result && result.speed ? result.speed : DEFAULT_SPEED;
      setSpeed(savedSpeed, false);
    });
  } catch (error) {
    console.error('[YouTube Rabbit] Failed to load saved speed:', error);
    setSpeed(DEFAULT_SPEED, false);
  }
}

function saveSpeed(speed) {
  try {
    chrome.storage.local.set({ speed });
  } catch (error) {
    console.error('[YouTube Rabbit] Failed to save speed:', error);
  }
}

function setSpeed(speed, save = true) {
  if (!videoElement) return;

  speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
  videoElement.playbackRate = speed;
  currentSpeed = speed;

  updateSpeedDisplay(speed);

  if (save) {
    saveSpeed(speed);
  }
}

function adjustSpeed(delta) {
  const newSpeed = currentSpeed + (delta * stepSize);
  setSpeed(newSpeed);
}

function handleSpeedChange() {
  if (videoElement) {
    currentSpeed = videoElement.playbackRate;
    updateSpeedDisplay(currentSpeed);
  }
}

function updateSpeedDisplay(speed) {
  const speedDisplay = document.querySelector(SELECTORS.SPEED_DISPLAY);
  if (speedDisplay) {
    speedDisplay.textContent = formatSpeed(speed);
  }

  const options = document.querySelectorAll(SELECTORS.SPEED_OPTION);
  options.forEach(option => {
    const optionSpeed = parseFloat(option.dataset.speed);
    if (Math.abs(optionSpeed - speed) < 0.01) {
      option.style.background = 'rgba(255, 255, 255, 0.15)';
    } else {
      option.style.background = 'transparent';
    }
  });
}

function formatSpeed(speed) {
  return speed === Math.floor(speed) ? `${Math.floor(speed)}x` : `${speed.toFixed(2)}x`;
}

function cleanupOrphanedElements() {
  // Remove tracked tooltip and dropdown
  if (activeTooltip && activeTooltip.parentNode) {
    activeTooltip.remove();
  }
  if (activeDropdown && activeDropdown.parentNode) {
    activeDropdown.remove();
  }

  // Clear references
  activeTooltip = null;
  activeDropdown = null;

  // Clean up global event listeners
  if (globalScrollListener) {
    document.removeEventListener('scroll', globalScrollListener, true);
    globalScrollListener = null;
  }
  if (globalResizeListener) {
    window.removeEventListener('resize', globalResizeListener);
    globalResizeListener = null;
  }

  // Also remove any orphaned dropdowns (fallback)
  const dropdowns = document.querySelectorAll(SELECTORS.SPEED_DROPDOWN);
  dropdowns.forEach(dd => dd.remove());

  // Remove any orphaned tooltips (fallback)
  const tooltips = document.querySelectorAll('[data-yt-speed-extension="tooltip"]');
  tooltips.forEach(tt => tt.remove());
}

function repositionButton() {
  try {
    cleanupOrphanedElements();
    const existingControl = document.querySelector(SELECTORS.SPEED_CONTROL);
    if (existingControl) {
      existingControl.remove();
    }
    speedControlInjected = false;

    chrome.storage.local.get(['buttonPosition'], (result) => {
      buttonPosition = result && result.buttonPosition ? result.buttonPosition : 'right-start';
      injectSpeedControl();
    });
  } catch (error) {
    console.error('[YouTube Rabbit] Failed to reposition button:', error);
  }
}

function injectSpeedControl() {
  // Clean up any orphaned elements first
  cleanupOrphanedElements();

  if (speedControlInjected) return;

  // Verify video element exists before injecting
  if (!videoElement) {
    setTimeout(injectSpeedControl, 500);
    return;
  }

  let controls = null;
  let insertBeforeElement = null;

  switch (buttonPosition) {
    case 'left':
      controls = document.querySelector(SELECTORS.CONTROLS_LEFT);
      break;
    case 'right-start':
      controls = document.querySelector(SELECTORS.CONTROLS_RIGHT);
      if (controls) {
        insertBeforeElement = controls.firstChild;
      }
      break;
    case 'right-end':
      controls = document.querySelector(SELECTORS.CONTROLS_RIGHT);
      break;
    default:
      controls = document.querySelector(SELECTORS.CONTROLS_RIGHT);
      if (controls) {
        insertBeforeElement = controls.firstChild;
      }
  }

  if (!controls) {
    setTimeout(injectSpeedControl, 500);
    return;
  }

  if (controls.querySelector(SELECTORS.SPEED_CONTROL)) {
    speedControlInjected = true;
    return;
  }

  const speedControl = createSpeedControl();

  try {
    if (buttonPosition === 'left') {
      controls.appendChild(speedControl);
    } else if (insertBeforeElement && controls.contains(insertBeforeElement)) {
      controls.insertBefore(speedControl, insertBeforeElement);
    } else {
      controls.appendChild(speedControl);
    }
  } catch (error) {
    controls.appendChild(speedControl);
  }

  speedControlInjected = true;

  updateSpeedDisplay(currentSpeed);
}

function createSpeedControl() {
  const container = document.createElement('div');
  container.className = 'yt-speed-control';

  const button = document.createElement('button');
  button.className = 'ytp-button';
  button.setAttribute('aria-label', 'Playback Speed');

  const speedDisplay = document.createElement('span');
  speedDisplay.className = 'speed-display';
  speedDisplay.textContent = formatSpeed(currentSpeed);

  button.appendChild(speedDisplay);
  container.appendChild(button);

  const tooltip = document.createElement('div');
  tooltip.textContent = 'Scroll to change speed';
  tooltip.dataset.ytSpeedExtension = 'tooltip';

  const updateTooltipPosition = () => {
    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 30}px`;
  };

  button.addEventListener('mouseenter', () => {
    updateTooltipPosition();
    tooltip.style.opacity = '1';
  });

  button.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });

  const dropdown = createSpeedDropdown();

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    tooltip.style.opacity = '0';
    const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
    closeAllDropdowns();

    if (isHidden) {
      const rect = button.getBoundingClientRect();
      dropdown.style.top = `${rect.top}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      closeAllDropdowns();
    }
  });

  // Clean up previous global listeners if they exist
  if (globalScrollListener) {
    document.removeEventListener('scroll', globalScrollListener, true);
  }
  if (globalResizeListener) {
    window.removeEventListener('resize', globalResizeListener);
  }

  // Create and store new listeners
  globalScrollListener = () => closeAllDropdowns();
  globalResizeListener = () => closeAllDropdowns();

  document.addEventListener('scroll', globalScrollListener, true);
  window.addEventListener('resize', globalResizeListener);

  button.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY < 0) {
      adjustSpeed(1);
    } else {
      adjustSpeed(-1);
    }
  });

  button.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSpeed(1.0);
  });

  button.addEventListener('mousedown', (e) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      setSpeed(1.0);
    }
  });

  // Store references for cleanup
  activeTooltip = tooltip;
  activeDropdown = dropdown;

  // Append to body only after container is successfully added
  document.body.appendChild(tooltip);
  document.body.appendChild(dropdown);

  return container;
}

function createSpeedDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'yt-speed-dropdown';

  const speeds = [8, 4, 3, 2.5, 2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25];

  speeds.forEach(speed => {
    const option = document.createElement('div');
    option.className = 'yt-speed-option';
    option.dataset.speed = speed;
    option.textContent = formatSpeed(speed);

    option.addEventListener('click', (e) => {
      e.stopPropagation();
      setSpeed(speed);
      dropdown.style.display = 'none';
    });

    dropdown.appendChild(option);
  });

  return dropdown;
}

function closeAllDropdowns() {
  document.querySelectorAll(SELECTORS.SPEED_DROPDOWN).forEach(dd => {
    dd.style.display = 'none';
  });
}

function setupMutationObserver() {
  const observer = new MutationObserver(() => {
    const hadVideo = !!videoElement;
    findVideoElement();

    // If video element disappeared, clean up all UI elements
    if (hadVideo && !videoElement) {
      cleanupOrphanedElements();
      speedControlInjected = false;
    }

    // Only inject if we have a video and no control is injected
    if (videoElement && !speedControlInjected) {
      injectSpeedControl();
    }
  });

  // Target the player container instead of entire document for better performance
  const playerContainer = document.querySelector(SELECTORS.PLAYER_CONTAINER) || document.body;
  observer.observe(playerContainer, {
    childList: true,
    subtree: true
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );

    if (isInputFocused) return;

    if (e.key === ',' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      adjustSpeed(-1);
    }

    if (e.key === '.' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      adjustSpeed(1);
    }
  });
}

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'setSpeed':
        setSpeed(message.value);
        sendResponse({ success: true, speed: currentSpeed });
        break;

      case 'adjustSpeed':
        adjustSpeed(message.delta);
        sendResponse({ success: true, speed: currentSpeed });
        break;

      case 'getSpeed':
        sendResponse({ success: true, speed: currentSpeed });
        break;

      case 'repositionButton':
        repositionButton();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }

    return true;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
