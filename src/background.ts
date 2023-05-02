const br = typeof browser !== "undefined" ? browser : chrome;

br.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "open_tab") {
        br.tabs.create({ url: message.url, active: false });
    }
});