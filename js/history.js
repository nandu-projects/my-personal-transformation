// History and Streak computation module
class HistoryManager {
  constructor(stateManager, taskManager) {
    this.stateManager = stateManager;
    this.taskManager = taskManager;
  }

  // Get all recorded days sorted reverse-chronologically (newest first)
  // Only days that were explicitly saved by the user are included
  getHistoryList() {
    const state = this.stateManager.getState();
    const records = state.records || {};
    const dates = Object.keys(records)
      .filter(dateStr => records[dateStr] && records[dateStr].saved === true)
      .sort()
      .reverse();

    return dates.map(dateStr => {
      const record = records[dateStr];
      const stats = this.taskManager.calculateStats(dateStr);
      return {
        date: dateStr,
        dayNumber: record.dayNumber || this.stateManager.calculateDayNumber(dateStr),
        saved: true,
        percentage: stats.percentage,
        completed: stats.completed,
        notCompleted: stats.notCompleted,
        remaining: stats.remaining,
        total: stats.total,
        waterConsumedL: record.waterConsumedL || 0,
        sleepHours: record.sleepHours || 0,
        studyCompletedMin: record.studyCompletedMin || 0
      };
    });
  }

  // Compute streaks strictly from explicitly saved days
  calculateStreaks() {
    const state = this.stateManager.getState();
    const records = state.records || {};
    const savedDates = Object.keys(records)
      .filter(dateStr => records[dateStr] && records[dateStr].saved === true)
      .sort(); // chronological order

    if (savedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, totalDaysTracked: 0 };
    }

    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < savedDates.length; i++) {
      const dateStr = savedDates[i];
      const stats = this.taskManager.calculateStats(dateStr);
      const isSuccessful = stats.percentage >= 50 || records[dateStr].saved;

      if (isSuccessful) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Determine current streak checking backward from today
    let currentStreak = 0;
    let checkDate = new Date();
    for (let d = 0; d < 365; d++) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const curStr = `${y}-${m}-${day}`;
      const rec = records[curStr];

      if (rec && rec.saved === true) {
        const stats = this.taskManager.calculateStats(curStr);
        if (stats.percentage >= 50 || rec.saved) {
          currentStreak++;
        } else {
          break;
        }
      } else if (d === 0) {
        // Today has not been saved yet; check yesterday
      } else {
        break; // Prior day was not saved
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    if (bestStreak < currentStreak) {
      bestStreak = currentStreak;
    }

    return {
      currentStreak,
      bestStreak,
      totalDaysTracked: savedDates.length
    };
  }

  // Get full day detail for inspection modal
  getDayDetail(dateStr) {
    const record = this.stateManager.getRecord(dateStr);
    const categories = this.taskManager.getTasksForDate(dateStr);
    const stats = this.taskManager.calculateStats(dateStr);
    const userTasks = record.tasks || {};

    const completedTasks = [];
    const incompleteTasks = [];

    categories.forEach(cat => {
      cat.tasks.forEach(t => {
        const status = userTasks[t.id];
        const item = { ...t, categoryTitle: cat.title, categoryIcon: cat.icon };
        if (status === 'DONE') {
          completedTasks.push(item);
        } else {
          incompleteTasks.push({ ...item, status: status === 'NOT_DONE' ? 'NOT_DONE' : 'PENDING' });
        }
      });
    });

    return {
      date: dateStr,
      dayNumber: record.dayNumber || this.stateManager.calculateDayNumber(dateStr),
      saved: !!record.saved,
      stats,
      metrics: {
        sleepHours: record.sleepHours,
        waterConsumedL: record.waterConsumedL,
        proteinConsumedG: record.proteinConsumedG,
        studyCompletedMin: record.studyCompletedMin,
        weightKg: record.weightKg
      },
      completedTasks,
      incompleteTasks
    };
  }
}

if (typeof window !== 'undefined') {
  window.HistoryManager = HistoryManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HistoryManager };
}
