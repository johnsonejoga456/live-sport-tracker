chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "group-tabs") {
        chrome.tabs.query({ currentWindow: true }, async (tabs) => {
            let tabGroups = {};

            for (let tab of tabs) {
                if (tab.url && tab.url.startsWith("http")) {
                    let domain = new URL(tab.url).hostname;
                    if (!tabGroups[domain]) {
                        tabGroups[domain] = [];
                    }
                    tabGroups[domain].push(tab.id);
                }
            }

            for (let domain in tabGroups) {
                if (tabGroups[domain].length > 1) {
                    let groupId = await chrome.tabs.group({ tabIds: tabGroups[domain] });
                    let color = getRandomColor();
                    chrome.tabGroups.update(groupId, { title: domain, color: color });
                }
            }

            sendResponse({ message: "Grouped similar tabs!" });
        });
        return true; // ✅ Keeps the listener alive for async operations
    }

    if (message.action === "name-group") {
        chrome.tabGroups.query({}, (groups) => {
            if (groups.length > 0) {
                let groupId = groups[0].id; // Pick first group
                chrome.tabGroups.update(groupId, { title: message.name, color: "purple" }, () => {
                    sendResponse({ message: `Named group: ${message.name}` });
                });
            } else {
                sendResponse({ message: "No grouped tabs found!" });
            }
        });
        return true; // ✅ Keeps the listener alive for async operations
    }

    if (message.action === "get-groups") {
        chrome.tabGroups.query({}, (groups) => {
            if (groups.length > 0) {
                let groupList = groups.map(group => ({
                    id: group.id,
                    title: group.title || "Unnamed Group",
                    color: group.color || "gray"
                }));
                sendResponse({ groups: groupList });
            } else {
                sendResponse({ groups: [] });
            }
        });
        return true; // ✅ Keeps the listener alive for async operations
    }

    return true; // ✅ General fallback
});

// Function to Get Random Colors
function getRandomColor() {
    let colors = ["blue", "green", "red", "yellow", "purple", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
}
