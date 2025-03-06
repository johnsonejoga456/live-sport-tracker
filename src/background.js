let timeSpent = 0;
let isTracking = false;

// Load saved time and settings
chrome.storage.local.get(['timeSpent', 'interval', 'focusHours'], (data) => {
  timeSpent = data.timeSpent || 0;
  const interval = data.interval || 30; // Default: 30 mins
  const focusHours = data.focusHours || { start: '09:00', end: '17:00' };
  scheduleReminder(interval);
});

// Track time when Chrome is in focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isTracking = false;
  } else {
    isTracking = true;
    trackTime();
  }
});

function trackTime() {
  if (!isTracking) return;
  setInterval(() => {
    timeSpent += 1;
    chrome.storage.local.set({ timeSpent });
  }, 1000); // Increment every second
}

// Schedule break reminders
function scheduleReminder(interval) {
  chrome.alarms.create('breakReminder', {
    periodInMinutes: interval
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'breakReminder') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon48.png',
      title: 'Time for a Break!',
      message: 'You’ve been online for a while. Take a break!'
    });
  }
});