const MIN_SPEED = 0.25;
const MAX_SPEED = 8.0;
const DEFAULT_SPEED = 1.0;
const DEFAULT_STEP = 0.25;

let videoElement = null;
let currentSpeed = DEFAULT_SPEED;
let stepSize = DEFAULT_STEP;
let speedControlInjected = false;
let buttonPosition = 'right-start';

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
  const video = document.querySelector('#movie_player video') ||
    document.querySelector('.html5-main-video') ||
    document.querySelector('video');

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
    setSpeed(DEFAULT_SPEED, false);
  }
}

function saveSpeed(speed) {
  try {
    chrome.storage.local.set({ speed });
  } catch (error) {
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
  const speedDisplay = document.querySelector('.yt-speed-control .speed-display');
  if (speedDisplay) {
    speedDisplay.textContent = formatSpeed(speed);
  }

  const options = document.querySelectorAll('.yt-speed-option');
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

function showSpeedIndicator(speed) {
  const existing = document.querySelector('.yt-speed-indicator');
  if (existing) {
    existing.remove();
  }

  const indicator = document.createElement('div');
  indicator.className = 'yt-speed-indicator';
  indicator.textContent = `Speed: ${formatSpeed(speed)}`;

  Object.assign(indicator.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: '999999',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  });

  document.body.appendChild(indicator);

  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 1500);
}

function repositionButton() {
  try {
    const existingControl = document.querySelector('.yt-speed-control');
    if (existingControl) {
      existingControl.remove();
    }
    const existingDropdown = document.querySelector('.yt-speed-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
    speedControlInjected = false;

    chrome.storage.local.get(['buttonPosition'], (result) => {
      buttonPosition = result && result.buttonPosition ? result.buttonPosition : 'right-start';
      injectSpeedControl();
    });
  } catch (error) {
  }
}

function injectSpeedControl() {
  if (speedControlInjected) return;

  let controls = null;
  let insertBeforeElement = null;

  switch (buttonPosition) {
    case 'left':
      controls = document.querySelector('.ytp-left-controls');
      break;
    case 'right-start':
      controls = document.querySelector('.ytp-right-controls');
      if (controls) {
        insertBeforeElement = controls.firstChild;
      }
      break;
    case 'right-end':
      controls = document.querySelector('.ytp-right-controls');
      break;
    default:
      controls = document.querySelector('.ytp-right-controls');
      if (controls) {
        insertBeforeElement = controls.firstChild;
      }
  }

  if (!controls) {
    setTimeout(injectSpeedControl, 500);
    return;
  }

  if (controls.querySelector('.yt-speed-control')) {
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
  container.className = 'yt-speed-control ytp-button';
  container.style.cssText = `
    position: relative;
    display: inline-flex;
    margin-right: 8px;
  `;

  const button = document.createElement('button');
  button.className = 'ytp-button';
  button.setAttribute('aria-label', 'Playback Speed');
  button.style.cssText = `
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: auto;
  `;

  const speedDisplay = document.createElement('span');
  speedDisplay.className = 'speed-display';
  speedDisplay.textContent = formatSpeed(currentSpeed);

  button.appendChild(speedDisplay);
  container.appendChild(button);

  const tooltip = document.createElement('div');
  tooltip.textContent = 'Scroll to change speed';
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(0, 0, 0, 0.4);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 2147483647;
    font-weight: 500;
    transform: translateX(-50%);
  `;
  document.body.appendChild(tooltip);

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
  document.body.appendChild(dropdown);

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

  document.addEventListener('scroll', () => {
    closeAllDropdowns();
  }, true);

  window.addEventListener('resize', () => {
    closeAllDropdowns();
  });

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

  return container;
}

function createSpeedDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'yt-speed-dropdown';
  dropdown.style.cssText = `
    display: none;
    position: fixed;
    transform: translateY(-100%);
    margin-bottom: 6px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 4px;
    min-width: 80px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.8);
    z-index: 2147483647;
  `;

  const speeds = [8, 4, 3, 2.5, 2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25];

  speeds.forEach(speed => {
    const option = document.createElement('div');
    option.className = 'yt-speed-option';
    option.dataset.speed = speed;
    option.textContent = formatSpeed(speed);
    option.style.cssText = `
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      border-radius: 4px;
      transition: background 0.2s;
      text-align: center;
      color: white;
    `;

    option.addEventListener('mouseenter', () => {
      option.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    option.addEventListener('mouseleave', () => {
      option.style.background = 'transparent';
    });

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
  document.querySelectorAll('.yt-speed-dropdown').forEach(dd => {
    dd.style.display = 'none';
  });
}

function setupMutationObserver() {
  const observer = new MutationObserver(() => {
    findVideoElement();
    if (!speedControlInjected) {
      injectSpeedControl();
    }
  });

  observer.observe(document.body, {
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
