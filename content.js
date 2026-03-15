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
                    if (!cell || !cell.textContent) return;

                    // Only adjust if cell is highlighted as a win (ancestor win colour OR still has win class)
                    const parentResult = cell.closest('.result');
                    const haswinClass = parentResult && parentResult.classList.contains('win');
                    const haswinColour = elementOrAncestorHaswinColour(cell);

                    if (!haswinClass && !haswinColour) return;

                    const text = cell.textContent.trim();
                    const match = text.match(/[（(]([\d\-]+)[）)]/);
                    if (match) {
                        const numbers = match[1].split('-').map(n => parseInt(n, 10));
                        if (numbers.length > 0 && !isNaN(numbers[0]) && numbers[0] > 0) numbers[0] -= 1;
                        const newRecord = `（${numbers.join('-')}）`;
                        cell.innerHTML = `<div>${newRecord}</div>`;
                    }
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