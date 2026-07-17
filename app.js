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
// 2. AUDIO ENGINE (UPDATED TO USE LOCAL MP3 FILES)
// ==========================================
// Note: Ensure these files exist in your repo root
const START_SOUND = new Audio('start_tracking_med.mp3');
const ADD_SOUND = new Audio('add_medication.mp3');
// settings_toggle.mp3 is available if needed later

function playSound(audioObj) {
    // Clone allows overlapping sounds and prevents interrupting current playback
    const clone = audioObj.cloneNode();
    clone.volume = 0.8;
    clone.play().catch(e => console.log('Audio play prevented:', e));
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
        
        // UPDATED: Simplified text, no inline timer
        if (activeTimer && activeTimer.medId === med.id) {
            trackingHtml = `<div class="tracking-indicator">CURRENTLY TRACKING</div>`;
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

// Updated to only handle dashboard timer widget now
function updateTimerUI() {
    const timerDataStr = localStorage.getItem(TIMER_KEY);
    const display = document.getElementById('dashboard-timer-display');
    
    if (display && timerDataStr) {
        const timerData = JSON.parse(timerDataStr);
        const elapsed = getElapsedDecimalTime(timerData.startTime);
        display.textContent = elapsed.string;
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

// RESTORED: Full timer widget on Dashboard
function renderDashboard() {
    const container = document.getElementById('dashboard-timer-widget');
    const emptyState = document.getElementById('dashboard-empty');
    const timerDataStr = localStorage.getItem(TIMER_KEY);
    
    if (timerDataStr) {
        const timerData = JSON.parse(timerDataStr);
        emptyState.classList.add('hidden');
        
        container.innerHTML = `
            <div class="timer-widget">
                <h3>Tracking: ${timerData.medName}</h3>
                <div class="timer-value" id="dashboard-timer-display">00:00:00</div>
                <div class="mono" style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 10px;">
                    ${timerData.dose}${timerData.unit} • ${timerData.route}
                </div>
                <button class="btn-stop" id="btn-stop-timer-dashboard">Stop & Log</button>
            </div>
        `;
        
        document.getElementById('btn-stop-timer-dashboard').addEventListener('click', stopTimer);
        updateTimerUI(); // Set initial time immediately
    } else {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
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
