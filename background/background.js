chrome.commands.onCommand.addListener((command) => {
  console.log('[YouTube Rabbit] Command received:', command);
  handleCommand(command);
});

async function handleCommand(command) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      return;
    }

    // Check if URL is a YouTube URL (supports all TLDs and youtu.be short URLs)
    let isYouTubeUrl = false;
    try {
      const url = new URL(tab.url);
      const hostname = url.hostname.toLowerCase();

      if (hostname.endsWith('youtube.com') ||
          hostname.endsWith('youtu.be') ||
          hostname.startsWith('youtube.')) {
        isYouTubeUrl = true;
      }
    } catch (e) {
      return;
    }

    if (!isYouTubeUrl) {
      return;
    }

    let message;

    switch (command) {
      case 'speed-up':
        message = { action: 'adjustSpeed', delta: 1 };
        break;

      case 'speed-down':
        message = { action: 'adjustSpeed', delta: -1 };
        break;

      case 'reset-speed':
        message = { action: 'setSpeed', value: 1 };
        break;

      default:
        console.log('[YouTube Rabbit] Unknown command:', command);
        return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, message);
    console.log('[YouTube Rabbit] Response:', response);
  } catch (error) {
    console.error('[YouTube Rabbit] Error handling command:', error);
  }
}

console.log('[YouTube Rabbit] Background script loaded');
