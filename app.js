// ==========================================
// 1. LOCAL STORAGE HELPERS
// ==========================================
const MEDS_KEY = 'decimal_meds_v2';
const LOGS_KEY = 'decimal_logs_v2';
const TIMER_KEY = 'decimal_active_timer_v2';

const getMeds = () => JSON.parse(localStorage.getItem(MEDS_KEY) || '[]');
const saveMeds = (meds) => localStorage.setItem(MEDS_KEY, JSON.stringify(meds));
const getLogs = () => JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
const saveLogs = (logs) => localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

// ==========================================
// 2. AUDIO ENGINE
// ==========================================
const START_SOUND_B64 = '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';
const ADD_SOUND_B64 = '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';

const START_SOUND = new Audio('data:audio/mp3;base64,' + START_SOUND_B64);
const ADD_SOUND = new Audio('data:audio/mp3;base64,' + ADD_SOUND_B64);

function playSound(audioObj) {
    const clone = audioObj.cloneNode();
    clone.volume = 0.8;
    clone.play().catch(e => console.log('Audio play prevented (user interaction may be required first):', e));
}

// ==========================================
// 3. DECIMAL TIME ENGINE
// ==========================================
function getDecimalTime(date = new Date()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ms = date.getMilliseconds();

    const totalStandardSeconds = (hours * 3600) + (minutes * 60) + seconds + (ms / 1000);
    const totalDecimalSeconds = (totalStandardSeconds / 86400) * 100000;
    return formatDecimal(totalDecimalSeconds);
}

function getElapsedDecimalTime(startTime) {
    const elapsedMs = Date.now() - startTime;
    const totalStandardSeconds = elapsedMs / 1000;
    const totalDecimalSeconds = (totalStandardSeconds / 86400) * 100000;
    return formatDecimal(totalDecimalSeconds);
}

function formatDecimal(totalDecimalSeconds) {
    const dHours = Math.floor(totalDecimalSeconds / 10000);
    const dMinutes = Math.floor((totalDecimalSeconds % 10000) / 100);
    const dSeconds = Math.floor(totalDecimalSeconds % 100);

    return {
        string: `${String(dHours).padStart(2, '0')}:${String(dMinutes).padStart(2, '0')}:${String(dSeconds).padStart(2, '0')}`,
        hours: dHours, minutes: dMinutes, seconds: dSeconds
    };
}

function updateClock() {
    document.getElementById('decimal-clock').textContent = getDecimalTime().string;
}

// ==========================================
// 4. UI ROUTING & MODALS
// ==========================================
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${targetView}`).classList.add('active');
        
        if(targetView === 'meds') renderMeds();
        if(targetView === 'history') renderHistory();
        if(targetView === 'dashboard') renderDashboard();
    });
});

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
};

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// ==========================================
// 5. MEDICATION MANAGEMENT (ADD)
// ==========================================
document.getElementById('btn-open-add').addEventListener('click', () => {
    playSound(ADD_SOUND);
    document.getElementById('input-med-name').value = '';
    document.getElementById('input-med-release').value = '';
    openModal('modal-add');
});

document.getElementById('btn-save-med').addEventListener('click', () => {
    const name = document.getElementById('input-med-name').value.trim();
    const release = document.getElementById('input-med-release').value;

    if (!name) {
        alert("Please enter a medication name.");
        return;
    }

    const meds = getMeds();
    meds.push({
        id: Date.now(),
        name,
        releaseProfile: release || null
    });
    saveMeds(meds);
    closeModal('modal-add');
    renderMeds();
    renderDashboard();
});

// ==========================================
// 6. TRACKING FLOW & TIMER
// ==========================================
let currentTrackingMedId = null;

function renderMeds() {
    const meds = getMeds();
    const list = document.getElementById('meds-list');
    const emptyState = document.getElementById('meds-empty');
    
    const activeTimerStr = localStorage.getItem(TIMER_KEY);
    const activeTimer = activeTimerStr ? JSON.parse(activeTimerStr) : null;

    list.innerHTML = '';

    if (meds.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    meds.forEach(med => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        let subText = med.releaseProfile || 'Standard';
        let trackingHtml = '';
        
        if (activeTimer && activeTimer.medId === med.id) {
            trackingHtml = `<div class="tracking-indicator">CURRENTLY TRACKING • <span class="tracking-time">00:00:00</span></div>`;
        }
        
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${med.name}</div>
                <div class="list-item-sub">${subText}</div>
                ${trackingHtml}
            </div>
            <span class="list-item-arrow">›</span>
        `;
        
        item.addEventListener('click', () => {
            currentTrackingMedId = med.id;
            document.getElementById('track-med-title').textContent = `Track: ${med.name}`;
            document.getElementById('input-dose').value = '';
            openModal('modal-track');
        });
        
        list.appendChild(item);
    });
}

