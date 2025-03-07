chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "group-tabs") {
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
      let tabGroups = {};

      tabs.forEach((tab) => {
        // Check if tab.url is valid
        if (tab.url && tab.url.startsWith("http")) {
          try {
            let domain = new URL(tab.url).hostname;

            if (!tabGroups[domain]) {
              tabGroups[domain] = [];
            }
            tabGroups[domain].push(tab.id);
          } catch (error) {
            console.warn("Invalid URL: ", tab.url);
          }
        }
      });

      for (let domain in tabGroups) {
        if (tabGroups[domain].length > 1) {
          await chrome.tabs.group({ tabIds: tabGroups[domain] });
        }
      }

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon32.png",
        title: "TabTidy",
        message: "Tabs grouped successfully 🔥"
      });
    });

    sendResponse({ status: "done" });
    return true;
  }
});
