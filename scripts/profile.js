let items = [];
let active = null;
let gPressed = false;

const Modes = {
    Normal: "normal",
    Timeline: "timeline",
    Visual: "visual"
}

let mode = Modes.Timeline;
const runtime = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

document.addEventListener("DOMContentLoaded", () => {
    items = document.querySelectorAll(".timeline-item");
    focusOnMain();

    fetch(chrome.runtime.getURL("styles/style.css"))
        .then(response => response.text())
        .then(css => {
            var style = document.createElement("style");
            style.innerHTML = css;
            document.head.insertAdjacentElement('beforeend', style);
        });

    addChangeObserver();
});

function addChangeObserver() {
    var observer = new MutationObserver(function (mutations) {
        const change = mutations.some((mutation) => mutation.addedNodes.length);
        if (change) {
            items = document.querySelectorAll(".timeline-item");
        }
    });
    const timeline = document.querySelector(".timeline");
    if (timeline) {
        observer.observe(timeline, { childList: true });
    } else {
        const conv = document.querySelector(".conversation");
        if (conv) {
            observer.observe(conv, { childList: true, subtree: true });
        }
    }
}

function focusOnMain() {
    const mainTweet = document.querySelector(".main-tweet");
    const tweet = mainTweet ? mainTweet : document.querySelector("#m");
    if (!tweet) {
        return;
    }
    const item = tweet.querySelector(".timeline-item");
    for (let i = 0; i < items.length; i++) {
        if (item === items[i]) {
            selectItem(i);
            return;
        }
    }
}


function next() {
    selectItem(active != null ? active + 1 : 0);
}

function prev() {
    selectItem(active != null ? active - 1 : 0);
}


function selectItem(next) {
    if (next < 0 || next >= items.length) {
        return;
    }
    if (active != null) {
        const prevItem = items[active];
        prevItem.classList.remove('selected');
    }

    active = next;
    const item = items[active];
    item.classList.add('selected');
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deSelect() {
    const item = items[active];
    item.classList.remove('selected');
    active = null;
}

function goToLink(selector, newTab = false) {
    const link = items[active].querySelector(selector);
    if (!link) {
        return;
    }
    const href = link.getAttribute('href');
    if (newTab) {
        const resolvedUrl = new URL(href, window.location.href);
        runtime.sendMessage({ action: "open_tab", url: resolvedUrl });
    } else {
        window.location.href = href;
    }
}

function goToTweet(newTab = false) {
    goToLink('.tweet-link', newTab);
    //TODO: .more-replies item
}

function goToProfile(newTab = false) {
    goToLink('.fullname', newTab);
}

function goToContainer(newTab = false) {
    goToLink('.card-container', newTab);
}

function goToQuote(newTab = false) {
    goToLink('.quote-link', newTab);
}

let number = 0;

document.addEventListener('keydown', function (event) {
    if (mode === Modes.Timeline) {
        doTimelineCommand(event);
    } else if (mode === Modes.Visual) {
        doVisualCommand(event);
    } else if (mode == Modes.Normal) {

    }

    if (/^[0-9]$/.test(event.key)) {
        number = (number * 10) + Number(event.key);
        console.log(number);
    } else {
        number = 0;
    }
});

function doTimelineCommand(event) {
    if (event.key === 'k') {
        prev();
    } else if (event.key === 'j') {
        next();
    } else if (event.key === ' ' && active != null) {
        event.preventDefault();
        goToTweet(event.altKey);
    } else if (event.key === 'a' && active != null) {
        goToProfile(event.altKey);
    } else if (event.key === 'c' && active != null) {
        goToContainer(event.altKey);
    } else if (event.key === 'q' && active != null) {
        goToQuote(event.altKey);
    } else if (event.key === 'Escape' && active != null) {
        deSelect();
    } else if (event.key === 'g' && gPressed) {
        selectItem(0);
    } else if (event.key === 'g' && !gPressed) {
        gPressed = true;
    } else if (event.key === 'G') {
        selectItem(items.length - 1);
    } else if (event.key === 'v' && active != null) {
        event.preventDefault();
        enterVisualMode();
    }

    if (gPressed && event.key !== 'g') {
        gPressed = false;
    }
}

let move = true;

function doVisualCommand(event) {
    if (event.keyCode < 37 || event.keyCode > 40) {
        event.preventDefault();
    }
    if (event.key === 'Escape' && active != null) {
        exitVisualMode();
    } else if (event.key == ' ') {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const parentNode = range.startContainer.parentNode;

        if (parentNode.tagName === 'A') {
            const href = parentNode.getAttribute('href');
            if (event.altKey) {
                const resolvedUrl = new URL(href, window.location.href);
                runtime.sendMessage({ action: "open_tab", url: resolvedUrl });
            } else {
                window.location.href = href;
            }
        }
    } else if (event.key === "l") {
        moveCaret("forward", "character");
    } else if (event.key === "h") {
        moveCaret("backward", "character");
    } else if (event.key === "j") {
        moveCaret("forward", "line");
    } else if (event.key === "k") {
        moveCaret("backward", "line");
    } else if (event.key === "v") {
        move = !move;
    } else if (event.key === "y") {
        const selectionText = window.getSelection().toString();
        if (selectionText) {
            navigator.clipboard.writeText(selectionText);
        }
        exitVisualMode();
    }
}

function moveCaret(direction, granularity) {
    const selection = window.getSelection();
    if (number == 0) {
        selection.modify(move ? "move" : "extend", direction, granularity);
    } else {
        Array(number).fill().forEach(() => {
            selection.modify(move ? "move" : "extend", direction, granularity);
        });
    }
}

function exitVisualMode() {
    move = true;
    mode = Modes.Timeline;
    const teetContent = items[active].querySelector(".tweet-content");
    teetContent.contentEditable = false;
    teetContent.blur();
}

function enterVisualMode() {
    mode = Modes.Visual;
    const tweetContent = items[active].querySelector(".tweet-content");
    tweetContent.contentEditable = true;
    tweetContent.setAttribute("spellcheck", "false");
    tweetContent.focus();
}

function doNormalCommand(event) {

}