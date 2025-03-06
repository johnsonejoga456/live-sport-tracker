document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
    loadSessions();
    loadStaleTabs();
  
    document.getElementById('groupTabs').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "groupTabs" }, loadGroups);
    });
  
    document.getElementById('focusMode').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "toggleFocusMode" }, (response) => {
        document.getElementById('focusMode').textContent = `Focus Mode: ${response.focusMode ? 'On' : 'Off'}`;
      });
    });
  
    document.getElementById('saveSession').addEventListener('click', () => {
      const name = document.getElementById('sessionName').value;
      if (name) {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          const session = { name, tabs: tabs.map(t => ({ url: t.url, title: t.title })) };
          chrome.storage.local.get(['sessions'], (data) => {
            const sessions = data.sessions || [];
            sessions.push(session);
            chrome.storage.local.set({ sessions }, loadSessions);
          });
        });
      }
    });
  
    document.getElementById('closeStale').addEventListener('click', () => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const now = Date.now();
        const staleTabs = tabs.filter(t => (now - t.lastAccessed) > 24 * 60 * 60 * 1000);
        if (confirm(`Close ${staleTabs.length} stale tabs?`)) {
          chrome.tabs.remove(staleTabs.map(t => t.id), loadStaleTabs);
        }
      });
    });
  });
  
  function loadGroups() {
    chrome.storage.local.get(['tabGroups'], (data) => {
      const groups = data.tabGroups || {};
      const div = document.getElementById('groups');
      div.innerHTML = '';
      for (const [domain, tabs] of Object.entries(groups)) {
        const details = document.createElement('details');
        details.innerHTML = `
          <summary>${domain} (${tabs.length})</summary>
          <ul>${tabs.map(t => `<li><img src="${t.favIconUrl || ''}" width="16" height="16" onerror="this.style.display='none'"> ${t.title}</li>`).join('')}</ul>
        `;
        div.appendChild(details);
      }
    });
  }
  
  function loadSessions() {
    chrome.storage.local.get(['sessions'], (data) => {
      const sessions = data.sessions || [];
      const ul = document.getElementById('sessions');
      ul.innerHTML = sessions.map((s, i) => `
        <li>${s.name} (${s.tabs.length} tabs)
          <button onclick="restoreSession(${i})">Restore</button>
          <button onclick="deleteSession(${i})">Delete</button>
        </li>
      `).join('');
    });
  }
  
  function loadStaleTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const now = Date.now();
      const staleTabs = tabs.filter(t => (now - t.lastAccessed) > 24 * 60 * 60 * 1000);
      document.getElementById('staleTabs').innerHTML = staleTabs.map(t => `
        <li><img src="${t.favIconUrl || ''}" width="16" height="16" onerror="this.style.display='none'"> ${t.title} (Last: ${new Date(t.lastAccessed).toLocaleString()})</li>
      `).join('');
    });
  }
  
  function restoreSession(index) {
    chrome.storage.local.get(['sessions'], (data) => {
      const session = data.sessions[index];
      session.tabs.forEach(tab => chrome.tabs.create({ url: tab.url }));
    });
  }
  
  function deleteSession(index) {
    chrome.storage.local.get(['sessions'], (data) => {
      data.sessions.splice(index, 1);
      chrome.storage.local.set({ sessions: data.sessions }, loadSessions);
    });
  }