const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSU78peNph0jAQtDcRo79WmM6WjgUYSQg4kzTcTgARTZY53f09hVRk7Ve11y8Tvo2gBQ6O6NKukA9fS/pub?output=csv';

async function loadMenu() {
    const container = document.getElementById('menu-container');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Divide le righe e toglie l'intestazione
        const rows = data.split(/\r?\n/).slice(1); 
        
        container.innerHTML = '';
        let currentCat = '';

        rows.forEach(row => {
            // Regex per gestire le virgole nelle descrizioni
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (cols.length >= 4) {
                const cat = cols[0].trim().replace(/"/g, '');
                const name = cols[1].trim().replace(/"/g, '');
                const desc = cols[2].trim().replace(/"/g, '');
                const price = cols[3].trim().replace(/"/g, '');
                const available = cols[4] ? cols[4].trim().toUpperCase().replace(/"/g, '') : 'SI';

                if (available !== 'SI' || name === "") return;

                if (cat !== currentCat && cat !== "") {
                    currentCat = cat;
                    container.insertAdjacentHTML('beforeend', `<h2 class="category-title">${cat}</h2>`);
                }

                container.insertAdjacentHTML('beforeend', `
                    <div class="menu-item">
                        <div class="info">
                            <div class="item-name">${name}</div>
                            <div class="item-desc">${desc}</div>
                        </div>
                        <div class="item-price">€${price}</div>
                    </div>
                `);
            }
        });
    } catch (e) {
        console.error("Errore:", e);
        container.innerHTML = "<p style='text-align:center;'>Caricamento in corso...</p>";
    }
}

function updateStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 1=Lun, 2=Mar...
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const currentTime = hrs * 60 + mins;

    const badge = document.getElementById('status-badge');
    if (!badge) return;

    let isOpen = false;

    // Orari Panburro: 13:00 = 780 minuti
    if (day === 1) { 
        isOpen = false; // Lunedì Chiuso
    } else if (day === 0) { 
        if (currentTime >= 480 && currentTime <= 780) isOpen = true; // Dom 08:00-13:00
    } else if (day === 6) { 
        if (currentTime >= 420 && currentTime <= 780) isOpen = true; // Sab 07:00-13:00
    } else { 
        if (currentTime >= 390 && currentTime <= 780) isOpen = true; // Mar-Ven 06:30-13:00
    }

    if (isOpen) {
        badge.textContent = "● Aperto ora";
        badge.className = "badge open";
    } else {
        badge.textContent = "○ Chiuso ora";
        badge.className = "badge closed";
    }
}

// Avvio unico al caricamento
window.onload = () => {
    loadMenu();
    updateStatus();
};