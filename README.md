# My Personal Transformation (Phase 1)

A clean, beginner-friendly, and distraction-free daily transformation and habit tracker built for Android.

Designed specifically around a simple, disciplined daily rhythm:
**OPEN APP → SEE TODAY'S TASKS → DO THEM → MARK ✅ OR ❌ → SEE DAILY PROGRESS.**

---

## 📱 App Highlights & Architecture

- **Phase 1 Focused**: Zero bloated features, zero ads, no login/account required, no social feeds, and no AI chatbots.
- **100% Offline & Private**: All data is stored locally on the device with JSON backup/restore support.
- **Dual Platform**:
  - **Native Android App**: Powered by Capacitor 8 + Gradle + Android 34/35 SDK. Generates installable `app-debug.apk`.
  - **Progressive Web App (PWA)**: Instant offline caching with Service Worker and modern touch-friendly responsive interface.
- **One-Handed Mobile UX**: Large touch targets (≥44px), high contrast dark & light modes, clear symbols (`✅` Done, `❌` Not Done, `⏳` Remaining).

---

## 🎯 Features & Habit Categories

### 1. Home Screen & Challenge Tracker
- **Today's Date & Day Counter**: Live Day tracker (Day 1, Day 2, etc.).
- **Flexible Challenge Duration**: Quick selector for **7 Days**, **14 Days**, **30 Days**, **60 Days**, **90 Days**, **Custom**, or **"Continue Until I Stop"** (Ongoing).
- **Today's Progress Hero Card**: Real-time progress bar, ratio (`X / Total Tasks`), and completion percentage.
- **Instant ✅ / ❌ Buttons**: Every task has dedicated one-tap buttons with auto-saving.

### 2. 🌙 Sleep
- Habit tasks: *Sleep 7–9 hours* and *Wake up on planned time*.
- Actual sleep hours tracker (`Sleep: ___ hours`, Target: `7–9 hours`).

### 3. 💧 Water Hydration
- Target: `3.0 L` (fully customizable).
- Quick logging buttons: `+250 ml`, `+500 ml`, `+1 L`, and `Reset`.
- Automatically marks the water habit as completed when the target is reached.

### 4. 💪 Beginner Home Workout (Zero Gym Equipment)
- Built for complete beginners with **no gym equipment required**.
- Structured weekly schedule:
  - **Monday**: Full Body Beginner Strength A
  - **Tuesday**: Full Body Beginner Strength B
  - **Wednesday**: Active Recovery / Walking / Stretching
  - **Thursday**: Full Body Beginner Strength C
  - **Friday**: Full Body Endurance & Tone
  - **Saturday**: Light Activity & Mobility Walk
  - **Sunday**: Rest & Restoration
- **Interactive Workout Runner**:
  - Exercise title, target reps/seconds, and step-by-step instructions.
  - Live countdown timer, play/pause, next/previous buttons, and audio cues.
  - Automatically marks workout as `✅ DONE` upon completion.

### 5. 🥗 Weight Gain & Nutrition
- Purpose: Healthy muscle and weight gain through wholesome nutrition (no dirty bulking).
- Habits: *Breakfast completed*, *Lunch completed*, *Dinner completed*, *Protein target completed*, *Fruit/vegetable eaten*, and *No major meal skipped*.
- Metrics: Today's weight (kg), protein target (g, safe default 70g), and protein consumed (with `+10g`, `+20g`, `+30g` quick buttons).

### 6. ✨ Skincare
- Focus: Healthy skin cleansing, hydration, and sun protection.
- Morning routine: Face wash, Moisturizer, Sunscreen (SPF 30+).
- Night routine: Face wash, Night Moisturizer.
- Fully configurable skincare product manager in Settings.
- *Safety notice: Strictly focused on dermatological hygiene and sun safety. No false skin whitening claims.*

### 7. 💇 Hair Care
- Non-restrictive hair care: Does **not** force shampooing every day.
- Configurable wash days (e.g. Sunday & Thursday).
- Non-wash days focus on gentle scalp care, combing, and oiling.

