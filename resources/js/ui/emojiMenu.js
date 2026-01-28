import { scrollToBottom } from "../chat/utils.js";

// --- CONFIGURACIÓN DE CATEGORÍAS (Mantenemos la misma lista completa) ---
const emojiCategories = {
    "smileys": { icon: "far fa-smile", label: "Emoticonos", list: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾","👋","🤚","🖐️","✋","🖖","👌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","💋","🩸"] },
    "nature": { icon: "fas fa-leaf", label: "Naturaleza", list: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🕸️","🐢","🐍","🦎","🦂","🦀","🦑","🐙","🦐","🐠","🐟","🐡","🐬","🦈","🐳","🐋","🐊","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿️","🦔","🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🎍","🎋","🍃","🍂","🍁","🌾","🌺","🌻","🌹","🥀","🌷","🌼","🌸","💐","🍄","🌰","🎃","🐚","🌎","🌍","🌏","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌚","🌝","🌛","🌜","☀️","🌝","🌞","⭐","🌟","🌠","☁️","⛅","⛈️","🌤️","🌥️","🌦️","🌧️","🌨️","🌩️","🌪️","🌫️","🌬️","🔥","💧","🌊"] },
    "food": { icon: "fas fa-hamburger", label: "Comida", list: ["🍏","🍎","pear","🍊","🍋","🍌","🍉","🍇","🍓","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🌽","🥕","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🥛","🍼","☕","🍵","🧃","🥤","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾","🧊","🥄","🍴","🍽️","🥣","🥡","🥢"] },
    "activity": { icon: "fas fa-futbol", label: "Actividad", list: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🤺","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚵","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","🎫","🎟️","🎪","🤹","🎭","🩰","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🎷","🎺","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🎰","🧩"] },
    "travel": { icon: "fas fa-plane", label: "Viajes", list: ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","🚁","🛩️","✈️","🛫","🛬","🛰️","🚀","🛸","🛶","⛵","🛥️","🚤","⛴️","🛳️","🚢","⚓","⛽","🚧","🚦","🚥","🚏","🗺️","🗿","🗽","🗼","⛰️","🏔️","🗻","🌋","🏜️","🏕️","⛺","🛤️","🛣️","🏗️","🏭","🏠","🏡","🏘️","🏢","🏬","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","💒","⛪","🕌","🛕","🕍","⛩️","🕋","⛲"] },
    "objects": { icon: "fas fa-lightbulb", label: "Objetos", list: ["⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯️","🪔","🧯","🛢️","💸","💵","💴","💶","💷","💰","💳","💎","⚖️","🧰","🔧","🔨","⚒️","🛠️","⛏️","🔩","⚙️","🧱","⛓️","🧲","🔫","💣","🧨","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","⚱️","🏺","🔮","📿","🧿","💈","⚗️","🔭","🔬","🕳️","💊","💉","🩸","🧬","🦠","🧫","🩺","🚪","🛗","🪞","🪟","🛏️","🛋️","🪑","🚽","🪠","🚿","🛁","🪤","🪒","🧴","🧷","🧹","🧺","🧻","🧼","🧽","🛒"] },
    "symbols": { icon: "fas fa-heart", label: "Símbolos", list: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🈳","🈹","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","🉑","💮","🉐","㊙️","㊗️","🈴","🈵","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","⛔","📛","🚫","❌","⭕","🛑","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","❗","❕","❓","❔","‼️","⁉️","💯","🔅","🔆","🔱","⚜️","〽️","⚠️","🚸","🔰","♻️","🈯","💹","❇️","✳️","❎","✅","💠","🌀","➿","🌐","Ⓜ️","🏧","🈂️","🛂","🛃","🛄","🛅","♿","🆕","🆒","🆓","🆗","🆙","🆘","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","*️⃣","#️⃣","▶️","⏸️","⏯️","⏹️","⏺️","⏭️","⏮️","⏩","⏪","🔀","🔁","🔂","◀️","🔼","🔽","⏫","⏬","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","🔄","↪️","↩️","⤴️","⤵️","🎵","🎶","➕","➖","➗","✖️","💲","💱","™️","©️","®️","〰️","➰","➿","🔚","🔙","🔛","🔝","🔜","☑️","🔘","⚪","⚫","🔴","🔵","🔸","🔹","🔶","🔷","🔺","🔻","🔳","🔲"] },
    "flags": { icon: "fas fa-flag", label: "Banderas", list: ["🏁","🚩","🎌","🏴","🏳️","🏳️‍🌈","🏴‍☠️","🇦🇨","🇦🇩","🇦🇪","🇦🇫","🇦🇬","🇦🇮","🇦🇱","🇦🇲","🇦🇴","🇦🇶","🇦🇷","🇦🇸","🇦🇹","🇦🇺","🇦🇼","🇦🇽","🇦🇿","🇧🇦","🇧🇧","🇧🇩","🇧🇪","🇧🇫","🇧🇬","🇧🇭","🇧🇮","🇧🇯","🇧🇱","🇧🇲","🇧🇳","🇧🇴","🇧🇶","🇧🇷","🇧🇸","🇧🇹","🇧🇻","🇧🇼","🇧🇾","🇧🇿","🇨🇦","🇨🇨","🇨🇩","🇨cf","🇨🇬","🇨🇭","🇨🇮","🇨🇰","🇨🇱","🇨🇲","🇨🇳","🇨🇴","🇨🇵","🇨🇷","🇨🇺","🇨🇻","🇨🇼","🇨🇽","🇨🇾","🇨🇿","🇩🇪","🇩🇬","🇩🇯","🇩🇰","🇩🇲","🇩🇴","🇩🇿","🇪🇦","🇪🇨","🇪🇪","🇪🇬","🇪🇭","🇪🇷","🇪🇸","🇪🇹","🇪🇺","🇫🇮","🇫🇯","🇫🇰","🇫🇲","🇫🇴","🇫🇷","🇬🇦","🇬🇧","🇬🇩","🇬🇪","🇬🇫","🇬🇬","🇬🇭","🇬🇮","🇬🇱","🇬🇲","🇬🇳","🇬🇵","🇬🇶","🇬🇷","🇬🇸","🇬🇹","🇬🇺","🇬🇼","🇬🇾","🇭🇰","🇭🇲","🇭🇳","🇭🇷","🇭🇹","🇭🇺","🇮🇨","🇮🇩","🇮🇪","🇮🇱","🇮🇲","🇮🇳","🇮🇴","🇮🇶","🇮🇷","🇮🇸","🇮🇹","🇯🇪","🇯🇲","🇯🇴","🇯🇵","🇰🇪","🇰🇬","🇰🇭","🇰🇮","🇰🇲","🇰🇳","🇰🇵","🇰🇷","🇰🇼","🇰🇾","🇰🇿","🇱🇦","🇱🇧","🇱🇨","🇱🇮","🇱🇰","🇱🇷","🇱🇸","🇱🇹","🇱🇺","🇱🇻","🇱🇾","🇲🇦","🇲🇨","🇲🇩","🇲🇪","🇲🇫","🇲🇬","🇲🇭","🇲🇰","🇲🇱","🇲🇲","🇲🇳","🇲🇴","🇲🇵","🇲🇶","🇲🇷","🇲🇸","🇲🇹","🇲🇺","🇲🇻","🇲🇼","🇲🇽","🇲🇾","🇲🇿","🇳🇦","🇳🇨","🇳🇪","🇳🇫","🇳🇬","🇳🇮","🇳🇱","🇳🇴","🇳🇵","🇳🇷","🇳🇺","🇳🇿","🇴🇲","🇵🇦","🇵🇪","🇵🇫","🇵🇬","🇵🇭","🇵🇰","🇵🇱","🇵🇲","🇵🇳","🇵🇷","🇵🇸","🇵🇹","🇵🇼","🇵🇾","🇶🇦","🇷🇪","🇷🇴","🇷🇸","🇷🇺","🇷🇼","🇸🇦","🇸🇧","🇸🇨","🇸🇩","🇸🇪","🇸🇬","🇸🇭","🇸🇮","🇸🇯","🇸🇰","🇸🇱","🇸🇲","🇸🇳","🇸🇴","🇸🇷","🇸🇸","🇸🇹","🇸🇻","🇸🇽","🇸🇾","🇸🇿","🇹🇦","🇹🇨","🇹🇩","🇹🇫","🇹🇬","🇹🇭","🇹🇯","🇹🇰","🇹🇱","🇹🇲","🇹🇳","🇹🇴","🇹🇷","🇹🇹","🇹🇻","🇹🇼","🇹🇿","🇺🇦","🇺🇬","🇺🇲","🇺🇳","🇺🇸","🇺🇾","🇺🇿","🇻🇦","🇻🇨","🇻🇪","🇻🇬","🇻🇮","🇻🇳","🇻🇺","🇼🇫","🇼🇸","🇽🇰","🇾🇪","🇾🇹","🇿🇦","🇿🇲","🇿🇼"] }
};

let menuContainer = null;
let isMenuOpen = false;
let dbInstance = null;
let observer = null;
let loadedCategories = new Set();
let activeCategory = 'smileys';
let scrollTimeout = null;

// --- INDEXED DB ---
function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) { resolve(dbInstance); return; }
        const request = indexedDB.open("EmojiCacheDB", 2);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("categories")) {
                db.createObjectStore("categories"); 
            }
        };
        request.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        request.onerror = (e) => reject(e);
    });
}

