let items = [];
let active = null;

document.addEventListener("DOMContentLoaded", () => {
    items = document.querySelectorAll(".timeline-item");
    //TODO: set item under .main-tweet / #m as active if exist

    fetch(chrome.runtime.getURL("styles/style.css"))
        .then(response => response.text())
        .then(css => {
            var style = document.createElement("style");
            style.innerHTML = css;
            document.head.insertAdjacentElement('beforeend', style);
        });
});


function next() {
    selectItem(active != null ? active + 1 : 0);
}

function prev() {
    selectItem(active != null ? active - 1 : 0);
}


function selectItem(next) {
    if (active != null) {
        const prevItem = items[active];
        prevItem.classList.remove('selected');
    }

    active = next >= 0 ? next % items.length : items.length - 1;
    const item = items[active];
    item.classList.add('selected');
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function goToLink(selector, newTab = false) {
    const link = items[active].querySelector(selector);
    if (!link) {
        return;
    }
    const href = link.getAttribute('href');
    if (newTab) {
        window.open(href, '_blank');
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

document.addEventListener('keydown', function (event) {
    if (event.key === 'w') {
        prev();
    } else if (event.key === 's') {
        next();
    } else if (event.key === 'Enter' && active != null) {
        goToTweet(event.altKey);
    } else if (event.key === 'a' && active != null) {
        goToProfile(event.altKey);
    }
});