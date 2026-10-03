// Unit and Integration Tests for My Personal Transformation
const assert = require('assert');

// Mock localStorage for Node test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Import modules
const { StateManager, DEFAULT_STATE } = require('../js/state.js');
const { TaskManager, DAY_NAMES } = require('../js/tasks.js');
const { WORKOUT_SCHEDULE, WorkoutRunner } = require('../js/workout.js');
const { TimetableManager } = require('../js/timetable.js');
const { RoutineManager } = require('../js/routine.js');
const { HistoryManager } = require('../js/history.js');
const { BackupManager } = require('../js/backup.js');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

console.log('=== Running My Personal Transformation Test Suite ===\n');

// 1. STATE TESTS
console.log('Testing StateManager...');
it('should load default state when storage is empty', () => {
  localStorage.clear();
  const sm = new StateManager();
  const state = sm.getState();
  assert.strictEqual(state.profile.name, 'Nandan');
  assert.strictEqual(state.targets.waterTargetL, 3.0);
  assert.strictEqual(state.targets.proteinTargetG, 70);
  assert.strictEqual(state.travel.destination, 'DSATM');
});

it('should correctly calculate day numbers from start date', () => {
  const sm = new StateManager();
  sm.updateProfile({ startDate: '2026-10-01' });
  assert.strictEqual(sm.calculateDayNumber('2026-10-01'), 1);
  assert.strictEqual(sm.calculateDayNumber('2026-10-02'), 2);
  assert.strictEqual(sm.calculateDayNumber('2026-10-10'), 10);
});

it('should save and update daily records', () => {
  const sm = new StateManager();
  sm.updateRecord('2026-10-03', { waterConsumedL: 2.5, sleepHours: 8.0 });
  const rec = sm.getRecord('2026-10-03');
  assert.strictEqual(rec.waterConsumedL, 2.5);
  assert.strictEqual(rec.sleepHours, 8.0);
});

// 2. TASK TESTS
console.log('\nTesting TaskManager...');
it('should generate all required habit categories for a weekday', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const categories = tm.getTasksForDate('2026-10-05'); // Monday
  const catIds = categories.map(c => c.id);

  assert.ok(catIds.includes('sleep'), 'Sleep category missing');
  assert.ok(catIds.includes('water'), 'Water category missing');
  assert.ok(catIds.includes('workout'), 'Workout category missing');
  assert.ok(catIds.includes('nutrition'), 'Nutrition category missing');
  assert.ok(catIds.includes('skincare'), 'Skincare category missing');
  assert.ok(catIds.includes('haircare'), 'Haircare category missing');
  assert.ok(catIds.includes('posture'), 'Posture category missing');
  assert.ok(catIds.includes('college'), 'College category missing');
  assert.ok(catIds.includes('study'), 'Study category missing');
  assert.ok(catIds.includes('cooking'), 'Cooking category missing');
});

it('should calculate task stats correctly (completed, not completed, remaining, %)', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const dateStr = '2026-10-05';

  const categories = tm.getTasksForDate(dateStr);
  const allTasks = [];
  categories.forEach(c => c.tasks.forEach(t => allTasks.push(t.id)));

  // Mark 2 DONE and 1 NOT_DONE
  sm.setTaskStatus(dateStr, allTasks[0], 'DONE');
  sm.setTaskStatus(dateStr, allTasks[1], 'DONE');
  sm.setTaskStatus(dateStr, allTasks[2], 'NOT_DONE');

  const stats = tm.calculateStats(dateStr);
  assert.strictEqual(stats.total, allTasks.length);
  assert.strictEqual(stats.completed, 2);
  assert.strictEqual(stats.notCompleted, 1);
  assert.strictEqual(stats.remaining, allTasks.length - 3);
  assert.strictEqual(stats.percentage, Math.round((2 / allTasks.length) * 100));
});

// 3. WORKOUT TESTS
console.log('\nTesting Workouts...');
it('should have a configured beginner workout for every day of the week', () => {
  DAY_NAMES.forEach(day => {
    const workout = WORKOUT_SCHEDULE[day];
    assert.ok(workout, `Missing workout for ${day}`);
    assert.ok(workout.title, `Missing workout title for ${day}`);
    assert.ok(Array.isArray(workout.exercises), `Exercises not an array for ${day}`);
    assert.ok(workout.exercises.length > 0, `Exercises empty for ${day}`);
  });
});