function getCachedCategory(key) {
    return new Promise(async (resolve) => {
        try {
            const db = await initDB();
            const tx = db.transaction("categories", "readonly");
            const store = tx.objectStore("categories");
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
    });
}

function saveCachedCategory(key, html) {
    initDB().then(db => {
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        store.put(html, key);
    }).catch(console.error);
}

// --- LOGICA PRINCIPAL ---

export function initEmojiMenu() {
    const inputArea = document.querySelector('.input-area');
    if (!inputArea) return;

    let inputWrapper = inputArea.querySelector('.input-wrapper');
    if (!inputWrapper) {
        inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';
        while (inputArea.firstChild) inputWrapper.appendChild(inputArea.firstChild);
        inputArea.appendChild(inputWrapper);
    }
    
    if (!document.getElementById('emoji-drawer')) {
        const html = `
        <div class="emoji-drawer" id="emoji-drawer">
            <div class="emoji-categories" id="emoji-categories"></div>
            <div class="emoji-scroll-area custom-scrollbar" id="emoji-scroll-area"></div>
        </div>`;
        inputArea.insertAdjacentHTML('beforeend', html);
        menuContainer = document.getElementById('emoji-drawer');
        
        renderCategoryTabs();
        setupScrollArea();
        setupLazyLoadObserver();
        setupScrollSpy();
        setupDelegatedEvents();

    } else {
        menuContainer = document.getElementById('emoji-drawer');
    }
}

function renderCategoryTabs() {
    const container = document.getElementById('emoji-categories');
    container.innerHTML = '';

    Object.keys(emojiCategories).forEach(key => {
        const cat = emojiCategories[key];
        const btn = document.createElement('button');
        btn.className = `category-btn ${key === 'smileys' ? 'active' : ''}`;
        btn.dataset.target = key;
        btn.innerHTML = `<i class="${cat.icon}"></i>`;
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToCategory(key);
        });
        
        container.appendChild(btn);
    });
}

