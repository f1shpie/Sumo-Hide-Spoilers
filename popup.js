// popup.js - Fishpie - 13/03/2026
// Handles toggle state for spoiler hiding

document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("toggle");

    // Set default to true if not set yet
    chrome.storage.sync.get(["hideSpoilers"], (result) => {
        if (typeof result.hideSpoilers === "undefined") {
            chrome.storage.sync.set({ hideSpoilers: true }, () => {
                toggle.checked = true;
            });
        } else {
            toggle.checked = result.hideSpoilers === true;
        }
    });

    toggle.addEventListener("change", () => {
        chrome.storage.sync.set({ hideSpoilers: toggle.checked }, () => {
            chrome.tabs.reload();
        });
    });

});