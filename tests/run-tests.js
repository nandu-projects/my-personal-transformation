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
const { UpdateManager } = require('../js/update.js');

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
  assert.ok(state.scheduleTimes, 'scheduleTimes should exist in default state');
  assert.strictEqual(state.scheduleTimes.wakeUp, '06:30 AM');
  assert.ok(Array.isArray(state.proteinFoodsList), 'proteinFoodsList should exist');
  assert.ok(Array.isArray(state.foodOptions.breakfast), 'breakfast food options should exist');
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
it('should generate simplified 15-20 core daily actions with AM/PM timings in requested order', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const categories = tm.getTasksForDate('2026-10-05'); // Monday
  const catIds = categories.map(c => c.id);

  // Verify daily order: morning, college, after_college, nutrition, haircare, night
  assert.deepStrictEqual(catIds, ['morning', 'college', 'after_college', 'nutrition', 'haircare', 'night']);

  let totalTasks = 0;
  categories.forEach(cat => {
    cat.tasks.forEach(t => {
      totalTasks++;
      assert.ok(t.title, 'Every task must have a title');
      assert.ok(t.time, `Task ${t.id} must have a clear time display`);
    });
  });

  // Verify 15-18 daily actions
  assert.ok(totalTasks >= 15 && totalTasks <= 18, `Expected 15–18 tasks, got ${totalTasks}`);
});

it('should auto-mark water target completed when water consumed reaches target', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const dateStr = '2026-10-05';

  sm.updateRecord(dateStr, { waterConsumedL: 3.0 });
  const stats = tm.calculateStats(dateStr);
  const record = sm.getRecord(dateStr);
  assert.strictEqual(record.tasks['task_water_target'], 'DONE');
});

it('should calculate task stats correctly (completed, not completed, remaining, %)', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const dateStr = '2026-10-06';

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
    startTime: '02:00 PM',
    endTime: '03:00 PM',
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
it('should dynamically include DSATM classes, AM/PM timings, and travel in the daily timeline', () => {
  const sm = new StateManager();
  const ttm = new TimetableManager(sm);
  const rm = new RoutineManager(sm, ttm);

  const timeline = rm.getTodayTimeline('2026-10-05'); // Monday
  assert.ok(timeline.length > 5, 'Timeline should have multiple routine events');

  const travelItems = timeline.filter(t => t.tag === 'travel');
  assert.ok(travelItems.length >= 2, 'Should contain morning commute and evening return commute');

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

// 8. UPDATE MANAGER & OFFLINE PERSISTENCE TESTS
console.log('\nTesting UpdateManager & Offline Resilience...');
it('should instantiate with default package com.nanduprojects.transformation and versionCode 8', () => {
  const sm = new StateManager();
  const um = new UpdateManager(sm);
  assert.strictEqual(um.appVersionInfo.packageName, 'com.nanduprojects.transformation');
  assert.strictEqual(um.appVersionInfo.versionCode, 8);
  assert.strictEqual(um.appVersionInfo.versionName, '1.5.0');
});

it('should configure GITHUB_REPO constant correctly', () => {
  const { GITHUB_REPO } = require('../js/update.js');
  assert.strictEqual(GITHUB_REPO, 'nandu-projects/my-personal-transformation');
});

it('should accurately compare semantic versions from GitHub Release tags', () => {
  const sm = new StateManager();
  const um = new UpdateManager(sm);
  assert.strictEqual(um.compareSemVer('1.3.0', '1.2.0'), 1);
  assert.strictEqual(um.compareSemVer('v1.2.1', '1.2.0'), 1);
  assert.strictEqual(um.compareSemVer('v2.0.0', '1.9.9'), 1);
  assert.strictEqual(um.compareSemVer('v1.2.0', '1.2.0'), 0);
  assert.strictEqual(um.compareSemVer('1.1.0', '1.2.0'), -1);
  assert.strictEqual(um.compareSemVer('1.2.0', '1.2.1'), -1);
});

it('should safely handle offline mode without errors', async () => {
  global.navigator = { onLine: false };
  const sm = new StateManager();
  const um = new UpdateManager(sm);
  await um.checkForUpdate(false);
  assert.strictEqual(um.isChecking, false);
});

// 9. TASK RIGHT / WRONG INDEPENDENT TOGGLE TESTS
console.log('\nTesting Independent Task RIGHT / WRONG Actions...');
it('should independently toggle RIGHT and WRONG without interfering with subsequent tasks', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const dateStr = '2026-10-07';

  const categories = tm.getTasksForDate(dateStr);
  const tasks = [];
  categories.forEach(c => c.tasks.forEach(t => tasks.push(t.id)));
  assert.ok(tasks.length >= 2, 'Should have at least 2 tasks');

  const task1 = tasks[0];
  const task2 = tasks[1];
  const task3 = tasks[2];

  // Clicking RIGHT on Task 1 marks it DONE
  sm.setTaskStatus(dateStr, task1, 'DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task1], 'DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task2], undefined);

  // Clicking WRONG on Task 2 does not affect Task 1
  sm.setTaskStatus(dateStr, task2, 'NOT_DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task1], 'DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task2], 'NOT_DONE');

  // Clicking RIGHT on Task 3 does not affect Task 1 or Task 2
  sm.setTaskStatus(dateStr, task3, 'DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task1], 'DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task2], 'NOT_DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task3], 'DONE');

  // Toggling Task 1 back to PENDING does not change Task 2 or Task 3
  sm.setTaskStatus(dateStr, task1, 'PENDING');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task1], 'PENDING');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task2], 'NOT_DONE');
  assert.strictEqual(sm.getRecord(dateStr).tasks[task3], 'DONE');

  // Stats calculation matches
  const stats = tm.calculateStats(dateStr);
  assert.strictEqual(stats.completed, 1); // task3
  assert.strictEqual(stats.notCompleted, 1); // task2
});

