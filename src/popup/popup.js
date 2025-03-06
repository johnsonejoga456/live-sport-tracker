document.addEventListener('DOMContentLoaded', () => {
    // Load current settings
    chrome.storage.local.get(['timeSpent', 'interval', 'focusHours'], (data) => {
      document.getElementById('timeSpent').textContent = data.timeSpent || 0;
      document.getElementById('interval').value = data.interval || 30;
      if (data.focusHours) {
        document.getElementById('focusStart').value = data.focusHours.start;
        document.getElementById('focusEnd').value = data.focusHours.end;
      }
    });
  
    // Save settings
    document.getElementById('save').addEventListener('click', () => {
      const interval = parseInt(document.getElementById('interval').value);
      const focusHours = {
        start: document.getElementById('focusStart').value,
        end: document.getElementById('focusEnd').value
      };
      chrome.storage.local.set({ interval, focusHours }, () => {
        chrome.runtime.sendMessage({ action: 'updateInterval', interval });
        alert('Settings saved!');
      });
    });
  });