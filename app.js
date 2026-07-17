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
// 2. DECIMAL TIME ENGINE
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
// 3. UI ROUTING & MODALS
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
// 4. MEDICATION MANAGEMENT (ADD)
// ==========================================
document.getElementById('btn-open-add').addEventListener('click', () => {
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
});

// ==========================================
// 5. TRACKING FLOW & TIMER
// ==========================================
let currentTrackingMedId = null;

function renderMeds() {
    const meds = getMeds();
    const list = document.getElementById('meds-list');
    const emptyState = document.getElementById('meds-empty');
    const timerWidgetContainer = document.getElementById('meds-timer-widget');
    
    renderActiveTimerWidget(timerWidgetContainer);

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
        
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${med.name}</div>
                <div class="list-item-sub">${subText}</div>
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
    closeModal('modal-track');
    renderMeds();
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

function renderActiveTimerWidget(container) {
    const timerDataStr = localStorage.getItem(TIMER_KEY);
    
    if (!timerDataStr) {
        container.innerHTML = '';
        return;
    }

    const timerData = JSON.parse(timerDataStr);
    
    container.innerHTML = `
        <div class="timer-widget">
            <h3>Tracking: ${timerData.medName}</h3>
            <div class="timer-value" id="active-timer-display">00:00:00</div>
            <div class="mono" style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 10px;">
                ${timerData.dose}${timerData.unit} • ${timerData.route}
            </div>
            <button class="btn-stop" id="btn-stop-timer-global">Stop & Log</button>
        </div>
    `;

    document.getElementById('btn-stop-timer-global').addEventListener('click', stopTimer);
}

function updateTimerUI() {
    const display = document.getElementById('active-timer-display');
    if (!display) return;

    const timerDataStr = localStorage.getItem(TIMER_KEY);
    if (!timerDataStr) return;

    const timerData = JSON.parse(timerDataStr);
    const elapsed = getElapsedDecimalTime(timerData.startTime);
    display.textContent = elapsed.string;
}

// ==========================================
// 6. HISTORY LOGGING & BAUHAUS GRID
// ==========================================
function renderBauhausGrid() {
    const gridContainer = document.getElementById('bauhaus-grid');
    if(!gridContainer) return;
    
    const logs = getLogs();
    gridContainer.innerHTML = '';
    
    // Generate last 7 days
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

    renderBauhausGrid(); // Render the 7-day grid

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
    const container = document.getElementById('dashboard-timer-widget');
    renderActiveTimerWidget(container);
}

// ==========================================
// 7. INITIALIZATION & LOOPS
// ==========================================
setInterval(updateClock, 200);

setInterval(() => {
    if (localStorage.getItem(TIMER_KEY)) {
        updateTimerUI();
    }
}, 200);

updateClock();
renderMeds();
renderHistory();
renderDashboard();
