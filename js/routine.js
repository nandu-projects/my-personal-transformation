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

    const times = state.scheduleTimes || {};

    // Morning routine
    timeline.push({ time: times.wakeUp || '06:30 AM', label: 'Wake up & morning hydration 💧', tag: 'morning' });
    timeline.push({ time: times.morningWater || '06:40 AM', label: 'Morning Water (500 ml) 💧', tag: 'morning' });
    timeline.push({ time: times.workout || '06:45–07:15 AM', label: `Home Workout: ${dayName} Routine 💪`, tag: 'workout' });
    timeline.push({ time: times.posture || '07:10 AM', label: '3-Minute Posture Routine 🧘', tag: 'posture' });
    timeline.push({ time: times.shower || '07:15–07:30 AM', label: 'Shower & Grooming 🚿', tag: 'care' });
    timeline.push({ time: times.morningSkin || '07:30 AM', label: 'Morning Skin Care (Wash + Moisturizer + Sunscreen) ✨', tag: 'care' });
    timeline.push({ time: times.breakfast || '07:45 AM', label: 'Breakfast (Protein & Nutrition) 🍳', tag: 'meal' });
    
    // Morning Travel
    const leaveTime = times.leaveCollege || travel.leaveHomeTime || '08:20 AM';
    const travelMin = travel.expectedTravelMin || 30;
    timeline.push({
      time: `${leaveTime}`,
      label: `Commute: ${travel.origin || 'Kaggalipura'} → ${travel.destination || 'DSATM'} (~${travelMin}m) 🚌`,
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
        time: times.collegeClasses || '09:30 AM–04:00 PM',
        label: `${dayName}: No regular DSATM classes (Self-study / Project work) 📖`,
        tag: 'college'
      });
    }

    // Return travel
    const returnTime = travel.returnHomeTime || '04:30 PM';
    timeline.push({
      time: `${returnTime}`,
      label: `Return Commute: ${travel.destination || 'DSATM'} → ${travel.origin || 'Kaggalipura'} 🏡`,
      tag: 'travel'
    });

    // Evening & Night Routine
    timeline.push({ time: times.eveningSnack || '04:30–05:30 PM', label: 'Evening Snack + Rehydration 🥪', tag: 'meal' });
    timeline.push({ time: times.study || '05:30–07:00 PM', label: `Study Target: Class Revision & Labs (${state.targets?.studyTargetMin || 90} mins) 📚`, tag: 'study' });
    timeline.push({ time: times.cookDinner || '07:00 PM', label: 'Evening Cooking & Dinner Prep 🍳', tag: 'cooking' });
    timeline.push({ time: times.dinner || '07:30–08:30 PM', label: 'Dinner & Protein Foods 🍗', tag: 'meal' });
    timeline.push({ time: times.nightSkin || '09:30 PM', label: 'Night Skin Care (Wash + Moisturizer) ✨', tag: 'care' });
    timeline.push({ time: times.prepTomorrow || '10:30 PM', label: 'Prepare for tomorrow (Clothes & bag packed) 📋', tag: 'prep' });
    timeline.push({ time: times.sleep || '11:00 PM', label: `Sleep (${state.targets?.sleepTargetHours || '7–9'} Hours Recovery) 🌙`, tag: 'sleep' });

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
