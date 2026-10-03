// Dayananda Sagar Academy of Technology & Management (DSATM) Timetable Manager
class TimetableManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  getTimetable() {
    return this.stateManager.getState().timetable || {};
  }

  getClassesForDay(dayName) {
    const timetable = this.getTimetable();
    const classes = timetable[dayName] || [];
    return [...classes].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }

  addClass(dayName, classData) {
    const timetable = JSON.parse(JSON.stringify(this.getTimetable()));
    if (!timetable[dayName]) {
      timetable[dayName] = [];
    }
    const newClass = {
      id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      startTime: classData.startTime || '09:30',
      endTime: classData.endTime || '10:30',
      subject: classData.subject || 'Class Subject',
      room: classData.room || 'DSATM Campus'
    };
    timetable[dayName].push(newClass);
    timetable[dayName].sort((a, b) => a.startTime.localeCompare(b.startTime));
    this.stateManager.setTimetable(timetable);
    return newClass;
  }

  updateClass(dayName, classId, updatedData) {
    const timetable = JSON.parse(JSON.stringify(this.getTimetable()));
    if (!timetable[dayName]) return false;
    const index = timetable[dayName].findIndex(c => c.id === classId);
    if (index === -1) return false;
    timetable[dayName][index] = {
      ...timetable[dayName][index],
      ...updatedData
    };
    timetable[dayName].sort((a, b) => a.startTime.localeCompare(b.startTime));
    this.stateManager.setTimetable(timetable);
    return true;
  }

  deleteClass(dayName, classId) {
    const timetable = JSON.parse(JSON.stringify(this.getTimetable()));
    if (!timetable[dayName]) return false;
    timetable[dayName] = timetable[dayName].filter(c => c.id !== classId);
    this.stateManager.setTimetable(timetable);
    return true;
  }

  resetToDefault() {
    if (typeof DEFAULT_TIMETABLE !== 'undefined') {
      this.stateManager.setTimetable(JSON.parse(JSON.stringify(DEFAULT_TIMETABLE)));
    }
  }
}

if (typeof window !== 'undefined') {
  window.TimetableManager = TimetableManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimetableManager };
}
