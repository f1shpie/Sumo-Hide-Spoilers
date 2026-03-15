document.addEventListener("DOMContentLoaded", () => {

    const toggle = document.getElementById("toggle");
    const openBasho = document.getElementById("openBasho");

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

    openBasho.addEventListener("click", () => {
        chrome.tabs.create({
            url: "https://www.sumo.or.jp/EnHonbashoMain"
        });
    });

});