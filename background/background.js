chrome.commands.onCommand.addListener((command) => {
  console.log('[YouTube Rabbit] Command received:', command);
  handleCommand(command);
});

async function handleCommand(command) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url.includes('youtube.com')) {
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