it('should load exercises and progress sequentially in WorkoutRunner', () => {
  let completed = false;
  const runner = new WorkoutRunner(() => { completed = true; });
  const w = runner.startWorkout('Monday');
  assert.strictEqual(runner.currentIndex, 0);
  assert.strictEqual(runner.getCurrentExercise().name, w.exercises[0].name);

  runner.next();
  assert.strictEqual(runner.currentIndex, 1);
  assert.strictEqual(runner.getCurrentExercise().name, w.exercises[1].name);

  runner.prev();
  assert.strictEqual(runner.currentIndex, 0);
});

// 4. TIMETABLE TESTS (DSATM)
console.log('\nTesting DSATM Timetable...');
it('should allow adding, updating, and deleting classes for any day', () => {
  const sm = new StateManager();
  const ttm = new TimetableManager(sm);

  // Add class
  const added = ttm.addClass('Tuesday', {
    startTime: '14:00',
    endTime: '15:00',
    subject: 'Cloud Computing Lab',
    room: 'DSATM CS Lab'
  });
  assert.ok(added.id);

  let classes = ttm.getClassesForDay('Tuesday');
  assert.ok(classes.some(c => c.id === added.id && c.subject === 'Cloud Computing Lab'));

  // Update class
  ttm.updateClass('Tuesday', added.id, { subject: 'Advanced Cloud Computing' });
  classes = ttm.getClassesForDay('Tuesday');
  const updated = classes.find(c => c.id === added.id);
  assert.strictEqual(updated.subject, 'Advanced Cloud Computing');

  // Delete class
  ttm.deleteClass('Tuesday', added.id);
  classes = ttm.getClassesForDay('Tuesday');
  assert.strictEqual(classes.some(c => c.id === added.id), false);
});

// 5. ROUTINE TESTS
console.log('\nTesting Daily Routine Timeline...');
it('should dynamically include DSATM classes and travel in the daily timeline', () => {
  const sm = new StateManager();
  const ttm = new TimetableManager(sm);
  const rm = new RoutineManager(sm, ttm);

  const timeline = rm.getTodayTimeline('2026-10-05'); // Monday
  assert.ok(timeline.length > 5, 'Timeline should have multiple routine events');

  const travelItems = timeline.filter(t => t.tag === 'travel');
  assert.ok(travelItems.length >= 2, 'Should contain morning travel and evening return commute');

  const collegeItems = timeline.filter(t => t.tag === 'college');
  assert.ok(collegeItems.length >= 1, 'Should contain DSATM college classes');
});

// 6. HISTORY & STREAK TESTS
console.log('\nTesting History & Streak computation...');
it('should accurately calculate current and best streaks without punishing missed days', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const hm = new HistoryManager(sm, tm);

  // Setup 3 consecutive days saved
  sm.updateRecord('2026-09-28', { saved: true });
  sm.updateRecord('2026-09-29', { saved: true });
  sm.updateRecord('2026-09-30', { saved: true });

  const streaks = hm.calculateStreaks();
  assert.ok(streaks.bestStreak >= 3, `Expected best streak >= 3, got ${streaks.bestStreak}`);
});

// 7. BACKUP & RESTORE TESTS
console.log('\nTesting Backup & Restore...');
it('should restore valid state from backup', () => {
  const sm = new StateManager();
  const backupData = {
    profile: { name: 'Transformation Champ', challengeType: '60', challengeDays: 60, theme: 'dark' },
    targets: { waterTargetL: 3.5, proteinTargetG: 85, studyTargetMin: 120, sleepTargetHours: '8' },
    records: {
      '2026-10-01': { date: '2026-10-01', dayNumber: 1, saved: true }
    }
  };

  sm.restoreData(backupData);
  const updatedState = sm.getState();
  assert.strictEqual(updatedState.profile.name, 'Transformation Champ');
  assert.strictEqual(updatedState.targets.proteinTargetG, 85);
  assert.strictEqual(updatedState.records['2026-10-01'].saved, true);
});

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests} / ${totalTests} Passed!`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