document.getElementById('btn-start-tracking').addEventListener('click', () => {
    if (!currentTrackingMedId) return;

    const route = document.getElementById('input-route').value;
    const dose = document.getElementById('input-dose').value.trim();
    const unit = document.getElementById('input-unit').value;

    if (!dose) {
        alert("Please enter a dose.");
        return;
    }

    const meds = getMeds();
    const med = meds.find(m => m.id === currentTrackingMedId);

    const timerData = {
        medId: med.id,
        medName: med.name,
        releaseProfile: med.releaseProfile,
        route: route,
        dose: dose,
        unit: unit,
        startTime: Date.now()
    };

    localStorage.setItem(TIMER_KEY, JSON.stringify(timerData));
    playSound(START_SOUND);
    closeModal('modal-track');
    renderMeds();
    renderDashboard();
});

function stopTimer() {
    const timerDataStr = localStorage.getItem(TIMER_KEY);
    if (!timerDataStr) return;

    const timerData = JSON.parse(timerDataStr);
    const duration = getElapsedDecimalTime(timerData.startTime);
    
    const logs = getLogs();
    logs.unshift({
        id: Date.now(),
        medName: timerData.medName,
        releaseProfile: timerData.releaseProfile,
        route: timerData.route,
        dose: timerData.dose,
        unit: timerData.unit,
        decimalTime: getDecimalTime().string,
        duration: duration.string,
        timestamp: Date.now()
    });
    saveLogs(logs);

    localStorage.removeItem(TIMER_KEY);
    renderMeds();
    renderHistory();
    renderDashboard();
}

function updateTimerUI() {
    const timerDataStr = localStorage.getItem(TIMER_KEY);
    const timeDisplays = document.querySelectorAll('.tracking-time');
    
    if (timeDisplays.length > 0 && timerDataStr) {
        const timerData = JSON.parse(timerDataStr);
        const elapsed = getElapsedDecimalTime(timerData.startTime);
        timeDisplays.forEach(d => d.textContent = elapsed.string);
    }
}

// ==========================================
// 7. HISTORY LOGGING & BAUHAUS GRID
// ==========================================
function renderBauhausGrid() {
    const gridContainer = document.getElementById('bauhaus-grid');
    if(!gridContainer) return;
    
    const logs = getLogs();
    gridContainer.innerHTML = '';
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const hasLogs = logs.some(log => {
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            return logDate === dateStr;
        });
        
        const square = document.createElement('div');
        square.className = `grid-square ${hasLogs ? 'filled' : 'empty'}`;
        gridContainer.appendChild(square);
    }
}

function renderHistory() {
    const logs = getLogs();
    const list = document.getElementById('history-logs-list');
    const emptyState = document.getElementById('history-empty');

    renderBauhausGrid();

    list.innerHTML = '';

    if (logs.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'history-block';
        
        let releaseText = log.releaseProfile ? ` • ${log.releaseProfile}` : '';
        
        item.innerHTML = `
            <div class="log-title">${log.medName} (${log.dose}${log.unit})</div>
            <div class="log-meta">
                ${log.route}${releaseText}<br>
                Taken: ${log.decimalTime}<br>
                Duration: ${log.duration}
            </div>
        `;
        list.appendChild(item);
    });
}

function renderDashboard() {
    const emptyState = document.getElementById('dashboard-empty');
    const meds = getMeds();
    const activeTimerStr = localStorage.getItem(TIMER_KEY);
    
    if (meds.length === 0 || !activeTimerStr) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
}

// ==========================================
// 8. INITIALIZATION & LOOPS
// ==========================================
function tick() {
    updateClock();
    updateTimerUI();
}

// Single interval guarantees the clock and timer tick on the exact same frame
setInterval(tick, 100); 

tick();
renderMeds();
renderHistory();
renderDashboard();
