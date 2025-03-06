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
        const staleTabs = tabs.filter(t => (now - t.lastAccessed) > 24 * 60 * 60 * 1000); // 24 hours
        chrome.tabs.remove(staleTabs.map(t => t.id), loadStaleTabs);
      });
    });
  });
  
  function loadGroups() {
    chrome.storage.local.get(['tabGroups'], (data) => {
      const groups = data.tabGroups || {};
      const div = document.getElementById('groups');
      div.innerHTML = '';
      for (const [domain, tabs] of Object.entries(groups)) {
        const group = document.createElement('div');
        group.innerHTML = `<h3>${domain} (${tabs.length})</h3><ul>${tabs.map(t => `<li>${t.title}</li>`).join('')}</ul>`;
        div.appendChild(group);
      }
    });
  }
  
  function loadSessions() {
    chrome.storage.local.get(['sessions'], (data) => {
      const sessions = data.sessions || [];
      const ul = document.getElementById('sessions');
      ul.innerHTML = '';
      sessions.forEach((session, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${session.name} (${session.tabs.length} tabs)
          <button onclick="restoreSession(${index})">Restore</button>
          <button onclick="deleteSession(${index})">Delete</button>
        `;
        ul.appendChild(li);
      });
    });
  }
  
  function loadStaleTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const now = Date.now();
      const staleTabs = tabs.filter(t => (now - t.lastAccessed) > 24 * 60 * 60 * 1000); // 24 hours
      const ul = document.getElementById('staleTabs');
      ul.innerHTML = staleTabs.map(t => `<li>${t.title} (Last accessed: ${new Date(t.lastAccessed).toLocaleString()})</li>`).join('');
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