### 8. 🧘 Height & Posture Support
- Habits: *Posture exercises/stretching*, *Good sleep posture*, *Regular physical activity*.
- Interactive guide with daily 3-minute posture decompression (Wall Angels, Chin Tucks, Doorway Chest Stretch, Cat-Cow).
- *Scientific notice: "These habits support posture, fitness and general health. Adult height cannot be guaranteed to increase after growth plates close."*

### 9. 🎓 College Schedule (DSATM)
- College: **Dayananda Sagar Academy of Technology and Management (DSATM)**.
- Shows today's classes directly on the Home Screen.
- **Fully Editable Weekly Timetable**: Add, edit, and delete classes for any day of the week (Monday–Sunday) with subject, start time, end time, and classroom.

### 10. 🚌 Commute & Travel
- Route: **Kaggalipura ↔ DSATM**.
- Dynamic calculator: Leave home time, expected travel duration (e.g. ~30 min), expected arrival, and evening return time.

### 11. 📚 Study & Academics
- Habits: *Today's class revision*, *Assignment/lab work*, *Tomorrow's preparation*.
- Focus tracking: Target minutes vs. completed minutes.
- Live Study Focus Timer with `+15m`, `+30m`, pause, and automatic minute accumulation.

### 12. 🍳 Independent Cooking
- Living alone: *Breakfast prepared*, *Lunch prepared*, *Dinner prepared*.
- Supports adding custom cooking tasks.

### 13. 📋 Daily Routine Timeline
- Synchronized daily schedule integrating habits, commute, and real DSATM lectures.

### 14. 🏆 Today's Result & Streak
- Real-time tally: `Completed: X`, `Not completed: X`, `Remaining: X`.
- **SAVE DAY**: Safely records the day into history.
- **NEXT DAY**: Advances cleanly to the next date without accidental deletion.
- **Streak Tracker**: Computes Current Streak and Best Streak. Missed days are recorded normally without harsh resets or punishment.

### 15. 💾 Backup & Data Safety
- Instant **Export Backup** to JSON.
- **Import Backup** with schema validation.

---

## 🛠️ Project Structure

```text
my-personal-transformation/
├── package.json               # Dependencies (@capacitor/cli, @capacitor/android, etc.)
├── capacitor.config.json      # Capacitor configuration
├── .gitignore                 # Comprehensive secret and build exclusion rules
├── index.html                 # Mobile-first single-page application
├── manifest.json              # PWA manifest
├── sw.js                      # Offline caching Service Worker
├── css/
│   └── app.css                # Clean design system, themes, and responsive layouts
├── js/
│   ├── state.js               # Reactive LocalStorage state manager
│   ├── tasks.js               # Category habit rules & stats calculator
│   ├── workout.js             # Beginner workout schedules & runner
│   ├── timetable.js           # DSATM college timetable manager
│   ├── routine.js             # Dynamic routine timeline generator
│   ├── history.js             # Streaks, history list, and day inspection
│   ├── backup.js              # JSON export and import
│   └── app.js                 # Main UI controller & event bindings
├── icons/                     # App icons (512x512, 192x192, favicon)
├── scripts/
│   ├── prepare-www.js         # Staging script for Android assets
│   └── generate-icons.py      # App icon generator
├── tests/
│   └── run-tests.js           # Unit test suite
└── android/                   # Native Android Studio / Gradle project
    └── app/build/outputs/apk/ # Generated installable Android APKs
```

---

## 🧪 Testing

Run the automated test suite:

```bash
npm test
```

All 11 unit and integration tests verify:
1. StateManager defaults, persistence, and day calculation
2. TaskManager category generation and progress stats
3. WorkoutSchedule for all 7 days and WorkoutRunner progression
4. DSATM Timetable CRUD and sorting
5. Routine timeline dynamic integration
6. Streak computation without user punishment
7. JSON backup restoration

---

## 📦 Building the Android App

To sync changes and build the Android APK:

```bash
# 1. Sync web assets
npm run build

# 2. Build Debug APK
npm run android:debug
```

The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`
