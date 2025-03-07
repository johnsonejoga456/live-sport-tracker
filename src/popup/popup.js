document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("groupTabs").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "group-tabs" });
    });
  
    document.getElementById("closeStaleTabs").addEventListener("click", () => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        let staleTabs = tabs.filter((tab) => tab.url.includes("wikipedia") || tab.url.includes("stackoverflow"));
  
        chrome.notifications.create({
          type: "basic",
          iconUrl: "../icons/icon48.png",
          title: "TabTidy",
          message: `Closed ${staleTabs.length} stale tabs`
        });
  
        staleTabs.forEach((tab) => chrome.tabs.remove(tab.id));
      });
    });
  });
  