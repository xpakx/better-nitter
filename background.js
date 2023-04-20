const tabs = typeof browser !== "undefined" ? browser.tabs : chrome.tabs;
const runtime = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "open_tab") {
        tabs.create({ url: message.url, active: false });
    }
});