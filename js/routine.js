// Daily routine and timeline manager combining habits, travel, and DSATM classes
class RoutineManager {
  constructor(stateManager, timetableManager) {
    this.stateManager = stateManager;
    this.timetableManager = timetableManager;
  }

  getCustomRoutine() {
    return this.stateManager.getState().dailyRoutine || [];
  }

  getDayName(dateStr) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  }

  // Generate today's unified daily timeline incorporating dynamic college timetable
  getTodayTimeline(dateStr) {
    const state = this.stateManager.getState();
    const dayName = this.getDayName(dateStr);
    const classes = this.timetableManager ? this.timetableManager.getClassesForDay(dayName) : [];
    const travel = state.travel || {};

    const timeline = [];

    // Morning routine
    timeline.push({ time: state.reminders?.wakeUp?.time || '06:30', label: 'Wake up & morning hydration 💧', tag: 'morning' });
    timeline.push({ time: '06:40–07:10', label: `Home Workout: ${dayName} Routine 💪`, tag: 'workout' });
    timeline.push({ time: '07:10–07:30', label: 'Shower + Skincare & Grooming ✨', tag: 'care' });
    timeline.push({ time: '07:30–08:00', label: 'Breakfast (Protein & Nutrition) 🥗', tag: 'meal' });
    timeline.push({ time: '08:00–08:20', label: 'Pack lunch & DSATM college bag 🎒', tag: 'prep' });
    
    // Morning Travel
    const leaveTime = travel.leaveHomeTime || '08:20';
    const travelMin = travel.expectedTravelMin || 30;
    timeline.push({
      time: `${leaveTime}`,
      label: `Travel: ${travel.origin || 'Kaggalipura'} → ${travel.destination || 'DSATM'} (~${travelMin}m) 🚌`,
      tag: 'travel'
    });

    // College Classes
    if (classes.length > 0) {
      classes.forEach(c => {
        timeline.push({
          time: `${c.startTime}–${c.endTime}`,
          label: `DSATM Class: ${c.subject} (${c.room || 'Campus'}) 🏛️`,
          tag: 'college'
        });
      });
    } else {
      timeline.push({
        time: '09:30–16:00',
        label: `${dayName}: No regular DSATM classes (Self-study / Project work) 📖`,
        tag: 'college'
      });
    }

    // Return travel
    const returnTime = travel.returnHomeTime || '16:30';
    timeline.push({
      time: `${returnTime}`,
      label: `Return Commute: ${travel.destination || 'DSATM'} → ${travel.origin || 'Kaggalipura'} 🏡`,
      tag: 'travel'
    });

    // Evening & Night Routine
    timeline.push({ time: '17:30–19:00', label: `Study Target: Class Revision & Labs (${state.targets.studyTargetMin} mins) 📚`, tag: 'study' });
    timeline.push({ time: '19:00–20:00', label: 'Evening Cooking & Dinner Prep 🍳', tag: 'cooking' });
    timeline.push({ time: '20:00–20:45', label: 'Dinner & Fruit/Vegetables 🥗', tag: 'meal' });
    timeline.push({ time: '21:00–21:30', label: 'Posture Exercises & Foam Roll / Stretches 🧘', tag: 'posture' });
    timeline.push({ time: '21:30–22:00', label: 'Night Skincare & Wind Down ✨', tag: 'care' });
    timeline.push({ time: '22:30', label: 'Prepare clothes & bag for tomorrow 📋', tag: 'prep' });
    timeline.push({ time: state.reminders?.sleep?.time || '23:00', label: 'Sleep (7–9 Hours Recovery) 🌙', tag: 'sleep' });

    return timeline;
  }

  updateRoutineItem(index, updatedItem) {
    const routine = [...this.getCustomRoutine()];
    if (index >= 0 && index < routine.length) {
      routine[index] = { ...routine[index], ...updatedItem };
      this.stateManager.setDailyRoutine(routine);
    }
  }

  addRoutineItem(newItem) {
    const routine = [...this.getCustomRoutine()];
    routine.push({
      id: 'r_' + Date.now(),
      time: newItem.time || '12:00',
      label: newItem.label || 'New Activity'
    });
    this.stateManager.setDailyRoutine(routine);
  }

  deleteRoutineItem(index) {
    const routine = [...this.getCustomRoutine()];
    if (index >= 0 && index < routine.length) {
      routine.splice(index, 1);
      this.stateManager.setDailyRoutine(routine);
    }
  }
}

if (typeof window !== 'undefined') {
  window.RoutineManager = RoutineManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RoutineManager };
}
