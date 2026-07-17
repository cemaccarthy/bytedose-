// ==========================================
// 1. LOCAL STORAGE HELPERS
// ==========================================
const MEDS_KEY = 'decimal_meds';
const LOGS_KEY = 'decimal_logs';
const TIMER_KEY = 'decimal_active_timer';

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
// 3. UI ROUTING
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
        
        // Refresh views when switching to them
        if(targetView === 'dashboard') renderDashboard();
        if(targetView === 'meds') renderMedsManage();
        if(targetView === 'history') renderHistory();
    });
});

// ==========================================
// 4. MEDICATION MANAGEMENT
// ==========================================
document.getElementById('btn-add-med').addEventListener('click', () => {
    const name = document.getElementById('input-med-name').value.trim();
    const dosage = document.getElementById('input-med-dosage').value.trim();
    const needsTimer = document.getElementById('input-med-timer').checked;

    if (!name || !dosage) {
        alert("Please enter a name and dosage.");
        return;
    }

    const meds = getMeds();
    meds.push({
        id: Date.now(),
        name,
        dosage,
        needsTimer
    });
    saveMeds(meds);

    // Clear form
    document.getElementById('input-med-name').value = '';
    document.getElementById('input-med-dosage').value = '';
    document.getElementById('input-med-timer').checked = false;

    renderMedsManage();
    renderDashboard();
});

function deleteMed(id) {
    if(!confirm("Delete this medication?")) return;
    let meds = getMeds();
    meds = meds.filter(m => m.id !== id);
    saveMeds(meds);
    renderMedsManage();
    renderDashboard();
}

function renderMedsManage() {
    const meds = getMeds();
    const list = document.getElementById('meds-manage-list');
    list.innerHTML = '';

    if (meds.length === 0) {
        list.innerHTML = '<p class="empty-state" style="padding: 20px;">No medications added yet.</p>';
        return;
    }

    meds.forEach(med => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${med.name}</div>
                <div class="list-item-sub">${med.dosage} ${med.needsTimer ? '• ⏱ Timer' : ''}</div>
            </div>
            <button class="btn-small btn-delete" onclick="deleteMed(${med.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

// ==========================================
// 5. DASHBOARD & TIMER LOGIC
// ==========================================
function renderDashboard() {
    const meds = getMeds();
    const list = document.getElementById('dashboard-meds-list');
    const emptyState = document.getElementById('dashboard-empty');
    const activeTimer = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null');
    
    const timerWidget = document.getElementById('timer-widget');
    
    // Handle Active Timer UI
    if (activeTimer) {
        const med = meds.find(m => m.id === activeTimer.medId);
        if (med) {
            timerWidget.classList.remove('hidden');
            document.getElementById('timer-med-name').textContent = `Timing: ${med.name}`;
            updateTimerUI();
        } else {
            // Med was deleted while timer was running
            localStorage.removeItem(TIMER_KEY);
            timerWidget.classList.add('hidden');
        }
    } else {
        timerWidget.classList.add('hidden');
    }

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
        
        let buttonHtml = '';
        if (activeTimer && activeTimer.medId === med.id) {
            buttonHtml = `<button class="btn-small btn-timing" disabled>Timing...</button>`;
        } else if (med.needsTimer) {
            buttonHtml = `<button class="btn-small btn-timer" onclick="startTimerForMed(${med.id})">Start Timer</button>`;
        } else {
            buttonHtml = `<button class="btn-small btn-take" onclick="logMedImmediate(${med.id})">Take</button>`;
        }

        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${med.name}</div>
                <div class="list-item-sub">${med.dosage}</div>
            </div>
            ${buttonHtml}
        `;
        list.appendChild(item);
    });
}

window.startTimerForMed = function(medId) {
    const timerData = {
        medId: medId,
        startTime: Date.now()
    };
    localStorage.setItem(TIMER_KEY, JSON.stringify(timerData));
    renderDashboard();
};

window.logMedImmediate = function(medId) {
    const meds = getMeds();
    const med = meds.find(m => m.id === medId);
    if (!med) return;

    const logs = getLogs();
    logs.unshift({
        id: Date.now(),
        medName: med.name,
        dosage: med.dosage,
        decimalTime: getDecimalTime().string,
        duration: null,
        timestamp: Date.now()
    });
    saveLogs(logs);
    
    // Quick visual feedback
    alert(`${med.name} logged at ${getDecimalTime().string}!`);
    renderHistory();
};

document.getElementById('btn-stop-timer').addEventListener('click', () => {
    const activeTimer = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null');
    if (!activeTimer) return;

    const meds = getMeds();
    const med = meds.find(m => m.id === activeTimer.medId);
    if (!med) {
        localStorage.removeItem(TIMER_KEY);
        renderDashboard();
        return;
    }

    const duration = getElapsedDecimalTime(activeTimer.startTime);
    
    const logs = getLogs();
    logs.unshift({
        id: Date.now(),
        medName: med.name,
        dosage: med.dosage,
        decimalTime: getDecimalTime().string,
        duration: duration.string,
        timestamp: Date.now()
    });
    saveLogs(logs);

    localStorage.removeItem(TIMER_KEY);
    renderDashboard();
    renderHistory();
});

function updateTimerUI() {
    const activeTimer = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null');
    if (!activeTimer) return;

    const elapsed = getElapsedDecimalTime(activeTimer.startTime);
    document.getElementById('timer-value').textContent = elapsed.string;
}

// ==========================================
// 6. HISTORY LOGGING
// ==========================================
function renderHistory() {
    const logs = getLogs();
    const list = document.getElementById('history-logs-list');
    const emptyState = document.getElementById('history-empty');

    list.innerHTML = '';

    if (logs.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        let durationHtml = '';
        if (log.duration) {
            durationHtml = `<div class="list-item-sub" style="color: var(--accent-blue);">⏱ Duration: ${log.duration}</div>`;
        }

        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${log.medName} (${log.dosage})</div>
                <div class="list-item-sub">Taken at ${log.decimalTime}</div>
                ${durationHtml}
            </div>
        `;
        list.appendChild(item);
    });
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

// Initial render
updateClock();
renderDashboard();
renderMedsManage();
renderHistory();
