document.addEventListener('DOMContentLoaded', () => {
  const positionSelect = document.getElementById('positionSelect');

  chrome.storage.local.get(['buttonPosition'], (result) => {
    const savedPosition = result && result.buttonPosition ? result.buttonPosition : 'right-start';
    positionSelect.value = savedPosition;
  });

  positionSelect.addEventListener('change', (e) => {
    const newPosition = e.target.value;
    chrome.storage.local.set({ buttonPosition: newPosition }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
          try {
            chrome.tabs.reload(tabs[0].id);
          } catch (error) {
            console.error('[YouTube Rabbit] Failed to reload tab:', error);
          }
        }
      });
    });
  });
});
