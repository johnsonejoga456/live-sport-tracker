chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "group-tabs") {
        chrome.tabs.query({ currentWindow: true }, async (tabs) => {
            let tabGroups = {};
            let createdGroups = [];

            for (let tab of tabs) {
                if (tab.url && tab.url.startsWith("http")) {
                    let domain = new URL(tab.url).hostname;
                    if (!tabGroups[domain]) {
                        tabGroups[domain] = [];
                    }
                    tabGroups[domain].push(tab.id);
                }
            }

            try {
                for (let domain in tabGroups) {
                    if (tabGroups[domain].length > 1) {
                        let groupId = await chrome.tabs.group({ tabIds: tabGroups[domain] });
                        let color = getRandomColor();
                        await chrome.tabGroups.update(groupId, { title: domain, color: color });

                        createdGroups.push({ domain, groupId });
                    }
                }

                sendResponse({ message: createdGroups.length > 0 ? "Grouped similar tabs!" : "No groups were created." });
            } catch (error) {
                console.error("Error grouping tabs:", error);
                sendResponse({ message: "Error grouping tabs." });
            }
        });

        return true; // ✅ Keeps the listener alive for async operations
    }

    if (message.action === "name-group") {
        chrome.tabGroups.query({}, async (groups) => {
            if (groups.length > 0) {
                let group = groups.find(g => g.id === message.groupId) || groups[0]; // Pick specified or first group
                
                try {
                    await chrome.tabGroups.update(group.id, { title: message.name, color: "purple" });
                    sendResponse({ message: `Named group: ${message.name}` });
                } catch (error) {
                    console.error("Error updating group:", error);
                    sendResponse({ message: "Failed to update group." });
                }
            } else {
                sendResponse({ message: "No grouped tabs found!" });
            }
        });

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
        

        return true; // ✅ Keeps the listener alive for async operations
    }

    return true; // ✅ General fallback
});

// Function to Get Random Colors
function getRandomColor() {
    let colors = ["blue", "green", "red", "yellow", "purple", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
}
