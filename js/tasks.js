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

  // Generate complete list of today's tasks grouped by category
  getTasksForDate(dateStr) {
    const state = this.stateManager.getState();
    const dayName = this.getDayName(dateStr);
    const categories = [];

    // 1. SLEEP
    categories.push({
      id: 'sleep',
      title: 'Sleep',
      icon: '🌙',
      description: 'Quality rest is the foundation of growth, recovery and energy.',
      tasks: [
        { id: 'sleep_hours', title: 'Sleep 7–9 hours', hint: 'Target: 7–9 hours' },
        { id: 'sleep_wake', title: 'Wake up on planned time', hint: `Planned: ${state.reminders?.wakeUp?.time || '06:30'}` }
      ]
    });

    // 2. WATER
    categories.push({
      id: 'water',
      title: 'Water Hydration',
      icon: '💧',
      description: `Daily hydration goal: ${state.targets.waterTargetL} Liters.`,
      tasks: [
        { id: 'water_target', title: 'Water target completed', hint: `Target: ${state.targets.waterTargetL} L` }
      ]
    });

    // 3. HOME WORKOUT
    const isRestDay = dayName === 'Sunday';
    const isRecovery = dayName === 'Wednesday';
    const isLight = dayName === 'Saturday';
    let workoutDesc = 'Full Body Beginner Workout (10–15 mins, no equipment)';
    if (isRestDay) workoutDesc = 'Rest & Deep Recovery Day';
    else if (isRecovery) workoutDesc = 'Active Recovery / Walking / Stretching';
    else if (isLight) workoutDesc = 'Light Activity / Walking';

    categories.push({
      id: 'workout',
      title: 'Home Workout',
      icon: '💪',
      description: `${dayName.toUpperCase()}: ${workoutDesc}`,
      tasks: [
        { id: 'workout_completed', title: 'Workout completed', hint: '10–15 min beginner session' }
      ]
    });

    // 4. WEIGHT GAIN / NUTRITION
    categories.push({
      id: 'nutrition',
      title: 'Weight Gain / Nutrition',
      icon: '🥗',
      description: 'Healthy whole foods, clean protein, and consistent calories for muscle gain.',
      tasks: [
        { id: 'nutri_breakfast', title: 'Breakfast completed', hint: 'Nutritious start to the day' },
        { id: 'nutri_lunch', title: 'Lunch completed', hint: 'Wholesome balanced meal' },
        { id: 'nutri_dinner', title: 'Dinner completed', hint: 'Protein-rich evening dinner' },
        { id: 'nutri_protein', title: 'Protein target completed', hint: `Target: ${state.targets.proteinTargetG} g` },
        { id: 'nutri_produce', title: 'Fruit / vegetable eaten', hint: 'Vitamins, minerals and micronutrients' },
        { id: 'nutri_no_skip', title: 'No major meal skipped', hint: 'Consistency is essential for healthy weight' }
      ]
    });

    // 5. SKIN CARE
    const morningSkinTasks = (state.skincareProducts || [])
      .filter(p => p.time === 'Morning')
      .map(p => ({
        id: `skin_${p.id}`,
        title: `Morning: ${p.name}`,
        hint: 'Healthy skin & sun protection'
      }));

    const nightSkinTasks = (state.skincareProducts || [])
      .filter(p => p.time === 'Night')
      .map(p => ({
        id: `skin_${p.id}`,
        title: `Night: ${p.name}`,
        hint: 'Cleanse & night repair'
      }));

    categories.push({
      id: 'skincare',
      title: 'Skin Care',
      icon: '✨',
      description: 'Healthy skin and daily sun protection. (No false whitening claims).',
      tasks: [...morningSkinTasks, ...nightSkinTasks]
    });

    // 6. HAIR CARE
    const isShampooDay = state.hairCareSchedule.shampooDays.includes(dayName);
    const hairTasks = [];
    if (isShampooDay) {
      hairTasks.push({ id: 'hair_shampoo', title: 'Shampoo (Scheduled Day)', hint: `Scheduled on ${dayName}` });
      hairTasks.push({ id: 'hair_conditioner', title: 'Conditioner', hint: 'Hydrate hair strands' });
    }
    (state.hairCareSchedule.customTasks || []).forEach((ct, idx) => {
      hairTasks.push({ id: `hair_custom_${idx}`, title: ct, hint: 'Nourishment & scalp care' });
    });
    if (hairTasks.length === 0) {
      hairTasks.push({ id: 'hair_basic', title: 'Daily hair care / gentle combing', hint: 'Gentle maintenance' });
    }

    categories.push({
      id: 'haircare',
      title: 'Hair Care',
      icon: '💇',
      description: isShampooDay ? `Today is a scheduled wash day (${dayName}).` : `Non-wash day. Gentle care.`,
      tasks: hairTasks
    });

    // 7. HEIGHT & POSTURE SUPPORT
    categories.push({
      id: 'posture',
      title: 'Height & Posture Support',
      icon: '🧘',
      disclaimer: 'These habits support posture, fitness and general health. Adult height cannot be guaranteed to increase.',
      tasks: [
        { id: 'posture_stretch', title: 'Posture exercises / stretching', hint: 'Wall angels, chest opener, spine alignment' },
        { id: 'posture_sleep', title: 'Good sleep posture', hint: 'Supportive spine alignment during rest' },
        { id: 'posture_active', title: 'Regular physical activity', hint: 'Avoid prolonged slumping' }
      ]
    });

    // 8. COLLEGE (DSATM)
    const todayClasses = state.timetable[dayName] || [];
    const collegeTasks = [];
    if (todayClasses.length > 0) {
      collegeTasks.push({ id: 'college_attend', title: "Attend today's DSATM classes", hint: `${todayClasses.length} lectures/labs scheduled` });
      collegeTasks.push({ id: 'college_notes', title: "Take & organize class notes", hint: 'Active lecture engagement' });
    } else {
      collegeTasks.push({ id: 'college_weekend', title: 'College prep / lab record completion', hint: 'Weekend/holiday schedule' });
    }

    categories.push({
      id: 'college',
      title: 'College (DSATM)',
      icon: '🎓',
      description: `Dayananda Sagar Academy of Technology & Management (${dayName})`,
      tasks: collegeTasks
    });

    // 9. STUDY
    categories.push({
      id: 'study',
      title: 'Study & Academic Mastery',
      icon: '📚',
      description: `Daily focus target: ${state.targets.studyTargetMin} minutes.`,
      tasks: [
        { id: 'study_revision', title: "Today's class revision", hint: 'Solidify what was taught today' },
        { id: 'study_assignments', title: 'Assignment / lab work', hint: 'Keep up with deadlines' },
        { id: 'study_prep', title: "Tomorrow's preparation", hint: 'Preview upcoming topics' }
      ]
    });

    // 10. COOKING
    const cookingTasks = (state.cookingTasks || []).map(c => ({
      id: `cook_${c.id}`,
      title: c.name,
      hint: 'Self-cooked nourishing food'
    }));

    categories.push({
      id: 'cooking',
      title: "Today's Cooking",
      icon: '🍳',
      description: 'Living alone & cooking your own nutritious meals.',
      tasks: cookingTasks
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
}

if (typeof window !== 'undefined') {
  window.TaskManager = TaskManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TaskManager, DAY_NAMES };
}
