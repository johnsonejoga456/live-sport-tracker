let focusMode = false;
let hiddenTabs = [];

chrome.contextMenus.create({
  id: "group-tabs",
  title: "Group Tabs by Domain",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "group-tabs") {
    groupTabsByDomain();
  }
});

function groupTabsByDomain() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const groups = {};
    tabs.forEach((tab) => {
      const domain = new URL(tab.url).hostname;
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(tab);
    });

    chrome.storage.local.set({ tabGroups: groups });
  });
}

// Focus Mode
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleFocusMode") {
    focusMode = !focusMode;
    if (focusMode) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const activeTab = tabs.find(t => t.active);
        hiddenTabs = tabs.filter(t => !t.active).map(t => t.id);
        hiddenTabs.forEach(tabId => chrome.tabs.hide(tabId));
        sendResponse({ focusMode: true });
      });
    } else {
      hiddenTabs.forEach(tabId => chrome.tabs.show(tabId));
      hiddenTabs = [];
      sendResponse({ focusMode: false });
    }
    return true; // Keep message channel open for async response
  }
});