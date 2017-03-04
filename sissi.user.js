// ==UserScript==
// @name Sissi
// @description The Kaiser+Kraft site switcher
// @version 0.1
// @author Kyusu
// @license MIT
// @supportURL
// @include https://*kaiserkraft*
// @include https://*frankel*
// @include https://*gaerner*
// @include https://*hoffmann-zeist*
// @include https://*kwesto*
// @include https://*powellmailorder*
// @include https://*vinklisse*
// @include https://*-test*.kkeu.de
// @exclude https://*.ec.kaiserkraft.de*
// @exclude https://*.kkeu.de/hmc/*
// @exclude https://*.kkeu.de/admin/*
// @exclude https://*.kkeu.de/cmscockpit/*
// @exclude https://*.kkeu.de/*inder/*
// @run-at document-idle
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_log
// @grant GM_xmlhttpRequest
// @connect sissi.cloudno.de
// ==/UserScript==

class URL {
    static formatUrl(url) {
        return url.replace(/^https:\/\//, '').replace(/\/$/, '');
    }

    static newUrl(url, path) {
        return `${url.replace(/\/$/, '')}${this.replaceSGE(url, path)}`;
    }

    static urlToSGE(url) {
        if (url.includes('kaiserkraft') || url.includes('frankel') || url.includes('vinklisse')) {
            return 'KK';
        } else if (url.includes('gaerner') || url.includes('hoffmann-zeist') || url.includes('powellmailorder')) {
            return 'GAE';
        }
    }

    static replaceSGE(url, path) {
        return path.replace(/\/c\/[0-9]+-([A-Z]+)\//, (match, p1) => {
            return match.replace(p1, this.urlToSGE(url));
        });
    }

    static redirect(url) {
        window.location.assign(url);
    }
}

class View {
    static style() {
        return {
            anchorDimensions: {
                height: 50,
                width: 50
            },
            linkStyle: {
                color: 'black',
                'font-family': 'Arial,Verdana,Helvetica,sans-serif',
                margin: '0',
                padding: '0'
            }
        };
    }

    static getStyleValues(styles) {
        return Object.keys(styles).map(key => `${key}: ${styles[key]} !important;`).join(' ');
    }
}

class MainView extends View {

    static buttonStates() {
        return {
            off: 'off',
            on: 'on'
        };
    }

    static style(fixedPosition={right:0, bottom:0}, screenDim) {
        const fixedStyle = {
            position: 'fixed',
            'z-index': '2147483640',
            'background-color': '#ffe200'
        };
        const basicStyle = super.style();
        const anchorDimensions = basicStyle.anchorDimensions;
        const linkStyle = basicStyle.linkStyle;
        const imageMargin = 1;
        const imageStyle = {
            'margin-left': `${imageMargin}px`,
            'margin-right': `${imageMargin}px`,
            'margin-top': `${imageMargin}px`,
            'margin-bottom': `${imageMargin}px`,
            width: `${anchorDimensions.width - (2 * imageMargin)}px`,
            height: `${anchorDimensions.height - (2 * imageMargin)}px`,
            display: 'block',
        };
        const bottom = (Math.sign(fixedPosition.bottom) !== -1 && Math.sign(fixedPosition.bottom - screenDim.y) === -1) ? fixedPosition.bottom : 0;
        const right = (Math.sign(fixedPosition.right) !== -1 && Math.sign(fixedPosition.right - screenDim.x) === -1) ? fixedPosition.right : 0;
        return {
            anchor: {
                style: Object.assign({}, fixedStyle, linkStyle, {
                    height: `${anchorDimensions.height}px`,
                    width: `${anchorDimensions.width}px`,
                    bottom: `${bottom}px`,
                    right: `${right}px`
                }),
                buttonState: this.buttonStates().off,
                image: {
                    style: imageStyle,
                    src: 'data:image/png;base64,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'
                }
            },
            wrapper: {
                style: Object.assign({}, fixedStyle, {
                    bottom: `${bottom + anchorDimensions.height}px`,
                    right: `${right + anchorDimensions.width}px`,
                    display: 'none'
                })
            },
            list: {
                style: {
                    padding: '0',
                    margin: '0',
                    'margin-bottom': '15px'
                }
            },
            input: {
                style: {
                    width: '100%',
                    padding: '0',
                    margin: '0'
                }
            }
        };
    }

