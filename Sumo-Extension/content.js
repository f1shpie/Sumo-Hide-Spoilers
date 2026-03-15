(function () {
    'use strict';

    try {
        chrome.storage.sync.get(['hideSpoilers'], (result) => {
            if (!result.hideSpoilers) return;

            const WIN_RGB_SNIPPETS = ['231, 129, 68', '255, 240, 231'];

            // GIF replacement helpers
            function attrContainsResultGif(str) {
                return typeof str === 'string' && str.includes('result_ic01.gif');
            }
            function replaceGifInString(str) {
                return typeof str === 'string' ? str.replace(/result_ic01\.gif/g, 'result_ic02.gif') : str;
            }

            // Replace GIFs
            function replaceGifs() {
                const imgs = document.querySelectorAll('img');
                imgs.forEach(img => {
                    ['src','data-src','data-original','data-lazy','srcset'].forEach(attr => {
                        const val = img.getAttribute(attr);
                        if (attrContainsResultGif(val)) img.setAttribute(attr, replaceGifInString(val));
                    });
                    if (img.src && attrContainsResultGif(img.src)) img.src = replaceGifInString(img.src);
                });

                document.querySelectorAll('*').forEach(el => {
                    const inlineBg = el.style && el.style.backgroundImage;
                    if (attrContainsResultGif(inlineBg)) el.style.backgroundImage = replaceGifInString(inlineBg);
                    try {
                        const computedBg = getComputedStyle(el).backgroundImage;
                        if (attrContainsResultGif(computedBg)) el.style.backgroundImage = replaceGifInString(computedBg);
                    } catch (e) {}
                });
            }

            // Clear <td class="decide">
            function clearDecideCells() {
                document.querySelectorAll('td.decide').forEach(td => td.textContent = '');
            }

            // Detect if element or ancestor has win background
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

            // Adjust perform cells (single or multi-number formats) on new line
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

            if (!isNaN(nums[indexToChange]) && nums[indexToChange] > 0) {
                nums[indexToChange] -= 1;
            }

            const newRecord = `（${nums.join('-')}）`;
            cell.innerHTML = `<div>${newRecord}</div>`;
        }

        // winner: decrement wins
        adjust(winnerCell, 0);

        // loser: decrement losses
        adjust(loserCell, 1);
    });
}

            // Normalize background colours
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

            // Class replacements
            function replaceClasses() {
                document.querySelectorAll('.result.win').forEach(el => el.classList.remove('win'));
                document.querySelectorAll('.win').forEach(el => {
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

            // Initial run
            applyChanges();

            // Observe dynamic page updates
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