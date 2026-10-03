// State management and local persistence for My Personal Transformation
const STORAGE_KEY = 'mpt_app_data_v1';

const DEFAULT_TIMETABLE = {
  Monday: [
    { id: 'mon_1', startTime: '09:30', endTime: '10:30', subject: 'Engineering Mathematics / Core 1', room: 'Room 201' },
    { id: 'mon_2', startTime: '10:30', endTime: '11:30', subject: 'Data Structures & Algorithms', room: 'Room 201' },
    { id: 'mon_3', startTime: '11:45', endTime: '12:45', subject: 'Database Management Systems', room: 'Room 201' },
    { id: 'mon_4', startTime: '13:30', endTime: '16:30', subject: 'Programming Lab (DSATM)', room: 'Computer Lab 3' }
  ],
  Tuesday: [
    { id: 'tue_1', startTime: '09:30', endTime: '10:30', subject: 'Operating Systems', room: 'Room 202' },
    { id: 'tue_2', startTime: '10:30', endTime: '11:30', subject: 'Computer Networks', room: 'Room 202' },
    { id: 'tue_3', startTime: '11:45', endTime: '12:45', subject: 'Software Engineering', room: 'Room 202' },
    { id: 'tue_4', startTime: '13:30', endTime: '15:30', subject: 'Tutorial / Practice Session', room: 'Seminar Hall' }
  ],
  Wednesday: [
    { id: 'wed_1', startTime: '09:30', endTime: '10:30', subject: 'Database Management Systems', room: 'Room 201' },
    { id: 'wed_2', startTime: '10:30', endTime: '11:30', subject: 'Design & Analysis of Algorithms', room: 'Room 201' },
    { id: 'wed_3', startTime: '11:45', endTime: '12:45', subject: 'Technical Elective', room: 'Room 203' },
    { id: 'wed_4', startTime: '13:30', endTime: '16:30', subject: 'Mini Project Lab Work', room: 'Lab 2' }
  ],
  Thursday: [
    { id: 'thu_1', startTime: '09:30', endTime: '10:30', subject: 'Operating Systems', room: 'Room 202' },
    { id: 'thu_2', startTime: '10:30', endTime: '11:30', subject: 'Software Engineering', room: 'Room 202' },
    { id: 'thu_3', startTime: '11:45', endTime: '12:45', subject: 'Engineering Mathematics', room: 'Room 201' },
    { id: 'thu_4', startTime: '13:30', endTime: '15:30', subject: 'Algorithms Lab', room: 'Lab 3' }
  ],
  Friday: [
    { id: 'fri_1', startTime: '09:30', endTime: '10:30', subject: 'Computer Networks', room: 'Room 202' },
    { id: 'fri_2', startTime: '10:30', endTime: '11:30', subject: 'Data Structures & Algorithms', room: 'Room 201' },
    { id: 'fri_3', startTime: '11:45', endTime: '12:45', subject: 'Professional Ethics & Aptitude', room: 'Room 201' },
    { id: 'fri_4', startTime: '13:30', endTime: '15:30', subject: 'Hands-on Practice / Self Study', room: 'Library' }
  ],
  Saturday: [
    { id: 'sat_1', startTime: '09:30', endTime: '11:30', subject: 'Seminar / Lab Revision', room: 'Room 201' }
  ],
  Sunday: []
};

const DEFAULT_SCHEDULE_TIMES = {
  wakeUp: '06:30 AM',
  morningWater: '06:40 AM',
  workout: '06:45–07:15 AM',
  posture: '07:10 AM',
  shower: '07:15–07:30 AM',
  morningSkin: '07:30 AM',
  breakfast: '07:45 AM',
  leaveCollege: '08:20 AM',
  collegeClasses: '09:30 AM–04:00 PM',
  afternoonWater: '04:15 PM',
  eveningSnack: '04:30–05:30 PM',
  study: '05:30–07:00 PM',
  cookDinner: '07:00 PM',
  dinner: '07:30–08:30 PM',
  nightSkin: '09:30 PM',
  prepTomorrow: '10:30 PM',
  sleep: '11:00 PM'
};

