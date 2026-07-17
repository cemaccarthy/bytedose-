// ==========================================
// 1. UI ROUTING (Bottom Navigation)
// ==========================================
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        
        // Update active button
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active view
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${targetView}`).classList.add('active');
    });
});

// ==========================================
// 2. DECIMAL TIME ENGINE
// ==========================================
function getDecimalTime(date = new Date()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ms = date.getMilliseconds();

    // Total standard seconds since midnight
    const totalStandardSeconds = (hours * 3600) + (minutes * 60) + seconds + (ms / 1000);

    // Convert to decimal seconds (1 day = 100,000 decimal seconds)
    const totalDecimalSeconds = (totalStandardSeconds / 86400) * 100000;

    const dHours = Math.floor(totalDecimalSeconds / 10000);
    const dMinutes = Math.floor((totalDecimalSeconds % 10000) / 100);
    const dSeconds = Math.floor(totalDecimalSeconds % 100);

    return {
        hh: String(dHours).padStart(2, '0'),
        mm: String(dMinutes).padStart(2, '0'),
        ss: String(dSeconds).padStart(2, '0')
    };
}

function updateClock() {
    const time = getDecimalTime();
    document.getElementById('decimal-clock').textContent = `${time.hh}:${time.mm}:${time.ss}`;
}

// ==========================================
// 3. SURVIVAL TIMER ENGINE
// ==========================================
const TIMER_KEY = 'decimal_med_tracker_active_timer';

function startTimer() {
    // Save the exact millisecond timestamp to LocalStorage
    localStorage.setItem(TIMER_KEY, Date.now().toString());
    updateTimerUI();
}

function stopTimer() {
    // Clear the timestamp
    localStorage.removeItem(TIMER_KEY);
    updateTimerUI();
    // In Step 2, this is where we will save the final duration to the History log!
    alert("Timer stopped! (Logging to history will be added in Step 2)");
}

function getElapsedDecimalTime() {
    const startTimeStr = localStorage.getItem(TIMER_KEY);
    if (!startTimeStr) return null;

    const startTime = parseInt(startTimeStr, 10);
    const elapsedMs = Date.now() - startTime;
    
    // Convert elapsed milliseconds to decimal time format
    const totalStandardSeconds = elapsedMs / 1000;
    const totalDecimalSeconds = (totalStandardSeconds / 86400) * 100000;

    const dHours = Math.floor(totalDecimalSeconds / 10000);
    const dMinutes = Math.floor((totalDecimalSeconds % 10000) / 100);
    const dSeconds = Math.floor(totalDecimalSeconds % 100);

    return {
        hh: String(dHours).padStart(2, '0'),
        mm: String(dMinutes).padStart(2, '0'),
        ss: String(dSeconds).padStart(2, '0')
    };
}

function updateTimerUI() {
    const elapsed = getElapsedDecimalTime();
    const timerWidget = document.getElementById('timer-widget');
    const noTimerMsg = document.getElementById('no-timer-msg');
    const timerValue = document.getElementById('timer-value');

    if (elapsed) {
        // Timer is running
        timerWidget.classList.remove('hidden');
        noTimerMsg.classList.add('hidden');
        timerValue.textContent = `${elapsed.hh}:${elapsed.mm}:${elapsed.ss}`;
    } else {
        // No timer running
        timerWidget.classList.add('hidden');
        noTimerMsg.classList.remove('hidden');
    }
}

// ==========================================
// 4. INITIALIZATION & LOOPS
// ==========================================
document.getElementById('btn-start-timer').addEventListener('click', startTimer);
document.getElementById('btn-stop-timer').addEventListener('click', stopTimer);

// Update the clock every 200ms (1 decimal second is ~0.86 standard seconds, so this is perfectly smooth)
setInterval(updateClock, 200);

// Update the timer UI every 200ms if a timer is active
setInterval(() => {
    if (localStorage.getItem(TIMER_KEY)) {
        updateTimerUI();
    }
}, 200);

// Run once on load to catch any existing timers or set the initial clock
updateClock();
updateTimerUI();
