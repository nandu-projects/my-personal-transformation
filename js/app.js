// Main Controller for My Personal Transformation
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Managers
  const stateManager = window.appState || new StateManager();
  const taskManager = new TaskManager(stateManager);
  const timetableManager = new TimetableManager(stateManager);
  const routineManager = new RoutineManager(stateManager, timetableManager);
  const historyManager = new HistoryManager(stateManager, taskManager);
  const backupManager = new BackupManager(stateManager);

  // Workout Runner
  let workoutRunner = new WorkoutRunner(() => {
    // When workout finishes
    const activeDate = stateManager.getState().activeDate;
    stateManager.setTaskStatus(activeDate, 'workout_completed', 'DONE');
    closeModal('modalWorkout');
    showToast('🎉 Workout Completed! Marked as DONE.');
    renderAll();
  });

  // Study Timer state
  let studyTimerInterval = null;
  let studyTimerSeconds = 0;

  // Timetable active day tab
  let selectedTimetableDay = 'Monday';

  // 2. DOM Elements Cache
  const headerAppTitle = document.getElementById('headerAppTitle');
  const headerDateLabel = document.getElementById('headerDateLabel');
  const headerDayBadge = document.getElementById('headerDayBadge');
  const btnToggleTheme = document.getElementById('btnToggleTheme');
  const challengeBar = document.getElementById('challengeBar');

  // Screens & Navigation
  const screens = {
    screenHome: document.getElementById('screenHome'),
    screenHistory: document.getElementById('screenHistory'),
    screenTimetable: document.getElementById('screenTimetable'),
    screenSettings: document.getElementById('screenSettings')
  };
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');

  // Home Screen Elements
  const homeProgressPercent = document.getElementById('homeProgressPercent');
  const homeProgressRatio = document.getElementById('homeProgressRatio');
  const homeProgressBar = document.getElementById('homeProgressBar');
  const homeStatCompleted = document.getElementById('homeStatCompleted');
  const homeStatNotCompleted = document.getElementById('homeStatNotCompleted');
  const homeStatRemaining = document.getElementById('homeStatRemaining');

  // Sleep
  const inputSleepHours = document.getElementById('inputSleepHours');
  const lblSleepTarget = document.getElementById('lblSleepTarget');

  // Water
  const lblWaterConsumed = document.getElementById('lblWaterConsumed');
  const lblWaterTarget = document.getElementById('lblWaterTarget');

  // Nutrition
  const inputTodayWeight = document.getElementById('inputTodayWeight');
  const inputProteinConsumed = document.getElementById('inputProteinConsumed');
  const lblProteinTarget = document.getElementById('lblProteinTarget');

  // Study
  const inputStudyMinutes = document.getElementById('inputStudyMinutes');
  const lblStudyTarget = document.getElementById('lblStudyTarget');
  const btnStudyTimerToggle = document.getElementById('btnStudyTimerToggle');
  const lblStudyTimerStatus = document.getElementById('lblStudyTimerStatus');
  const lblStudyTimerCountdown = document.getElementById('lblStudyTimerCountdown');

  // Travel
  const lblTravelLeave = document.getElementById('lblTravelLeave');
  const lblTravelArrival = document.getElementById('lblTravelArrival');
  const lblTravelReturn = document.getElementById('lblTravelReturn');

  // Result Card
  const resultCompletedVal = document.getElementById('resultCompletedVal');
  const resultNotCompletedVal = document.getElementById('resultNotCompletedVal');
  const resultRemainingVal = document.getElementById('resultRemainingVal');
  const resultPercentVal = document.getElementById('resultPercentVal');
  const btnSaveDay = document.getElementById('btnSaveDay');
  const btnNextDay = document.getElementById('btnNextDay');

  // 3. Helper Functions
  function formatDateHeader(dateStr) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function showToast(msg) {
    const toast = document.getElementById('toastMessage');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }

  // Calculate arrival time string: startTime (HH:MM) + minutes
  function calculateArrivalTime(startTime, travelMin) {
    if (!startTime) return '08:50';
    const parts = startTime.split(':').map(Number);
    let totalMin = parts[0] * 60 + parts[1] + (parseInt(travelMin, 10) || 30);
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // 4. Rendering Functions
  function renderAll() {
    const state = stateManager.getState();
    const activeDate = state.activeDate;
    const record = stateManager.getRecord(activeDate);
    const dayName = taskManager.getDayName(activeDate);
    const dayNumber = record.dayNumber || stateManager.calculateDayNumber(activeDate);

    // Header Updates
    headerDateLabel.textContent = formatDateHeader(activeDate);
    headerDayBadge.textContent = `DAY ${dayNumber}`;

    // Theme
    document.documentElement.setAttribute('data-theme', state.profile.theme || 'dark');
    btnToggleTheme.textContent = state.profile.theme === 'light' ? '☀️' : '🌙';

    // Challenge Bar Pills
    document.querySelectorAll('.challenge-pill').forEach(pill => {
      const type = pill.dataset.days;
      if (type === state.profile.challengeType) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Render Home Screen
    renderHomeScreen(state, record, activeDate, dayName);

    // Render History Screen
    renderHistoryScreen(state);

    // Render Timetable Screen
    renderTimetableScreen();

    // Render Settings Screen
    renderSettingsScreen(state);
  }

  function renderHomeScreen(state, record, activeDate, dayName) {
    const stats = taskManager.calculateStats(activeDate);

    // Progress Bar & Hero Stats
    homeProgressPercent.textContent = `${stats.percentage}%`;
    homeProgressRatio.textContent = `${stats.completed} / ${stats.total} Tasks`;
    homeProgressBar.style.width = `${stats.percentage}%`;
    homeStatCompleted.textContent = stats.completed;
    homeStatNotCompleted.textContent = stats.notCompleted;
    homeStatRemaining.textContent = stats.remaining;

    // Sleep Section
    inputSleepHours.value = record.sleepHours !== undefined ? record.sleepHours : 8;
    lblSleepTarget.textContent = `${state.targets.sleepTargetHours} hours`;

    // Water Section
    lblWaterConsumed.textContent = (record.waterConsumedL || 0).toFixed(2);
    lblWaterTarget.textContent = state.targets.waterTargetL.toFixed(1);

    // Workout Summary
    const workoutInfo = WORKOUT_SCHEDULE[dayName] || WORKOUT_SCHEDULE.Monday;
    const summaryElem = document.getElementById('lblWorkoutSummary');
    if (summaryElem) {
      summaryElem.textContent = `${dayName.toUpperCase()}: ${workoutInfo.title} (${workoutInfo.duration}) - ${workoutInfo.description}`;
    }

    // Nutrition Section
    inputTodayWeight.value = record.weightKg || '';
    inputProteinConsumed.value = record.proteinConsumedG || 0;
    lblProteinTarget.textContent = state.targets.proteinTargetG;

    // Haircare notice
    const hairNotice = document.getElementById('lblHairCareNotice');
    if (hairNotice) {
      const isWash = state.hairCareSchedule.shampooDays.includes(dayName);
      hairNotice.textContent = isWash 
        ? `Today is a scheduled wash day (${dayName}). Shampoo & deep rinse.`
        : `Non-wash day. Gentle brushing and scalp care. (Wash days: ${state.hairCareSchedule.shampooDays.join(', ')})`;
    }

    // College (DSATM) Today's Classes preview
    const todayClasses = timetableManager.getClassesForDay(dayName);
    const classesContainer = document.getElementById('homeTodayClassesList');
    if (classesContainer) {
      if (todayClasses.length === 0) {
        classesContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">No classes scheduled for ${dayName}.</div>`;
      } else {
        classesContainer.innerHTML = todayClasses.map(c => `
          <div style="background: var(--bg-input); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; font-size: 0.82rem;">
            <div>
              <strong style="color: var(--color-brand);">${c.startTime} – ${c.endTime}</strong>: 
              <span style="color: var(--text-primary); font-weight: 600;">${c.subject}</span>
            </div>
            <div style="color: var(--text-muted); font-size: 0.76rem;">${c.room || ''}</div>
          </div>
        `).join('');
      }
    }

    // Travel Section
    lblTravelLeave.textContent = state.travel.leaveHomeTime || '08:20';
    lblTravelArrival.textContent = calculateArrivalTime(state.travel.leaveHomeTime, state.travel.expectedTravelMin);
    lblTravelReturn.textContent = state.travel.returnHomeTime || '16:30';

    // Study Section
    inputStudyMinutes.value = record.studyCompletedMin || 0;
    lblStudyTarget.textContent = state.targets.studyTargetMin;

    // Daily Timeline
    const timelineContainer = document.getElementById('homeTimelineList');
    if (timelineContainer) {
      const timelineItems = routineManager.getTodayTimeline(activeDate);
      timelineContainer.innerHTML = timelineItems.map(item => `
        <div class="timeline-item">
          <span class="timeline-time">${item.time}</span>
          <span class="timeline-label">${item.label}</span>
        </div>
      `).join('');
    }

    // Categorized Tasks Rendering
    const categories = taskManager.getTasksForDate(activeDate);
    const userTasks = record.tasks || {};

    categories.forEach(cat => {
      const listElem = document.getElementById(`taskList-${cat.id}`);
      if (!listElem) return;

      listElem.innerHTML = cat.tasks.map(t => {
        const status = userTasks[t.id] || 'PENDING';
        let symbol = '⏳';
        if (status === 'DONE') symbol = '✅';
        else if (status === 'NOT_DONE') symbol = '❌';

        const isDoneActive = status === 'DONE' ? 'active' : '';
        const isNotDoneActive = status === 'NOT_DONE' ? 'active' : '';

        return `
          <div class="task-item" data-task-id="${t.id}">
            <div class="task-info">
              <span class="task-status-symbol">${symbol}</span>
              <div class="task-text">
                <div class="task-title">${t.title}</div>
                ${t.hint ? `<div class="task-hint">${t.hint}</div>` : ''}
              </div>
            </div>
            <div class="task-actions">
              <button class="btn-task btn-done ${isDoneActive}" data-action="DONE" data-id="${t.id}">
                ✅ DONE
              </button>
              <button class="btn-task btn-not-done ${isNotDoneActive}" data-action="NOT_DONE" data-id="${t.id}">
                ❌ NOT DONE
              </button>
            </div>
          </div>
        `;
      }).join('');
    });

    // Daily Result Section
    resultCompletedVal.textContent = stats.completed;
    resultNotCompletedVal.textContent = stats.notCompleted;
    resultRemainingVal.textContent = stats.remaining;
    resultPercentVal.textContent = `${stats.percentage}%`;

    if (record.saved) {
      btnSaveDay.textContent = '✅ DAY SAVED (Tap to Update)';
      btnSaveDay.style.background = 'var(--bg-card-hover)';
      btnSaveDay.style.border = '1px solid var(--color-brand)';
    } else {
      btnSaveDay.textContent = '💾 SAVE DAY';
      btnSaveDay.style.background = 'var(--color-brand)';
      btnSaveDay.style.border = 'none';
    }
  }

  function renderHistoryScreen(state) {
    const streaks = historyManager.calculateStreaks();
    document.getElementById('historyCurrentStreak').textContent = streaks.currentStreak;
    document.getElementById('historyBestStreak').textContent = streaks.bestStreak;

    // Challenge Progress
    const activeDate = state.activeDate;
    const currentDayNum = stateManager.calculateDayNumber(activeDate);
    const targetDays = state.profile.challengeType === 'unlimited' ? '∞' : (state.profile.challengeDays || 30);
    document.getElementById('historyChallengeProgress').textContent = `DAY ${currentDayNum} / ${targetDays}`;

    // History Cards
    const historyList = historyManager.getHistoryList();
    const container = document.getElementById('historyListContainer');
    if (!container) return;

    if (historyList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 30px; font-size: 0.9rem;">
          No days recorded yet. Save today's progress to start building your streak!
        </div>
      `;
      return;
    }

    container.innerHTML = historyList.map(h => `
      <div class="history-card" data-date="${h.date}">
        <div class="history-card-left">
          <div class="history-day-title">Day ${h.dayNumber} ${h.saved ? '✓' : ''}</div>
          <div class="history-date">${formatDateHeader(h.date)}</div>
          <div class="history-summary-text">
            ✅ ${h.completed} | ❌ ${h.notCompleted} | 💧 ${h.waterConsumedL}L | 💤 ${h.sleepHours}h
          </div>
        </div>
        <div class="history-card-right">
          <div class="history-percent">${h.percentage}%</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Tap to view</div>
        </div>
      </div>
    `).join('');
  }

  function renderTimetableScreen() {
    const classes = timetableManager.getClassesForDay(selectedTimetableDay);
    const container = document.getElementById('timetableClassesContainer');
    if (!container) return;

    // Update active tab button
    document.querySelectorAll('.day-tab-btn').forEach(btn => {
      if (btn.dataset.day === selectedTimetableDay) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (classes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 0.88rem;">
          No classes scheduled for ${selectedTimetableDay}. Tap "Add Class" to schedule lectures or labs.
        </div>
      `;
      return;
    }

    container.innerHTML = classes.map(c => `
      <div class="class-card">
        <div>
          <div class="class-time">${c.startTime} – ${c.endTime}</div>
          <div class="class-subj">${c.subject}</div>
          <div class="class-room">${c.room || 'DSATM Campus'}</div>
        </div>
        <div class="class-actions">
          <button class="btn-icon btn-edit-class" data-id="${c.id}" title="Edit Class">✏️</button>
          <button class="btn-icon btn-del-class" data-id="${c.id}" style="color: var(--color-danger);" title="Delete Class">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  function renderSettingsScreen(state) {
    document.getElementById('settingName').value = state.profile.name || 'Nandan';
    document.getElementById('settingChallengeDays').value = state.profile.challengeType;
    if (state.profile.challengeType === 'custom') {
      document.getElementById('rowCustomDays').style.display = 'flex';
      document.getElementById('settingCustomDaysVal').value = state.profile.challengeDays || 30;
    } else {
      document.getElementById('rowCustomDays').style.display = 'none';
    }

    document.getElementById('settingWaterTarget').value = state.targets.waterTargetL;
    document.getElementById('settingProteinTarget').value = state.targets.proteinTargetG;
    document.getElementById('settingStudyTarget').value = state.targets.studyTargetMin;
    document.getElementById('settingSleepTarget').value = state.targets.sleepTargetHours;

    document.getElementById('settingLeaveTime').value = state.travel.leaveHomeTime || '08:20';
    document.getElementById('settingTravelMin').value = state.travel.expectedTravelMin || 30;
    document.getElementById('settingReturnTime').value = state.travel.returnHomeTime || '16:30';

    // Hair Shampoo Days Checkboxes
    const hairContainer = document.getElementById('settingsHairDayChecks');
    if (hairContainer) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      hairContainer.innerHTML = days.map(d => {
        const checked = state.hairCareSchedule.shampooDays.includes(d) ? 'checked' : '';
        return `
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="hair-day-cb" value="${d}" ${checked}>
            <span>${d}</span>
          </label>
        `;
      }).join('');
    }

    // Skincare products list
    const skinContainer = document.getElementById('settingsSkincareList');
    if (skinContainer) {
      skinContainer.innerHTML = (state.skincareProducts || []).map(p => `
        <div style="background: var(--bg-input); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <div>
            <strong>${p.name}</strong> <span style="font-size: 0.76rem; color: var(--color-brand); margin-left: 6px;">[${p.time}]</span>
          </div>
          <button class="btn-icon btn-del-skincare" data-id="${p.id}" style="width: 28px; height: 28px; font-size: 0.8rem; color: var(--color-danger);">✕</button>
        </div>
      `).join('');
    }

    // Reminders
    const remindersContainer = document.getElementById('settingsRemindersList');
    if (remindersContainer) {
      const labels = {
        wakeUp: 'Wake up reminder',
        workout: 'Workout reminder',
        meals: 'Meals / Nutrition reminder',
        study: 'Study focus reminder',
        skincare: 'Skincare reminder',
        sleep: 'Sleep preparation reminder'
      };
      remindersContainer.innerHTML = Object.keys(state.reminders).map(key => {
        const rem = state.reminders[key];
        const isChecked = rem.enabled ? 'checked' : '';
        return `
          <div class="form-row">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" class="reminder-toggle" data-key="${key}" ${isChecked}>
              <span>${labels[key] || key}</span>
            </label>
            <input type="time" class="form-control reminder-time" data-key="${key}" value="${rem.time || '08:00'}" style="width: 100px;">
          </div>
        `;
      }).join('');
    }
  }

  // 5. Global Event Handlers
  // Bottom Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
      });
      if (screens[targetId]) {
        screens[targetId].classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  });

  // Theme Toggle
  btnToggleTheme.addEventListener('click', () => {
    const current = stateManager.getState().profile.theme || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    stateManager.updateProfile({ theme: next });
    renderAll();
    showToast(`Switched to ${next} mode`);
  });

  // Challenge Pills Selection
  challengeBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.challenge-pill');
    if (!pill) return;
    const type = pill.dataset.days;
    let days = 30;
    if (type === '7') days = 7;
    else if (type === '14') days = 14;
    else if (type === '30') days = 30;
    else if (type === '60') days = 60;
    else if (type === '90') days = 90;
    else if (type === 'custom') {
      const input = prompt('Enter custom challenge duration (days):', '45');
      if (input && !isNaN(parseInt(input, 10))) {
        days = parseInt(input, 10);
      } else {
        return;
      }
    } else if (type === 'unlimited') {
      days = 365;
    }

    stateManager.updateProfile({
      challengeType: type,
      challengeDays: days
    });
    renderAll();
    showToast(`Challenge set to ${type === 'unlimited' ? 'Ongoing' : days + ' Days'}`);
  });

  // Task Buttons Delegation (✅ DONE / ❌ NOT DONE)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-task');
    if (!btn) return;
    const action = btn.dataset.action; // 'DONE' or 'NOT_DONE'
    const taskId = btn.dataset.id;
    const activeDate = stateManager.getState().activeDate;
    const currentRec = stateManager.getRecord(activeDate);

    // If already active, toggling can reset to PENDING, otherwise set new status
    const currentStatus = currentRec.tasks ? currentRec.tasks[taskId] : 'PENDING';
    const newStatus = currentStatus === action ? 'PENDING' : action;

    stateManager.setTaskStatus(activeDate, taskId, newStatus);
    renderAll();
  });

  // Sleep hours input
  inputSleepHours.addEventListener('change', () => {
    const val = parseFloat(inputSleepHours.value) || 0;
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { sleepHours: val });
    if (val >= 7) {
      stateManager.setTaskStatus(activeDate, 'sleep_hours', 'DONE');
    }
    renderAll();
    showToast(`Sleep logged: ${val} hours`);
  });

  // Water Quick Buttons
  function addWater(ml) {
    const activeDate = stateManager.getState().activeDate;
    const currentRec = stateManager.getRecord(activeDate);
    const addedL = ml / 1000;
    const newTotal = Math.round(((currentRec.waterConsumedL || 0) + addedL) * 100) / 100;
    stateManager.updateRecord(activeDate, { waterConsumedL: newTotal });

    const target = stateManager.getState().targets.waterTargetL;
    if (newTotal >= target) {
      stateManager.setTaskStatus(activeDate, 'water_target', 'DONE');
    }
    renderAll();
    showToast(`+${ml}ml water logged (${newTotal}L total)`);
  }

  document.getElementById('btnAddWater250').addEventListener('click', () => addWater(250));
  document.getElementById('btnAddWater500').addEventListener('click', () => addWater(500));
  document.getElementById('btnAddWater1000').addEventListener('click', () => addWater(1000));
  document.getElementById('btnResetWater').addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { waterConsumedL: 0 });
    stateManager.setTaskStatus(activeDate, 'water_target', 'PENDING');
    renderAll();
    showToast('Water reset to 0L');
  });

  // Nutrition Quick Buttons & Inputs
  inputTodayWeight.addEventListener('change', () => {
    const val = parseFloat(inputTodayWeight.value) || '';
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { weightKg: val });
    showToast(`Weight recorded: ${val} kg`);
  });

  function addProtein(g) {
    const activeDate = stateManager.getState().activeDate;
    const currentRec = stateManager.getRecord(activeDate);
    const newTotal = (currentRec.proteinConsumedG || 0) + g;
    stateManager.updateRecord(activeDate, { proteinConsumedG: newTotal });

    const target = stateManager.getState().targets.proteinTargetG;
    if (newTotal >= target) {
      stateManager.setTaskStatus(activeDate, 'nutri_protein', 'DONE');
    }
    renderAll();
    showToast(`+${g}g protein logged (${newTotal}g total)`);
  }

  document.getElementById('btnAddProtein10').addEventListener('click', () => addProtein(10));
  document.getElementById('btnAddProtein20').addEventListener('click', () => addProtein(20));
  document.getElementById('btnAddProtein30').addEventListener('click', () => addProtein(30));
  document.getElementById('btnResetProtein').addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { proteinConsumedG: 0 });
    stateManager.setTaskStatus(activeDate, 'nutri_protein', 'PENDING');
    renderAll();
    showToast('Protein reset to 0g');
  });

  inputProteinConsumed.addEventListener('change', () => {
    const val = parseInt(inputProteinConsumed.value, 10) || 0;
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { proteinConsumedG: val });
    const target = stateManager.getState().targets.proteinTargetG;
    if (val >= target) {
      stateManager.setTaskStatus(activeDate, 'nutri_protein', 'DONE');
    }
    renderAll();
  });

  // Study Inputs & Simple Timer
  inputStudyMinutes.addEventListener('change', () => {
    const val = parseInt(inputStudyMinutes.value, 10) || 0;
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { studyCompletedMin: val });
    const target = stateManager.getState().targets.studyTargetMin;
    if (val >= target) {
      stateManager.setTaskStatus(activeDate, 'study_revision', 'DONE');
    }
    renderAll();
  });

  function addStudyMinutes(min) {
    const activeDate = stateManager.getState().activeDate;
    const currentRec = stateManager.getRecord(activeDate);
    const newTotal = (currentRec.studyCompletedMin || 0) + min;
    stateManager.updateRecord(activeDate, { studyCompletedMin: newTotal });
    const target = stateManager.getState().targets.studyTargetMin;
    if (newTotal >= target) {
      stateManager.setTaskStatus(activeDate, 'study_revision', 'DONE');
    }
    renderAll();
    showToast(`+${min} mins study logged (${newTotal}m total)`);
  }

  document.getElementById('btnStudyTimer15').addEventListener('click', () => addStudyMinutes(15));
  document.getElementById('btnStudyTimer30').addEventListener('click', () => addStudyMinutes(30));
  document.getElementById('btnResetStudy').addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    stateManager.updateRecord(activeDate, { studyCompletedMin: 0 });
    renderAll();
    showToast('Study minutes reset to 0');
  });

  btnStudyTimerToggle.addEventListener('click', () => {
    if (studyTimerInterval) {
      clearInterval(studyTimerInterval);
      studyTimerInterval = null;
      btnStudyTimerToggle.textContent = '⏱️ Resume Timer';
      showToast(`Study timer paused. ${Math.floor(studyTimerSeconds / 60)} min completed.`);
    } else {
      lblStudyTimerStatus.style.display = 'block';
      btnStudyTimerToggle.textContent = '⏸️ Pause Timer';
      studyTimerInterval = setInterval(() => {
        studyTimerSeconds++;
        const mins = Math.floor(studyTimerSeconds / 60);
        const secs = studyTimerSeconds % 60;
        lblStudyTimerCountdown.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        // Auto-add minute every 60s
        if (studyTimerSeconds > 0 && studyTimerSeconds % 60 === 0) {
          const activeDate = stateManager.getState().activeDate;
          const rec = stateManager.getRecord(activeDate);
          stateManager.updateRecord(activeDate, { studyCompletedMin: (rec.studyCompletedMin || 0) + 1 });
          renderAll();
        }
      }, 1000);
      showToast('Study focus timer started!');
    }
  });

  // Workout Runner Modal
  document.getElementById('btnStartWorkoutModal').addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    const dayName = taskManager.getDayName(activeDate);
    const workout = workoutRunner.startWorkout(dayName);
    document.getElementById('workoutModalTitle').textContent = `${dayName}: ${workout.title}`;
    updateWorkoutModalUI();
    openModal('modalWorkout');
  });

  document.getElementById('btnCloseWorkoutModal').addEventListener('click', () => {
    workoutRunner.pause();
    closeModal('modalWorkout');
  });

  function updateWorkoutModalUI() {
    const ex = workoutRunner.getCurrentExercise();
    if (!ex) return;
    document.getElementById('workoutExName').textContent = ex.name;
    document.getElementById('workoutExReps').textContent = ex.reps;
    document.getElementById('workoutCountdown').textContent = workoutRunner.remainingSec;
    document.getElementById('workoutExInstructions').textContent = ex.instructions;
    document.getElementById('btnWorkoutPlayPause').textContent = workoutRunner.isRunning ? '⏸️ Pause' : '▶ Play';

    const totalSec = ex.durationSec || 45;
    const pct = Math.max(0, Math.min(100, Math.round((workoutRunner.remainingSec / totalSec) * 100)));
    document.getElementById('workoutExProgress').style.width = `${pct}%`;
  }

  document.getElementById('btnWorkoutPlayPause').addEventListener('click', () => {
    workoutRunner.togglePlayPause((rem, ex) => {
      updateWorkoutModalUI();
    });
    updateWorkoutModalUI();
  });

  document.getElementById('btnWorkoutNext').addEventListener('click', () => {
    workoutRunner.next((rem, ex) => {
      updateWorkoutModalUI();
    });
    updateWorkoutModalUI();
  });

  document.getElementById('btnWorkoutPrev').addEventListener('click', () => {
    workoutRunner.prev();
    updateWorkoutModalUI();
  });

  document.getElementById('btnFinishWorkout').addEventListener('click', () => {
    workoutRunner.finish();
  });

  // Posture modal
  document.getElementById('btnViewPostureGuide').addEventListener('click', () => {
    openModal('modalPosture');
  });
  document.getElementById('btnClosePostureModal').addEventListener('click', () => {
    closeModal('modalPosture');
  });
  document.getElementById('btnDonePostureModal').addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    stateManager.setTaskStatus(activeDate, 'posture_stretch', 'DONE');
    closeModal('modalPosture');
    renderAll();
    showToast('Posture routine logged as DONE ✅');
  });

  // SAVE DAY & NEXT DAY
  btnSaveDay.addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    const stats = taskManager.calculateStats(activeDate);
    stateManager.updateRecord(activeDate, { saved: true });
    renderAll();
    showToast(`🎉 Day Saved! Completed: ${stats.completed}/${stats.total} (${stats.percentage}%)`);
  });

  btnNextDay.addEventListener('click', () => {
    const activeDate = stateManager.getState().activeDate;
    const parts = activeDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + 1);

    const nextDateStr = d.toISOString().split('T')[0];
    stateManager.setActiveDate(nextDateStr);
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Moved to ${formatDateHeader(nextDateStr)}`);
  });

  // HISTORY CARD CLICK -> DETAILS MODAL
  document.getElementById('historyListContainer').addEventListener('click', (e) => {
    const card = e.target.closest('.history-card');
    if (!card) return;
    const dateStr = card.dataset.date;
    const detail = historyManager.getDayDetail(dateStr);

    document.getElementById('historyDetailTitle').textContent = `Day ${detail.dayNumber} Review (${detail.date})`;
    const content = document.getElementById('historyDetailContent');
    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 2rem; font-weight: 900; color: var(--color-brand);">${detail.stats.percentage}%</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          ✅ ${detail.stats.completed} Completed | ❌ ${detail.stats.notCompleted} Incomplete | ⏳ ${detail.stats.remaining} Remaining
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 0.8rem; background: var(--bg-card); padding: 10px; border-radius: var(--radius-md);">
        <div>💧 Water: <strong>${detail.metrics.waterConsumedL || 0} L</strong></div>
        <div>💤 Sleep: <strong>${detail.metrics.sleepHours || 0} hrs</strong></div>
        <div>🥗 Protein: <strong>${detail.metrics.proteinConsumedG || 0} g</strong></div>
        <div>📚 Study: <strong>${detail.metrics.studyCompletedMin || 0} min</strong></div>
        ${detail.metrics.weightKg ? `<div>⚖️ Weight: <strong>${detail.metrics.weightKg} kg</strong></div>` : ''}
      </div>

      <div style="font-size: 0.88rem; font-weight: 700; margin-bottom: 8px; color: var(--color-success);">✅ Completed Tasks (${detail.completedTasks.length}):</div>
      <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
        ${detail.completedTasks.length === 0 ? '<div style="font-size: 0.8rem; color: var(--text-muted);">None</div>' : detail.completedTasks.map(t => `
          <div style="background: var(--bg-input); padding: 6px 10px; border-radius: var(--radius-sm); font-size: 0.82rem; border-left: 3px solid var(--color-success);">
            ${t.title}
          </div>
        `).join('')}
      </div>

      <div style="font-size: 0.88rem; font-weight: 700; margin-bottom: 8px; color: var(--color-danger);">❌ Incomplete / Remaining (${detail.incompleteTasks.length}):</div>
      <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
        ${detail.incompleteTasks.length === 0 ? '<div style="font-size: 0.8rem; color: var(--text-muted);">All tasks completed!</div>' : detail.incompleteTasks.map(t => `
          <div style="background: var(--bg-input); padding: 6px 10px; border-radius: var(--radius-sm); font-size: 0.82rem; border-left: 3px solid var(--color-danger);">
            ${t.title}
          </div>
        `).join('')}
      </div>

      <button class="btn-chip" id="btnSwitchToThisDay" style="width: 100%; background: var(--bg-card-hover);">
        Open This Day on Home Screen
      </button>
    `;

    document.getElementById('btnSwitchToThisDay').onclick = () => {
      stateManager.setActiveDate(dateStr);
      closeModal('modalHistoryDetail');
      // Switch to home nav
      document.querySelector('.bottom-nav [data-target="screenHome"]').click();
      renderAll();
      showToast(`Switched view to ${dateStr}`);
    };

    openModal('modalHistoryDetail');
  });

  document.getElementById('btnCloseHistoryDetail').addEventListener('click', () => {
    closeModal('modalHistoryDetail');
  });

  // TIMETABLE TAB SWITCHING & CLASS CRUD
  document.getElementById('timetableDayTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.day-tab-btn');
    if (!btn) return;
    selectedTimetableDay = btn.dataset.day;
    renderTimetableScreen();
  });

  // Add Class
  document.getElementById('btnAddClassBtn').addEventListener('click', () => {
    document.getElementById('modalClassTitle').textContent = `Add Class (${selectedTimetableDay})`;
    document.getElementById('modalClassId').value = '';
    document.getElementById('modalClassDay').value = selectedTimetableDay;
    document.getElementById('modalClassSubject').value = '';
    document.getElementById('modalClassStart').value = '09:30';
    document.getElementById('modalClassEnd').value = '10:30';
    document.getElementById('modalClassRoom').value = 'DSATM Room 201';
    openModal('modalClass');
  });

  document.getElementById('btnCloseClassModal').addEventListener('click', () => {
    closeModal('modalClass');
  });

  document.getElementById('btnSaveClassModal').addEventListener('click', () => {
    const classId = document.getElementById('modalClassId').value;
    const day = document.getElementById('modalClassDay').value || selectedTimetableDay;
    const subject = document.getElementById('modalClassSubject').value.trim();
    const startTime = document.getElementById('modalClassStart').value;
    const endTime = document.getElementById('modalClassEnd').value;
    const room = document.getElementById('modalClassRoom').value.trim();

    if (!subject) {
      alert('Please enter a class subject name');
      return;
    }

    if (classId) {
      // Edit
      timetableManager.updateClass(day, classId, { subject, startTime, endTime, room });
      showToast('Class updated successfully');
    } else {
      // Add
      timetableManager.addClass(day, { subject, startTime, endTime, room });
      showToast('Class added to ' + day);
    }

    closeModal('modalClass');
    renderAll();
  });

  // Edit / Delete Class delegation
  document.getElementById('timetableClassesContainer').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-class');
    const delBtn = e.target.closest('.btn-del-class');

    if (editBtn) {
      const classId = editBtn.dataset.id;
      const classes = timetableManager.getClassesForDay(selectedTimetableDay);
      const target = classes.find(c => c.id === classId);
      if (!target) return;

      document.getElementById('modalClassTitle').textContent = `Edit Class (${selectedTimetableDay})`;
      document.getElementById('modalClassId').value = target.id;
      document.getElementById('modalClassDay').value = selectedTimetableDay;
      document.getElementById('modalClassSubject').value = target.subject;
      document.getElementById('modalClassStart').value = target.startTime;
      document.getElementById('modalClassEnd').value = target.endTime;
      document.getElementById('modalClassRoom').value = target.room || '';
      openModal('modalClass');
    }

    if (delBtn) {
      const classId = delBtn.dataset.id;
      if (confirm('Delete this class?')) {
        timetableManager.deleteClass(selectedTimetableDay, classId);
        renderAll();
        showToast('Class deleted');
      }
    }
  });

  // SETTINGS HANDLERS
  document.getElementById('settingName').addEventListener('change', (e) => {
    stateManager.updateProfile({ name: e.target.value.trim() });
    showToast('Name updated');
  });

  document.getElementById('settingChallengeDays').addEventListener('change', (e) => {
    const val = e.target.value;
    let days = 30;
    if (val === '7') days = 7;
    else if (val === '14') days = 14;
    else if (val === '30') days = 30;
    else if (val === '60') days = 60;
    else if (val === '90') days = 90;
    else if (val === 'custom') {
      days = parseInt(document.getElementById('settingCustomDaysVal').value, 10) || 30;
    } else if (val === 'unlimited') {
      days = 365;
    }
    stateManager.updateProfile({ challengeType: val, challengeDays: days });
    renderAll();
  });

  document.getElementById('settingCustomDaysVal').addEventListener('change', (e) => {
    const days = parseInt(e.target.value, 10) || 30;
    stateManager.updateProfile({ challengeType: 'custom', challengeDays: days });
    renderAll();
  });

  document.getElementById('settingWaterTarget').addEventListener('change', (e) => {
    const val = parseFloat(e.target.value) || 3.0;
    stateManager.updateTargets({ waterTargetL: val });
    renderAll();
    showToast('Water target updated');
  });

  document.getElementById('settingProteinTarget').addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10) || 70;
    stateManager.updateTargets({ proteinTargetG: val });
    renderAll();
    showToast('Protein target updated');
  });

  document.getElementById('settingStudyTarget').addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10) || 90;
    stateManager.updateTargets({ studyTargetMin: val });
    renderAll();
    showToast('Study target updated');
  });

  document.getElementById('settingSleepTarget').addEventListener('change', (e) => {
    stateManager.updateTargets({ sleepTargetHours: e.target.value.trim() || '7–9' });
    renderAll();
  });

  document.getElementById('settingLeaveTime').addEventListener('change', (e) => {
    stateManager.updateTravel({ leaveHomeTime: e.target.value });
    renderAll();
  });

  document.getElementById('settingTravelMin').addEventListener('change', (e) => {
    stateManager.updateTravel({ expectedTravelMin: parseInt(e.target.value, 10) || 30 });
    renderAll();
  });

  document.getElementById('settingReturnTime').addEventListener('change', (e) => {
    stateManager.updateTravel({ returnHomeTime: e.target.value });
    renderAll();
  });

  // Hair care days checkboxes
  document.getElementById('settingsHairDayChecks').addEventListener('change', () => {
    const selected = [];
    document.querySelectorAll('.hair-day-cb:checked').forEach(cb => selected.push(cb.value));
    stateManager.setHairCareSchedule({
      ...stateManager.getState().hairCareSchedule,
      shampooDays: selected
    });
    renderAll();
    showToast('Shampoo days updated');
  });

  // Skincare Products Add & Delete
  document.getElementById('btnAddSkincareProduct').addEventListener('click', () => {
    const name = prompt('Enter skincare product name (e.g. Aloe Vera Gel, Cleanser):');
    if (!name || !name.trim()) return;
    const timeChoice = confirm('Click OK for Morning, or CANCEL for Night') ? 'Morning' : 'Night';
    const products = [...(stateManager.getState().skincareProducts || [])];
    products.push({
      id: 'sk_' + Date.now(),
      name: name.trim(),
      time: timeChoice
    });
    stateManager.setSkincareProducts(products);
    renderAll();
    showToast(`Added ${name} to ${timeChoice} skincare`);
  });

  document.getElementById('settingsSkincareList').addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-del-skincare');
    if (!delBtn) return;
    const id = delBtn.dataset.id;
    const products = (stateManager.getState().skincareProducts || []).filter(p => p.id !== id);
    stateManager.setSkincareProducts(products);
    renderAll();
    showToast('Product removed');
  });

  // Reminders Toggle & Time
  document.getElementById('settingsRemindersList').addEventListener('change', (e) => {
    const toggle = e.target.closest('.reminder-toggle');
    const timeInput = e.target.closest('.reminder-time');
    const reminders = { ...stateManager.getState().reminders };

    if (toggle) {
      const key = toggle.dataset.key;
      reminders[key] = { ...reminders[key], enabled: toggle.checked };
      stateManager.updateReminders(reminders);
      showToast(`Reminder ${toggle.checked ? 'enabled' : 'disabled'}`);
    }

    if (timeInput) {
      const key = timeInput.dataset.key;
      reminders[key] = { ...reminders[key], time: timeInput.value };
      stateManager.updateReminders(reminders);
      showToast('Reminder time updated');
    }
  });

  // Backup & Restore
  document.getElementById('btnExportBackup').addEventListener('click', () => {
    const res = backupManager.exportBackup();
    if (res.success) {
      showToast(res.message);
    } else {
      alert(res.message);
    }
  });

  const importFileInput = document.getElementById('importFileInput');
  document.getElementById('btnTriggerImport').addEventListener('click', () => {
    importFileInput.value = '';
    importFileInput.click();
  });

  importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await backupManager.importBackup(file);
      renderAll();
      showToast(res.message);
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  });

  document.getElementById('btnResetApp').addEventListener('click', () => {
    if (confirm('WARNING: Are you sure you want to reset all data and history? This cannot be undone.')) {
      if (confirm('Please confirm once more: Reset everything to default?')) {
        stateManager.resetAll();
        renderAll();
        showToast('All app data has been reset to defaults');
      }
    }
  });

  // Service Worker Registration for Offline Cache
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(
        reg => console.log('ServiceWorker registered with scope:', reg.scope),
        err => console.log('ServiceWorker registration failed:', err)
      );
    });
  }

  // 6. Initial Render
  renderAll();
});