const DEFAULT_FOOD_OPTIONS = {
  breakfast: ['Eggs', 'Idli / Dosa', 'Oats', 'Roti / Chapati', 'Ragi porridge'],
  lunch: ['Rice', 'Roti / Chapati', 'Dal', 'Seasonal Vegetables', 'Optional: Egg / Soy / Chicken'],
  snack: ['Boiled Eggs', 'Peanuts / Groundnuts', 'Oats / Ragi'],
  dinner: ['Rice', 'Roti / Chapati', 'Dal', 'Seasonal Vegetables', 'Optional: Egg / Soy / Chicken']
};

const DEFAULT_PROTEIN_FOODS = [
  { id: 'pf_eggs', name: 'Eggs', icon: '🥚' },
  { id: 'pf_dal', name: 'Dal', icon: '🫘' },
  { id: 'pf_soy', name: 'Soy chunks', icon: '🫘' },
  { id: 'pf_peanuts', name: 'Peanuts', icon: '🥜' },
  { id: 'pf_milk', name: 'Milk', icon: '🥛' },
  { id: 'pf_chicken', name: 'Chicken / Meat', icon: '🍗' }
];

const DEFAULT_ROUTINE = [
  { id: 'r1', time: '06:30 AM', label: 'Wake up' },
  { id: 'r2', time: '06:40 AM', label: 'Morning Water' },
  { id: 'r3', time: '06:45–07:15 AM', label: 'Home Workout' },
  { id: 'r4', time: '07:10 AM', label: '3-Minute Posture Routine' },
  { id: 'r5', time: '07:15–07:30 AM', label: 'Shower' },
  { id: 'r6', time: '07:30 AM', label: 'Morning Skin Care' },
  { id: 'r7', time: '07:45 AM', label: 'Breakfast' },
  { id: 'r8', time: '08:20 AM', label: 'Leave for College (Kaggalipura → DSATM)' },
  { id: 'r9', time: '09:30 AM–04:00 PM', label: 'DSATM College Classes' },
  { id: 'r10', time: '04:30–05:30 PM', label: 'Evening Snack + Water' },
  { id: 'r11', time: '05:30–07:00 PM', label: 'Study & Class Revision' },
  { id: 'r12', time: '07:00 PM', label: 'Cook Dinner' },
  { id: 'r13', time: '07:30–08:30 PM', label: 'Dinner' },
  { id: 'r14', time: '09:30 PM', label: 'Night Skin Care' },
  { id: 'r15', time: '10:30 PM', label: 'Prepare for Tomorrow' },
  { id: 'r16', time: '11:00 PM', label: 'Sleep (7–9 Hours)' }
];