// 10. EMOJI-ONLY TASK ACTION BUTTONS (NO WORDS BESIDE EMOJIS)
console.log('\nTesting Emoji-Only Task Action Buttons & UI Redesign...');
it('should render every task action button with ONLY emojis [ ✅ ] and [ ❌ ] and NO text labels', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const categories = tm.getTasksForDate('2026-10-08');

  let totalTasksChecked = 0;

  categories.forEach(cat => {
    cat.tasks.forEach(t => {
      totalTasksChecked++;
      
      // Test all statuses: PENDING, DONE, NOT_DONE
      ['PENDING', 'DONE', 'NOT_DONE'].forEach(status => {
        const html = tm.renderTaskItemHTML(t, status);

        // 1. Extract task-actions container to inspect button contents strictly
        const actionsMatch = html.match(/<div class="task-actions">([\s\S]*?)<\/div>/);
        assert.ok(actionsMatch, `Task ${t.id} must contain <div class="task-actions"> container`);

        const actionsHTML = actionsMatch[1];

        // 2. Must contain data-action attributes for functionality
        assert.ok(actionsHTML.includes('data-action="RIGHT"'), `Task ${t.id} must have data-action="RIGHT"`);
        assert.ok(actionsHTML.includes('data-action="WRONG"'), `Task ${t.id} must have data-action="WRONG"`);

        // 3. Confirm visible button content contains ONLY emojis, NO words!
        const buttonMatches = [...actionsHTML.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)];
        assert.strictEqual(buttonMatches.length, 2, `Task ${t.id} must have exactly 2 action buttons`);

        const btn1Text = buttonMatches[0][1].trim();
        const btn2Text = buttonMatches[1][1].trim();

        assert.strictEqual(btn1Text, '✅', `Button 1 must be strictly emoji ✅ with no text, got: "${btn1Text}"`);
        assert.strictEqual(btn2Text, '❌', `Button 2 must be strictly emoji ❌ with no text, got: "${btn2Text}"`);

        // 4. Double check NO forbidden words exist in action buttons
        const forbiddenWords = ['RIGHT', 'WRONG', 'DONE', 'NOT DONE'];
        forbiddenWords.forEach(word => {
          assert.ok(!btn1Text.includes(word), `Button 1 must not contain word ${word}`);
          assert.ok(!btn2Text.includes(word), `Button 2 must not contain word ${word}`);
        });
      });
    });
  });

  assert.ok(totalTasksChecked >= 15, `Expected at least 15 tasks rendered and verified, got ${totalTasksChecked}`);
});

it('should verify Paneer, Curd, Fish, and Fruit are completely absent from state, options, and task hints', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const state = sm.getState();

  const forbiddenFoods = ['paneer', 'curd', 'fish', 'fruit', 'banana'];

  // 1. Check DEFAULT_FOOD_OPTIONS / state.foodOptions
  Object.keys(state.foodOptions).forEach(meal => {
    state.foodOptions[meal].forEach(item => {
      const lower = item.toLowerCase();
      forbiddenFoods.forEach(f => {
        assert.ok(!lower.includes(f), `Food option "${item}" in ${meal} contains forbidden food "${f}"`);
      });
    });
  });

  // 2. Check state.proteinFoodsList
  state.proteinFoodsList.forEach(p => {
    const combined = ((p.name || '') + ' ' + (p.id || '')).toLowerCase();
    forbiddenFoods.forEach(f => {
      assert.ok(!combined.includes(f), `Protein food "${p.name}" contains forbidden food "${f}"`);
    });
  });

  // 3. Check all task hints across the week
  DAY_NAMES.forEach(day => {
    const categories = tm.getTasksForDate('2026-10-05');
    categories.forEach(cat => {
      cat.tasks.forEach(t => {
        const hintLower = (t.hint || '').toLowerCase();
        forbiddenFoods.forEach(f => {
          assert.ok(!hintLower.includes(f), `Task ${t.id} hint "${t.hint}" contains forbidden food "${f}"`);
        });
      });
    });
  });
});