    static renderHTML(state) {
        const getStyle = super.getStyleValues;
        return `<a draggable="true" class="sissi" style="${getStyle(state.anchor.style)}" data-button-state="${state.anchor.buttonState}">
                    <img style="${getStyle(state.anchor.image.style)}" src="${state.anchor.image.src}" alt="sissi">
                </a>
                <div class="sissi-search" style="${getStyle(state.wrapper.style)}">
                    <ul style="${getStyle(state.list.style)}"></ul>
                    <label for="sissi-input">Where do you want to go today?</label>
                    <input id="sissi-input" type="search" style="${getStyle(state.input.style)}">
                </div>`;
    }

    static setReferences(wrapperDiv) {
        return {
            references: {
                anchor: wrapperDiv.querySelector('a.sissi'),
                image: wrapperDiv.querySelector('a.sissi > img'),
                input: wrapperDiv.querySelector('div.sissi-search > input'),
                list: wrapperDiv.querySelector('div.sissi-search > ul'),
                listWrapper: wrapperDiv.querySelector('div.sissi-search')
            },
            wrapperDiv
        };
    }

    static toggleInputField(references) {
        const buttonStates = this.buttonStates();
        const buttonState = references.anchor.getAttribute('data-button-state');
        if (buttonState === buttonStates.on) {
            references.anchor.setAttribute('data-button-state', buttonStates.off);
            references.anchor.style.transform = 'none';
            references.list.innerHTML = '';
            references.input.value = '';
            references.listWrapper.style.display = 'none';
        } else {
            references.anchor.setAttribute('data-button-state', buttonStates.on);
            references.anchor.style.transform = 'rotate(180deg)';
            references.listWrapper.style.display = 'block';
            references.input.focus();
        }
    }

    static setHandlers({references}, callbacks) {
        references.anchor.addEventListener('click', (ev) => {
            ev.preventDefault();
            callbacks.click().then(this.toggleInputField(references));
        });
        references.anchor.addEventListener('dragstart', (ev) => {
            ev.target.style.opacity = '0.5';
        });
        references.anchor.addEventListener('dragend', (ev) => {
            const bottom = window.innerHeight - ev.clientY - (parseInt(references.anchor.style.height, 10) / 2);
            const right = window.innerWidth - ev.clientX - (parseInt(references.anchor.style.width, 10) / 2);
            references.anchor.style.bottom = `${bottom}px`;
            references.anchor.style.right = `${right}px`;
            GM_setValue('sissi-position', `${bottom},${right}`);
            references.listWrapper.style.bottom = `${bottom + View.style().anchorDimensions.height}px`;
            references.listWrapper.style.right = `${right + View.style().anchorDimensions.width}px`;
            ev.target.style.opacity = '1';
        });
        references.input.addEventListener('input', (ev) => {
            const term = ev.target.value;
            callbacks.input(term);
        });
        references.input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
                callbacks.keydown(ev.key);
            }
        });
        references.list.addEventListener('click', (ev) => {

        });
        return references;
    }
}

class ResultView extends View {
    static style() {
        return {
            list: {
                'list-style-type': 'none',
                margin: '5px'
            },
            anchor: super.style().linkStyle
        };
    }

    static renderResultList(listStyle, selectedIndex, results) {
        const getStyle = super.getStyleValues;
        return results.map((result, index) => {
            return `<li data-selected="${index === selectedIndex}" style="${getStyle(listStyle.list)} outline: ${index === selectedIndex ? 1 : 0}px solid black;">
                        <a href="${URL.newUrl(result, window.location.pathname)}" style="${getStyle(listStyle.anchor)}">${URL.formatUrl(result)}</a>
                     </li>`;
        }).join('');
    }
}

class Model {
    constructor() {
        this.matches = [];
        this.index = 0;
    }