const DEFAULT_STATE = {
  version: 2,
  profile: {
    name: 'Nandan',
    challengeType: '30', // '7' | '14' | '30' | '60' | '90' | 'custom' | 'unlimited'
    challengeDays: 30,
    startDate: new Date().toISOString().split('T')[0],
    theme: 'dark' // 'light' | 'dark'
  },
  scheduleTimes: DEFAULT_SCHEDULE_TIMES,
  targets: {
    waterTargetL: 3.0,
    proteinTargetG: 70,
    studyTargetMin: 90,
    sleepTargetHours: '7–9'
  },
  travel: {
    origin: 'Kaggalipura',
    destination: 'DSATM',
    leaveHomeTime: '08:20',
    expectedTravelMin: 30,
    returnHomeTime: '17:15'
  },
  hairCareSchedule: {
    shampooDays: ['Sunday', 'Thursday'],
    customTasks: ['Scalp care / massage']
  },
  skincareProducts: [
    { id: 'sk_m1', name: 'Face wash', time: 'Morning' },
    { id: 'sk_m2', name: 'Moisturizer', time: 'Morning' },
    { id: 'sk_m3', name: 'Sunscreen (SPF 30+)', time: 'Morning' },
    { id: 'sk_n1', name: 'Face wash', time: 'Night' },
    { id: 'sk_n2', name: 'Moisturizer', time: 'Night' }
  ],
  cookingTasks: [
    { id: 'cook_1', name: 'Breakfast prepared' },
    { id: 'cook_2', name: 'Lunch prepared' },
    { id: 'cook_3', name: 'Dinner prepared' }
  ],
  foodOptions: DEFAULT_FOOD_OPTIONS,
  proteinFoodsList: DEFAULT_PROTEIN_FOODS,
  timetable: DEFAULT_TIMETABLE,
  dailyRoutine: DEFAULT_ROUTINE,
  reminders: {
    wakeUp: { enabled: true, time: '06:30' },
    workout: { enabled: true, time: '06:45' },
    meals: { enabled: true, time: '07:45' },
    study: { enabled: true, time: '17:30' },
    skincare: { enabled: true, time: '21:30' },
    sleep: { enabled: true, time: '22:45' }
  },
  records: {}, // date string -> DailyRecord
  activeDate: new Date().toISOString().split('T')[0]
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this.migrateAndMerge(parsed);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  migrateAndMerge(saved) {
    const merged = { ...DEFAULT_STATE, ...saved };
    merged.profile = { ...DEFAULT_STATE.profile, ...(saved.profile || {}) };
    merged.scheduleTimes = { ...DEFAULT_SCHEDULE_TIMES, ...(saved.scheduleTimes || {}) };
    merged.targets = { ...DEFAULT_STATE.targets, ...(saved.targets || {}) };
    merged.travel = { ...DEFAULT_STATE.travel, ...(saved.travel || {}) };
    merged.hairCareSchedule = { ...DEFAULT_STATE.hairCareSchedule, ...(saved.hairCareSchedule || {}) };
    merged.skincareProducts = saved.skincareProducts || DEFAULT_STATE.skincareProducts;
    merged.cookingTasks = saved.cookingTasks || DEFAULT_STATE.cookingTasks;

    // Filter out Paneer, Curd, Fish, Fruit, Banana from any previously saved data
    const forbidden = ['paneer', 'curd', 'fish', 'fruit', 'banana'];
    const filterForbidden = (arr) => (arr || []).filter(item => {
      const lower = String(item).toLowerCase();
      return !forbidden.some(f => lower.includes(f));
    });

    merged.foodOptions = {
      breakfast: filterForbidden(saved.foodOptions?.breakfast || DEFAULT_FOOD_OPTIONS.breakfast),
      lunch: filterForbidden(saved.foodOptions?.lunch || DEFAULT_FOOD_OPTIONS.lunch),
      snack: filterForbidden(saved.foodOptions?.snack || DEFAULT_FOOD_OPTIONS.snack),
      dinner: filterForbidden(saved.foodOptions?.dinner || DEFAULT_FOOD_OPTIONS.dinner)
    };

    // In v1.5.0: Simplified 6 protein food choices (Eggs, Dal, Soy chunks, Peanuts, Milk, Chicken / Meat)
    if (!saved.proteinFoodsList || saved.proteinFoodsList.some(p => p.proteinG !== undefined) || !saved.proteinFoodsList.some(p => p.id === 'pf_milk')) {
      merged.proteinFoodsList = DEFAULT_PROTEIN_FOODS;
    } else {
      merged.proteinFoodsList = saved.proteinFoodsList.filter(p => {
        const lower = ((p.name || '') + ' ' + (p.id || '')).toLowerCase();
        return !forbidden.some(f => lower.includes(f));
      });
      if (merged.proteinFoodsList.length === 0) {
        merged.proteinFoodsList = DEFAULT_PROTEIN_FOODS;
      }
    }
    merged.timetable = saved.timetable || DEFAULT_STATE.timetable;
    merged.dailyRoutine = saved.dailyRoutine || DEFAULT_STATE.dailyRoutine;
    merged.reminders = { ...DEFAULT_STATE.reminders, ...(saved.reminders || {}) };
    merged.records = saved.records || {};
    if (!merged.activeDate) {
      merged.activeDate = new Date().toISOString().split('T')[0];
    }
    return merged;
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    }
  }

  getState() {
    return this.state;
  }

  // Get or initialize record for a specific date
  getRecord(dateStr) {
    const date = dateStr || this.state.activeDate;
    if (!this.state.records[date]) {
      this.state.records[date] = this.createNewRecord(date);
      this.save();
    }
    return this.state.records[date];
  }

  createNewRecord(dateStr) {
    const dayNumber = this.calculateDayNumber(dateStr);
    return {
      date: dateStr,
      dayNumber: dayNumber,
      sleepHours: 8,
      waterConsumedL: 0,
      proteinConsumedG: 0,
      weightKg: '',
      studyCompletedMin: 0,
      workoutCompleted: false,
      tasks: {}, // taskId -> 'DONE' | 'NOT_DONE' | 'PENDING'
      breakfastItems: [],
      lunchItems: [],
      snackItems: [],
      dinnerItems: [],
      proteinFoodsEaten: {}, // { [pf_id]: { eaten: boolean, qty: number/string } }
      skinMorningSteps: { wash: false, moisturizer: false, sunscreen: false },
      skinNightSteps: { wash: false, moisturizer: false },
      hairSteps: { morningComb: false, morningPullAvoid: false, nightClean: false, nightWetAvoid: false, shampoo: false, conditioner: false },
      mealsEaten: { breakfast: false, lunch: false, dinner: false },
      cookingDone: { breakfast: false, lunch: false, dinner: false },
      notes: '',
      saved: false,
      updatedAt: new Date().toISOString()
    };
  }

  calculateDayNumber(dateStr) {
    const start = new Date(this.state.profile.startDate);
    const target = new Date(dateStr);
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }

  updateRecord(dateStr, updater) {
    const current = this.getRecord(dateStr);
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    updated.updatedAt = new Date().toISOString();
    this.state.records[dateStr] = updated;
    this.save();
    return updated;
  }

  setTaskStatus(dateStr, taskId, status) {
    const record = this.getRecord(dateStr);
    if (!record.tasks) record.tasks = {};
    record.tasks[taskId] = status; // 'DONE', 'NOT_DONE', or 'PENDING'
    record.updatedAt = new Date().toISOString();
    this.save();
  }

  setActiveDate(dateStr) {
    this.state.activeDate = dateStr;
    this.save();
  }

  updateProfile(updates) {
    this.state.profile = { ...this.state.profile, ...updates };
    this.save();
  }

  updateScheduleTimes(updates) {
    this.state.scheduleTimes = { ...this.state.scheduleTimes, ...updates };
    this.save();
  }

  updateTargets(updates) {
    this.state.targets = { ...this.state.targets, ...updates };
    this.save();
  }

  updateTravel(updates) {
    this.state.travel = { ...this.state.travel, ...updates };
    this.save();
  }

  updateReminders(updates) {
    this.state.reminders = { ...this.state.reminders, ...updates };
    this.save();
  }

  setTimetable(newTimetable) {
    this.state.timetable = newTimetable;
    this.save();
  }

  setDailyRoutine(newRoutine) {
    this.state.dailyRoutine = newRoutine;
    this.save();
  }

  setSkincareProducts(products) {
    this.state.skincareProducts = products;
    this.save();
  }

  setCookingTasks(tasks) {
    this.state.cookingTasks = tasks;
    this.save();
  }

  setHairCareSchedule(schedule) {
    this.state.hairCareSchedule = schedule;
    this.save();
  }

  setProteinFoodsList(list) {
    this.state.proteinFoodsList = list;
    this.save();
  }

  // Restore imported data
  restoreData(importedData) {
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid backup file format');
    }
    this.state = this.migrateAndMerge(importedData);
    this.save();
  }

  // Reset to initial state
  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

// Global instance accessible in scripts and tests
if (typeof window !== 'undefined') {
  window.appState = new StateManager();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StateManager, DEFAULT_STATE, DEFAULT_TIMETABLE, DEFAULT_ROUTINE, DEFAULT_SCHEDULE_TIMES, DEFAULT_FOOD_OPTIONS, DEFAULT_PROTEIN_FOODS };
}
