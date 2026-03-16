(function () {
    'use strict';

    try {

        const WIN_RGB_SNIPPETS = ['231, 129, 68', '255, 240, 231'];

        /* ---------- PANEL ---------- */

function injectPanel() {

if (document.getElementById('sumoSpoilerPanelHost')) return;

const host = document.createElement('div');
host.id = 'sumoSpoilerPanelHost';

host.style.position = 'fixed';
host.style.bottom = '20px';
host.style.right = '20px';
host.style.zIndex = '999999';

document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

shadow.innerHTML = `

<style>

.wrapper {
display:flex;
align-items:stretch;
}

.panelRoot {
font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
width:220px;
background:#1f1f23;
color:#e6e6e6;
border-top-left-radius:8px;
border-bottom-left-radius:8px;
box-shadow:0 6px 18px rgba(0,0,0,0.35);
}

.hideButton {
width:28px;
background:#2b7cff;
color:white;
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
font-size:14px;
border-top-right-radius:8px;
border-bottom-right-radius:8px;
}

.container {
padding:14px;
}

.toggle {
display:flex;
align-items:center;
justify-content:space-between;
}

.switch {
position:relative;
width:38px;
height:20px;
}

.switch input {
opacity:0;
width:0;
height:0;
}

.slider {
position:absolute;
cursor:pointer;
inset:0;
background-color:#ccc;
border-radius:20px;
transition:0.2s;
}

.slider:before {
position:absolute;
content:"";
height:14px;
width:14px;
left:3px;
top:3px;
background:white;
border-radius:50%;
transition:0.2s;
}

input:checked + .slider {
background-color:#4caf50;
}

input:checked + .slider:before {
transform:translateX(18px);
}

</style>

<div class="wrapper">

<div class="panelRoot">

<div class="container">

<div class="toggle">
<span>Hide spoilers</span>

<label class="switch">
<input type="checkbox" id="toggle">
<span class="slider"></span>
</label>

</div>

</div>

</div>

<div class="hideButton" id="hidePanel">❯</div>

</div>
`;

const toggle = shadow.getElementById('toggle');
const hidePanel = shadow.getElementById('hidePanel');

hidePanel.addEventListener('click', () => {

    document.getElementById('sumoSpoilerPanelHost').remove();
    chrome.storage.sync.set({ panelVisible: false }, () => injectRestoreButton());

});

chrome.storage.sync.get(['hideSpoilers'], data => {

if (typeof data.hideSpoilers === 'undefined') {

chrome.storage.sync.set({ hideSpoilers: true }, () => {
toggle.checked = true;
});

} else {

toggle.checked = data.hideSpoilers;

}

});

toggle.addEventListener('change', () => {

chrome.storage.sync.set(
{ hideSpoilers: toggle.checked },
() => location.reload()
);

});

}

/* ---------- RESTORE BUTTON ---------- */

function injectRestoreButton() {

if (document.getElementById('sumoSpoilerRestore')) return;

const btn = document.createElement('button');

btn.id = 'sumoSpoilerRestore';

btn.textContent = '👁';

btn.style.position = 'fixed';
btn.style.bottom = '20px';
btn.style.right = '20px';
btn.style.width = '36px';
btn.style.height = '36px';
btn.style.border = 'none';
btn.style.borderRadius = '8px';
btn.style.background = '#2b7cff';
btn.style.color = 'white';
btn.style.fontSize = '18px';
btn.style.cursor = 'pointer';
btn.style.zIndex = '999999';
btn.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';

btn.onclick = () => {

    btn.remove();
    chrome.storage.sync.set({ panelVisible: true }, () => injectPanel());

};

document.body.appendChild(btn);

}

        // ---------- MAIN LOGIC ----------

        chrome.storage.sync.get(['hideSpoilers', 'panelVisible'], (result) => {

            const panelVisible = typeof result.panelVisible === 'undefined' ? true : result.panelVisible;

            if (panelVisible) {
                injectPanel();
            } else {
                injectRestoreButton();
            }

            if (!result.hideSpoilers) return;

            function attrContainsResultGif(str) {
                return typeof str === 'string' && /result_ic0(?:1|3|4|5|6)\.gif/.test(str);
            }

            function replaceGifInString(str) {
                return typeof str === 'string'
                    ? str.replace(/result_ic0(?:1|3|4|5|6)\.gif/g, 'result_ic02.gif')
                    : str;
            }

            function replaceGifs() {

                const imgs = document.querySelectorAll('img');

                imgs.forEach(img => {

                    ['src','data-src','data-original','data-lazy','srcset'].forEach(attr => {

                        const val = img.getAttribute(attr);

                        if (attrContainsResultGif(val))
                            img.setAttribute(attr, replaceGifInString(val));

                    });

                    if (img.src && attrContainsResultGif(img.src))
                        img.src = replaceGifInString(img.src);

                });

                document.querySelectorAll('*').forEach(el => {

                    const inlineBg = el.style && el.style.backgroundImage;

                    if (attrContainsResultGif(inlineBg))
                        el.style.backgroundImage = replaceGifInString(inlineBg);

                    try {

                        const computedBg = getComputedStyle(el).backgroundImage;

                        if (attrContainsResultGif(computedBg))
                            el.style.backgroundImage = replaceGifInString(computedBg);

                    } catch (e) {}

                });

            }

            function clearDecideCells() {
                document.querySelectorAll('td.decide')
                    .forEach(td => td.textContent = '');
            }

            function elementOrAncestorHaswinColour(el) {

                let node = el;

                while (node) {

                    try {

                        const bg = getComputedStyle(node).backgroundColor || '';

                        for (const snippet of WIN_RGB_SNIPPETS) {
                            if (bg.includes(snippet)) return true;
                        }

                    } catch(e) {}

                    node = node.parentElement;

                }

                return false;

            }

            function adjustPerformCells() {

                document.querySelectorAll('.perform').forEach(cell => {

                    const row = cell.closest('tr');
                    if (!row) return;

                    const performCells = row.querySelectorAll('.perform');
                    if (performCells.length < 2) return;

                    const winnerCell = cell;
                    const loserCell = [...performCells].find(c => c !== winnerCell);

                    const parentResult = winnerCell.closest('.result');
                    const hasWinClass = parentResult && parentResult.classList.contains('win');
                    const hasWinColour = elementOrAncestorHaswinColour(winnerCell);

                    if (!hasWinClass && !hasWinColour) return;

                    function adjust(cell, indexToChange) {

                        const text = cell.textContent.trim();
                        const match = text.match(/[（(]([\d\-]+)[）)]/);
                        if (!match) return;

                        const nums = match[1].split('-').map(n => parseInt(n, 10));

                        if (!isNaN(nums[indexToChange]) && nums[indexToChange] > 0)
                            nums[indexToChange] -= 1;

                        const newRecord = `（${nums.join('-')}）`;

                        cell.innerHTML = `<div>${newRecord}</div>`;

                    }

                    adjust(winnerCell, 0);
                    adjust(loserCell, 1);

                });

            }

            function normaliseBackgroundColours() {

                document.querySelectorAll('*').forEach(el => {

                    try {

                        const bg = getComputedStyle(el).backgroundColor || '';

                        for (const snippet of WIN_RGB_SNIPPETS) {

                            if (bg.includes(snippet)) {
                                el.style.backgroundColor = 'white';
                                break;
                            }

                        }

                    } catch(e) {}

                });

            }

            function replaceClasses() {

                document.querySelectorAll('.result.win')
                    .forEach(el => el.classList.remove('win'));

                document.querySelectorAll('.win')
                    .forEach(el => {

                        el.classList.remove('win');
                        el.classList.add('player');

                    });

            }

            function applyChanges() {

                try {

                    replaceGifs();
                    clearDecideCells();
                    adjustPerformCells();
                    normaliseBackgroundColours();
                    replaceClasses();

                } catch(err) {

                    console.error('Sumo Hide Spoilers applyChanges error:', err);

                }

            }

            applyChanges();

            const observer = new MutationObserver(() => applyChanges());

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class','style','src','data-src','data-original','data-lazy','srcset']
            });

        });

    } catch(err) {

        console.error('Sumo Hide Spoilers error:', err);

    }

})();