function setupScrollArea() {
    const scrollArea = document.getElementById('emoji-scroll-area');
    scrollArea.innerHTML = '';

    Object.keys(emojiCategories).forEach(key => {
        const cat = emojiCategories[key];
        
        const section = document.createElement('div');
        section.id = `cat-${key}`;
        section.className = 'emoji-section';
        section.dataset.key = key;

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = cat.label || key;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'emoji-grid-section';
        grid.style.minHeight = '200px'; 
        section.appendChild(grid);

        scrollArea.appendChild(section);
    });
}

function setupLazyLoadObserver() {
    const options = {
        root: document.getElementById('emoji-scroll-area'),
        rootMargin: '200px 0px',
        threshold: 0
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const key = entry.target.dataset.key;
                loadCategoryContent(key);
            }
        });
    }, options);

    document.querySelectorAll('.emoji-section').forEach(section => {
        observer.observe(section);
    });
}

function setupScrollSpy() {
    const scrollArea = document.getElementById('emoji-scroll-area');
    const sections = document.querySelectorAll('.emoji-section');
    
    scrollArea.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        
        scrollTimeout = requestAnimationFrame(() => {
            let current = '';
            const triggerPoint = scrollArea.scrollTop + 60; 

            sections.forEach(section => {
                if (section.offsetTop <= triggerPoint) {
                    current = section.dataset.key;
                }
            });

            if (current && current !== activeCategory) {
                updateActiveTab(current);
            }
            scrollTimeout = null;
        });
    });
}

