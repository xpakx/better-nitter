let items = [];
let active = null;

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
});

function focusOnMain() {
    const mainTweet = document.querySelector(".main-tweet");
    const tweet = mainTweet ? mainTweet : document.querySelector("#m");
    if(!tweet) {
        return;
    }
    const item = tweet.querySelector(".timeline-item");
    for(let i = 0; i < items.length; i++) {
        if(item === items[i]) {
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
    if (active != null) {
        const prevItem = items[active];
        prevItem.classList.remove('selected');
    }

    active = next >= 0 ? next % items.length : items.length - 1;
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

function goToContainer(newTab = false) {
    goToLink('.card-container', newTab);
}

function goToQuote(newTab = false) {
    goToLink('.quote-link', newTab);
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'j') {
        prev();
    } else if (event.key === 'k') {
        next();
    } else if (event.key === ' ' && active != null) {
        goToTweet(event.altKey);
    } else if (event.key === 'a' && active != null) {
        goToProfile(event.altKey);
    } else if (event.key === 'c' && active != null) {
        goToContainer(event.altKey);
    } else if (event.key === 'q' && active != null) {
        goToQuote(event.altKey);
    } else if (event.key === 'Escape' && active != null) {
        deSelect();
    }
});