it('should verify weight and protein gram tracking are completely absent from index.html', () => {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  // No Today's Weight input or kg field
  assert.ok(!html.includes('inputTodayWeight'), 'index.html must not contain inputTodayWeight');
  assert.ok(!html.includes("Today's Weight"), 'index.html must not contain Today\'s Weight');
  
  // No protein gram trackers, targets, or buttons
  assert.ok(!html.includes('inputProteinConsumed'), 'index.html must not contain inputProteinConsumed');
  assert.ok(!html.includes('btnAddProtein10'), 'index.html must not contain btnAddProtein10');
  assert.ok(!html.includes('btnAddProtein20'), 'index.html must not contain btnAddProtein20');
  assert.ok(!html.includes('btnAddProtein30'), 'index.html must not contain btnAddProtein30');
  assert.ok(!html.includes('btnResetProtein'), 'index.html must not contain btnResetProtein');
  assert.ok(!html.includes('settingProteinTarget'), 'index.html must not contain settingProteinTarget in Settings');
  assert.ok(!html.includes('lblProteinApproxTotal'), 'index.html must not contain approx protein total');
  assert.ok(!html.includes('lblProteinTargetDisplay'), 'index.html must not contain protein target display');

  // Verify regular meals checkboxes exist
  assert.ok(html.includes('cbMealBfast'), 'index.html must contain cbMealBfast');
  assert.ok(html.includes('cbMealLunch'), 'index.html must contain cbMealLunch');
  assert.ok(html.includes('cbMealDinner'), 'index.html must contain cbMealDinner');
  assert.ok(html.includes('Breakfast eaten'), 'index.html must contain "Breakfast eaten"');
  assert.ok(html.includes('Lunch eaten'), 'index.html must contain "Lunch eaten"');
  assert.ok(html.includes('Dinner eaten'), 'index.html must contain "Dinner eaten"');

  // Verify Food reminder note exists
  assert.ok(html.includes('Food reminder:'), 'index.html must contain food reminder');
  assert.ok(html.includes('What protein food did you eat today?'), 'index.html must contain protein question');
});

it('should verify the 6 canonical protein foods are configured in state without gram units', () => {
  const sm = new StateManager();
  const state = sm.getState();
  const foods = state.proteinFoodsList;

  assert.strictEqual(foods.length, 6, 'Must have exactly 6 protein food options');
  const expectedNames = ['Eggs', 'Dal', 'Soy chunks', 'Peanuts', 'Milk', 'Chicken / Meat'];
  expectedNames.forEach(name => {
    const found = foods.some(f => f.name.includes(name) || name.includes(f.name));
    assert.ok(found, `Expected protein food "${name}" in proteinFoodsList`);
  });

  // Verify no grams/units/target multipliers are defined
  foods.forEach(f => {
    assert.strictEqual(f.proteinG, undefined, `Food ${f.name} should not have proteinG`);
    assert.strictEqual(f.unit, undefined, `Food ${f.name} should not have unit`);
  });
});

it('should verify build.gradle versionCode is 8 and versionName is 1.5.0', () => {
  const fs = require('fs');
  const path = require('path');
  const gradle = fs.readFileSync(path.join(__dirname, '..', 'android', 'app', 'build.gradle'), 'utf8');
  assert.ok(gradle.includes('versionCode 8'), 'build.gradle must have versionCode 8');
  assert.ok(gradle.includes('versionName "1.5.0"'), 'build.gradle must have versionName "1.5.0"');
});

it('should test consecutive independent toggling of every task button', () => {
  const sm = new StateManager();
  const tm = new TaskManager(sm);
  const dateStr = '2026-10-09';
  const categories = tm.getTasksForDate(dateStr);
  const allTasks = [];
  categories.forEach(c => c.tasks.forEach(t => allTasks.push(t.id)));

  // Test every task's ✅ button
  allTasks.forEach(id => {
    sm.setTaskStatus(dateStr, id, 'DONE');
    assert.strictEqual(sm.getRecord(dateStr).tasks[id], 'DONE');
  });

  // Test every task's ❌ button
  allTasks.forEach(id => {
    sm.setTaskStatus(dateStr, id, 'NOT_DONE');
    assert.strictEqual(sm.getRecord(dateStr).tasks[id], 'NOT_DONE');
  });

  // Test resetting
  allTasks.forEach(id => {
    sm.setTaskStatus(dateStr, id, 'PENDING');
    assert.strictEqual(sm.getRecord(dateStr).tasks[id], 'PENDING');
  });
});

it('should test theme switching between dark and light modes cleanly', () => {
  const sm = new StateManager();
  sm.updateProfile({ theme: 'light' });
  assert.strictEqual(sm.getState().profile.theme, 'light');
  sm.updateProfile({ theme: 'dark' });
  assert.strictEqual(sm.getState().profile.theme, 'dark');
});

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests} / ${totalTests} Passed!`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