function setupDelegatedEvents() {
    const scrollArea = document.getElementById('emoji-scroll-area');
    scrollArea.addEventListener('click', (e) => {
        const btn = e.target.closest('.emoji-btn');
        if (btn && btn.dataset.emoji) {
            e.preventDefault();
            e.stopPropagation();
            insertEmoji(btn.dataset.emoji);
        }
    });
}

async function loadCategoryContent(key) {
    if (loadedCategories.has(key)) return;
    loadedCategories.add(key);
    
    const section = document.getElementById(`cat-${key}`);
    const grid = section.querySelector('.emoji-grid-section');
    
    const cachedHTML = await getCachedCategory(key);
    
    if (cachedHTML) {
        grid.innerHTML = cachedHTML;
        grid.style.minHeight = 'auto'; 
        return;
    }

    const list = emojiCategories[key].list;
    const tempDiv = document.createElement('div');
    
    list.forEach(emojiChar => {
        const btn = document.createElement('div');
        btn.className = 'emoji-btn';
        btn.textContent = emojiChar;
        btn.dataset.emoji = emojiChar;
        tempDiv.appendChild(btn);
    });

    if (window.twemoji && window.twemoji.parse) {
        window.twemoji.parse(tempDiv, { folder: 'svg', ext: '.svg' });
    }
    
    const finalHTML = tempDiv.innerHTML;
    grid.innerHTML = finalHTML;
    grid.style.minHeight = 'auto';

    saveCachedCategory(key, finalHTML);
}

function updateActiveTab(key) {
    activeCategory = key;
    const scrollContainer = document.getElementById('emoji-categories');
    const activeBtn = document.querySelector(`.category-btn[data-target="${key}"]`);

    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.target === key) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (activeBtn && scrollContainer) {
        const containerLeft = scrollContainer.getBoundingClientRect().left;
        const btnLeft = activeBtn.getBoundingClientRect().left;
        const offset = btnLeft - containerLeft - (scrollContainer.clientWidth / 2) + (activeBtn.clientWidth / 2);
        scrollContainer.scrollBy({ left: offset, behavior: 'smooth' });
    }
}

function scrollToCategory(key) {
    const section = document.getElementById(`cat-${key}`);
    if (section) {
        updateActiveTab(key);
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function insertEmoji(emojiChar) {
    const input = document.getElementById('chat-input-field');
    
    // 1. Activar bandera para EVITAR CERRAR MENÚ al hacer focus
    input.dataset.keepMenuOpen = "true";
    input.focus();
    
    // Limpieza de seguridad
    setTimeout(() => { input.dataset.keepMenuOpen = "false"; }, 100);

    // 2. Insertar HTML de Twemoji
    let htmlToInsert = emojiChar;
    if (window.twemoji && window.twemoji.parse) {
        htmlToInsert = window.twemoji.parse(emojiChar, { folder: 'svg', ext: '.svg' });
    }

    if (document.execCommand) {
        document.execCommand('insertHTML', false, htmlToInsert);
    } else {
        input.innerText += emojiChar; // Fallback
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    // Disparar input para actualizar iconos
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
}

export function toggleEmojiMenu() {
    if (!menuContainer) initEmojiMenu();
    if (isMenuOpen) closeEmojiMenu();
    else openEmojiMenu();
}

function openEmojiMenu() {
    const attachDrawer = document.getElementById('attachment-drawer');
    if (attachDrawer) {
        attachDrawer.classList.remove('visible');
        attachDrawer.style.display = 'none';
    }

    menuContainer.style.display = 'flex';
    void menuContainer.offsetWidth; 
    menuContainer.classList.add('visible');
    
    const wrapper = document.querySelector('.input-wrapper');
    if (wrapper) wrapper.style.paddingBottom = '10px';

    isMenuOpen = true;

    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
        setTimeout(() => scrollToBottom(messagesContainer), 200);
    }
}

export function closeEmojiMenu() {
    if (menuContainer) {
        menuContainer.classList.remove('visible');
        const wrapper = document.querySelector('.input-wrapper');
        if (wrapper) wrapper.style.paddingBottom = '';
        setTimeout(() => {
            if (!isMenuOpen) menuContainer.style.display = 'none';
        }, 200);
    }
    isMenuOpen = false;
}