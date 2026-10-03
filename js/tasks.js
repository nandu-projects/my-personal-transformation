// Task definitions and daily checklist generator
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class TaskManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  // Get day name for a given date YYYY-MM-DD
  getDayName(dateStr) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return DAY_NAMES[date.getDay()];
  }

  // Generate complete list of today's tasks grouped by category in the requested daily order
  getTasksForDate(dateStr) {
    const state = this.stateManager.getState();
    const dayName = this.getDayName(dateStr);
    const times = state.scheduleTimes || {};
    const categories = [];

    // 1. 🌅 MORNING
    categories.push({
      id: 'morning',
      title: 'Morning Routine',
      icon: '🌅',
      description: 'Morning jumpstart: hydration, movement, nourishment, and grooming.',
      tasks: [
        { id: 'task_wake', title: 'Wake up on planned time', time: times.wakeUp || '06:30 AM', hint: 'Start the day consistently' },
        { id: 'task_morning_water', title: 'Morning water (500 ml)', time: times.morningWater || '06:40 AM', hint: 'Rehydrate first thing' },
        { id: 'task_workout', title: 'Home workout & posture routine', time: times.workout || '06:45–07:15 AM', hint: '10–15 min beginner home session + posture decompression' },
        { id: 'task_shower', title: 'Shower', time: times.shower || '07:15–07:30 AM', hint: 'Shower & hygiene' },
        { id: 'task_morning_skin', title: 'Morning skin care (Wash + Moisturizer + Sunscreen)', time: times.morningSkin || '07:30 AM', hint: 'Gentle wash → moisturizer → sunscreen SPF 30+' },
        { id: 'task_breakfast', title: 'Breakfast eaten', time: times.breakfast || '07:45 AM', hint: 'Nutritious breakfast with protein' },
        { id: 'task_leave_college', title: 'Leave for college', time: times.leaveCollege || '08:20 AM', hint: `${state.travel?.origin || 'Kaggalipura'} → ${state.travel?.destination || 'DSATM'}` }
      ]
    });

    // 2. 🎓 COLLEGE
    const todayClasses = (state.timetable && state.timetable[dayName]) || [];
    const classCountText = todayClasses.length > 0 ? `${todayClasses.length} lectures/labs scheduled` : 'Weekend/Self-study schedule';
    categories.push({
      id: 'college',
      title: 'College (DSATM)',
      icon: '🎓',
      description: `Dayananda Sagar Academy of Technology & Management (${dayName})`,
      tasks: [
        { id: 'task_college_attend', title: 'Attend college classes', time: times.collegeClasses || '09:30 AM–04:00 PM', hint: classCountText }
      ]
    });

    // 3. 🥪 AFTER COLLEGE & STUDY
    categories.push({
      id: 'after_college',
      title: 'After College & Study',
      icon: '🥪',
      description: 'Recharge with a snack, hydrate, and complete daily study focus.',
      tasks: [
        { id: 'task_snack', title: 'Evening snack', time: times.eveningSnack || '04:30–05:30 PM', hint: 'Peanuts / Boiled Eggs / Oats' },
        { id: 'task_water_target', title: `Daily water target completed (${state.targets.waterTargetL} L)`, time: 'All Day', hint: `Target: ${state.targets.waterTargetL} Liters` },
        { id: 'task_study', title: `Study completed (${state.targets.studyTargetMin} mins)`, time: times.study || '05:30–07:00 PM', hint: 'Class revision, assignments, and tomorrow prep' }
      ]
    });

    // 4. 🥗 NUTRITION & AFFORDABLE PROTEIN
    categories.push({
      id: 'nutrition',
      title: 'Nutrition',
      icon: '🥗',
      description: 'Eat regular meals and choose affordable protein when available.',
      tasks: [
        { id: 'task_protein_food', title: 'Affordable protein eaten', time: 'All Day', hint: 'Eggs / Dal / Soy chunks / Peanuts / Milk (or optional chicken)' },
        { id: 'task_cook_dinner', title: 'Dinner prepared', time: times.cookDinner || '07:00 PM', hint: 'Self-cooked nourishing dinner' },
        { id: 'task_dinner', title: 'Balanced dinner eaten', time: times.dinner || '07:30–08:30 PM', hint: 'Rice / Roti, Dal, and seasonal vegetables' }
      ]
    });

    // 5. 🌙 NIGHT
    categories.push({
      id: 'night',
      title: 'Night & Sleep',
      icon: '🌙',
      description: 'Wind down, prepare for tomorrow, and get 7–9 hours of restful sleep.',
      tasks: [
        { id: 'task_night_skin', title: 'Night skin care (Wash + Moisturizer)', time: times.nightSkin || '09:30 PM', hint: 'Gentle face wash → pat dry → apply moisturizer' },
        { id: 'task_prep_tomorrow', title: 'Prepare for tomorrow', time: times.prepTomorrow || '10:30 PM', hint: 'Pack college bag, iron clothes, set morning alarm' },
        { id: 'task_sleep', title: `Sleep ${state.targets.sleepTargetHours} hours`, time: times.sleep || '11:00 PM', hint: 'Spine alignment & restorative rest' }
      ]
    });

    return categories;
  }

  // Calculate stats for a given date
  calculateStats(dateStr) {
    const record = this.stateManager.getRecord(dateStr);
    const categories = this.getTasksForDate(dateStr);
    
    let total = 0;
    let completed = 0;
    let notCompleted = 0;
    let remaining = 0;

    const userTasks = record.tasks || {};

    // Check if water consumed reached target, auto-mark water target task
    const waterTarget = this.stateManager.getState().targets?.waterTargetL || 3.0;
    if ((record.waterConsumedL || 0) >= waterTarget && userTasks['task_water_target'] !== 'DONE') {
      userTasks['task_water_target'] = 'DONE';
    }

    for (const cat of categories) {
      for (const t of cat.tasks) {
        total++;
        const status = userTasks[t.id];
        if (status === 'DONE') {
          completed++;
        } else if (status === 'NOT_DONE') {
          notCompleted++;
        } else {
          remaining++;
        }
      }
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      notCompleted,
      remaining,
      percentage
    };
  }

  // Generate task item HTML strictly using [ ✅ ] and [ ❌ ] buttons
  renderTaskItemHTML(t, status = 'PENDING') {
    let symbol = '⏳';
    if (status === 'DONE') symbol = '✅';
    else if (status === 'NOT_DONE') symbol = '❌';

    const isRightActive = status === 'DONE' ? 'active' : '';
    const isWrongActive = status === 'NOT_DONE' ? 'active' : '';

    return `
      <div class="task-item" data-task-id="${t.id}" id="taskItem-${t.id}">
        <div class="task-info">
          <span class="task-status-symbol" id="taskSymbol-${t.id}">${symbol}</span>
          <div class="task-text">
            ${t.time ? `<span class="task-time-badge">${t.time}</span>` : ''}
            <div class="task-title">${t.title}</div>
            ${t.hint ? `<div class="task-hint">${t.hint}</div>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button type="button" class="btn-task btn-task-right ${isRightActive}" data-action="RIGHT" data-task-id="${t.id}" aria-label="Mark Completed">
            ✅
          </button>
          <button type="button" class="btn-task btn-task-wrong ${isWrongActive}" data-action="WRONG" data-task-id="${t.id}" aria-label="Mark Incomplete">
            ❌
          </button>
        </div>
      </div>
    `;
  }
}

if (typeof window !== 'undefined') {
  window.TaskManager = TaskManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TaskManager, DAY_NAMES };
}
