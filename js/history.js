// History and Streak computation module
class HistoryManager {
  constructor(stateManager, taskManager) {
    this.stateManager = stateManager;
    this.taskManager = taskManager;
  }

  // Get all recorded days sorted reverse-chronologically (newest first)
  getHistoryList() {
    const state = this.stateManager.getState();
    const records = state.records || {};
    const dates = Object.keys(records).sort().reverse();

    return dates.map(dateStr => {
      const record = records[dateStr];
      const stats = this.taskManager.calculateStats(dateStr);
      return {
        date: dateStr,
        dayNumber: record.dayNumber || this.stateManager.calculateDayNumber(dateStr),
        saved: !!record.saved,
        percentage: stats.percentage,
        completed: stats.completed,
        notCompleted: stats.notCompleted,
        remaining: stats.remaining,
        total: stats.total,
        waterConsumedL: record.waterConsumedL || 0,
        proteinConsumedG: record.proteinConsumedG || 0,
        sleepHours: record.sleepHours || 0,
        studyCompletedMin: record.studyCompletedMin || 0,
        weightKg: record.weightKg || null
      };
    });
  }

  // Compute streaks
  calculateStreaks() {
    const state = this.stateManager.getState();
    const records = state.records || {};
    const dates = Object.keys(records).sort(); // chronological order

    if (dates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, totalDaysTracked: 0 };
    }

    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
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

    // Determine current streak checking up to today
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    
    // Look backward from today or yesterday
    let checkDate = new Date();
    // Allow checking up to 365 days back
    for (let d = 0; d < 365; d++) {
      const curStr = checkDate.toISOString().split('T')[0];
      const rec = records[curStr];
      if (rec) {
        const stats = this.taskManager.calculateStats(curStr);
        if (stats.percentage >= 50 || rec.saved) {
          currentStreak++;
        } else if (d === 0) {
          // If today is not finished yet, don't break immediately, check yesterday
        } else {
          break;
        }
      } else {
        if (d > 0) break; // Missed prior day
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    if (bestStreak < currentStreak) {
      bestStreak = currentStreak;
    }

    return {
      currentStreak,
      bestStreak,
      totalDaysTracked: dates.length
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