    static makeRequest(method, url, name, password) {
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method,
                url,
                headers: {
                    'Authorization': `Basic ${btoa(`${name}:${password}`)}`
                },
                onload: function (res) {
                    resolve(JSON.parse(res.responseText));
                },
                onerror: function (res) {
                    const msg = `An error occurred.
                                \nresponseText: ${res.responseText}
                                \nreadyState:  ${res.readyState}
                                \nresponseHeaders: ${res.responseHeaders}
                                \nstatus: ${res.status}
                                \nstatusText: ${res.statusText}
                                \nfinalUrl: ${res.finalUrl}`;
                    reject(msg);
                }
            });
        });
    }

    static parseSearchTerm(term) {
        let type;
        if (/^a:/.test(term)) {
            type = 'testa';
        } else if (/^f:/.test(term)) {
            type = 'testf';
        } else if (/^p:/.test(term)) {
            type = 'prod';
        } else {
            type = 'all';
        }
        return {
            term: term.replace(/^[a-z]+:/g, '').trim(),
            type: type
        };
    }

    static findMatches(links, search) {
        return links[search.type].filter(link => link.includes(search.term));
    }

    fetchData(password) {
        return this.constructor.makeRequest('GET', 'https://sissi.cloudno.de', 'kaiserkraft', password).then(links => {
            links.all = [...links.prod, ...links.testa, ...links.testf];
            this.links = links;
        });
    }

    filterLinks(term) {
        this.matches = term ? this.constructor.findMatches(this.links, this.constructor.parseSearchTerm(term.toLowerCase())) : [];
        this.index = 0;
    }


    getMatches() {
        return this.matches;
    }

    incrementIndex() {
        const indexPlusOne = this.index + 1;
        if (indexPlusOne >= this.matches.length) {
            this.index = 0;
        } else {
            this.index = indexPlusOne;
        }
    }

    decrementIndex() {
        const indexMinusOne = this.index - 1;
        if (indexMinusOne < 0) {
            this.index = this.matches.length - 1;
        } else {
            this.index = indexMinusOne;
        }
    }

    getIndex() {
        return this.index;
    }
}

class Controller {
    constructor() {
        this.model = new Model();
        const position = Controller.getStoredPosition();
        const screenDim = {
            x: window.innerWidth,
            y: window.innerHeight
        };
        this.references = MainView.setHandlers(MainView.setReferences(Controller.appendSissi(MainView.renderHTML(MainView.style(position, screenDim)))), {
            click: () => {
                return this.fetchData();
            },
            input: (term) => {
                this.model.filterLinks(term);
                this.showResults();
            },
            keydown: (eventName) => {
                if (eventName === 'Enter') {
                    const siteURL = this.model.getMatches()[this.model.getIndex()];
                    URL.redirect(URL.newUrl(siteURL, window.location.pathname));
                } else if (eventName === 'ArrowUp') {
                    this.model.decrementIndex();
                    this.showResults();

                } else if (eventName === 'ArrowDown') {
                    this.model.incrementIndex();
                    this.showResults();
                }
            }
        });
    }

    static getStoredPosition() {
        const position = GM_getValue('sissi-position');
        if (position) {
            const [bottom, right] = position.split(',').map(pos => parseInt(pos, 10));
            return {
                bottom,
                right
            };
        }
    }

    showResults() {
        this.references.list.innerHTML = ResultView.renderResultList(ResultView.style(), this.model.getIndex(), this.model.getMatches());
    }

    static appendSissi(mainViewHTML) {
        const wrapperDiv = window.document.createElement('div');
        wrapperDiv.innerHTML = mainViewHTML;
        window.document.querySelector('body').appendChild(wrapperDiv);
        return wrapperDiv;
    }

    fetchData() {
        let password = GM_getValue('sissi-credentials');
        if (!password) {
            password = window.prompt('Please enter the password in order to use Sissi');
        }
        if (password === null) {
            const rejectedPromise = new Promise();
            rejectedPromise.reject('Aborted by user');
            return rejectedPromise;
        } else {
            return this.model.fetchData(password).then(() => {
                GM_setValue('sissi-credentials', password);
            });
        }
    }
}
if (window.self === window.top) {
    // Do not open Sissi in iframes!
    new Controller();
}
