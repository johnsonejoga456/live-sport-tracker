document.addEventListener("DOMContentLoaded", () => {
    const groupTabsBtn = document.getElementById("groupTabs");
    const nameGroupBtn = document.getElementById("nameGroup");
    const closeInactiveTabsBtn = document.getElementById("closeInactiveTabs");
    const undoCloseBtn = document.getElementById("undoClose");
    const showGroupsBtn = document.getElementById("show-groups"); // Added
    const status = document.getElementById("status");
    const groupListDiv = document.getElementById("group-list");

    function updateStatus(message) {
        status.innerText = message;
        setTimeout(() => status.innerText = "", 4000);
    }

    groupTabsBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "group-tabs" }, (response) => {
            updateStatus(response?.message || "Grouped Similar Tabs!");
        });
    });

    nameGroupBtn.addEventListener("click", () => {
        let groupName = prompt("Enter a name for this tab group:");
        if (groupName) {
            chrome.runtime.sendMessage({ action: "name-group", name: groupName }, (response) => {
                updateStatus(response?.message || `Group named: ${groupName}`);
            });
        }
    });

    closeInactiveTabsBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "close-inactive-tabs" }, (response) => {
            updateStatus(response?.message || "Closed inactive tabs!");
        });
    });

    undoCloseBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "undo-close" }, (response) => {
            updateStatus(response?.message || "Restored recently closed tab!");
        });
    });

    // Integrated "show-groups" functionality with better handling
    showGroupsBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "get-groups" }, (response) => {
            groupListDiv.innerHTML = ""; // Clear previous list
            
            if (response?.groups?.length > 0) {
                response.groups.forEach(group => {
                    let groupItem = document.createElement("div");
                    groupItem.textContent = `📂 ${group.title} (Color: ${group.color})`;
                    groupListDiv.appendChild(groupItem);
                });
            } else {
                groupListDiv.textContent = "No tab groups found!";
            }
        });
    });
});
