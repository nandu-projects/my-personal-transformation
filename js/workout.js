// Beginner Home Workout Module - Zero gym equipment, clear instructions
const WORKOUT_SCHEDULE = {
  Monday: {
    title: 'Full Body Beginner Strength A',
    duration: '10–15 mins',
    intensity: 'Beginner Friendly',
    description: 'Build total body functional strength and posture using bodyweight.',
    exercises: [
      { name: 'Warmup: Arm Circles & Torso Twists', durationSec: 60, reps: '60s', instructions: 'Stand tall. Gently roll your arms in small circles for 30s forward, 30s backward. Gently twist side to side.' },
      { name: 'Bodyweight Chair/Air Squats', durationSec: 45, reps: '10–12 reps', instructions: 'Feet shoulder-width apart, chest high. Push hips back as if sitting in an imaginary chair. Push through heels to rise.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Take a sip of water and breathe deep.' },
      { name: 'Knee Push-ups or Wall Push-ups', durationSec: 45, reps: '8–10 reps', instructions: 'Hands slightly wider than shoulders. Keep your back straight, lower chest toward ground/wall, push back up.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Shake out your wrists and shoulders.' },
      { name: 'Glute Bridges', durationSec: 45, reps: '12 reps', instructions: 'Lie on your back, knees bent, feet flat on the floor. Lift hips upward until body forms a straight line from knees to shoulders.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Breathe smoothly.' },
      { name: 'Forearm Plank (or Knee Plank)', durationSec: 30, reps: '20–30s hold', instructions: 'Rest on forearms and toes (or knees). Keep body in a straight plank. Keep belly tight, do not let lower back sag.' },
      { name: 'Cool Down: Child\'s Pose & Chest Opener', durationSec: 60, reps: '60s', instructions: 'Kneel and reach arms forward onto the floor, lowering chest. Feel the gentle stretch across spine and shoulders.' }
    ]
  },
  Tuesday: {
    title: 'Full Body Beginner Strength B',
    duration: '10–15 mins',
    intensity: 'Beginner Friendly',
    description: 'Focus on core stability, legs, and back support.',
    exercises: [
      { name: 'Warmup: Marching in Place & Shoulder Rolls', durationSec: 60, reps: '60s', instructions: 'March comfortably in place while rolling shoulders up, back, and down.' },
      { name: 'Reverse Lunges (Step-Back)', durationSec: 45, reps: '8 reps per leg', instructions: 'Take a smooth step back with one leg, lower both knees comfortably, return to standing. Switch legs.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Relax your legs.' },
      { name: 'Incline Push-ups (Hands on Table/Bed/Wall)', durationSec: 45, reps: '10 reps', instructions: 'Place hands on a sturdy elevated surface. Keep core braced, lower chest and push back up smoothly.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Deep breaths.' },
      { name: 'Bird-Dog Core Stability', durationSec: 45, reps: '6 reps per side', instructions: 'On hands and knees: reach right arm forward and left leg back. Hold 2 seconds, switch sides.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Catch your breath.' },
      { name: 'Dead Bug Core Activation', durationSec: 45, reps: '8 reps per side', instructions: 'Lie on back with arms pointing up and knees bent at 90°. Slowly lower opposite arm and leg, return and alternate.' },
      { name: 'Cool Down: Cobra & Hamstring Stretch', durationSec: 60, reps: '60s', instructions: 'Lie prone, gently press hands up to stretch chest and abdomen, then sit back to stretch hamstrings.' }
    ]
  },
  Wednesday: {
    title: 'Active Recovery & Flexibility Flow',
    duration: '10–15 mins',
    intensity: 'Gentle Recovery',
    description: 'Relieve muscle tightness, support healthy posture and improve circulation.',
    exercises: [
      { name: 'Gentle Neck & Shoulder Mobility', durationSec: 60, reps: '60s', instructions: 'Slowly tilt head side-to-side, gently roll shoulders to release desk/study tension.' },
      { name: 'Cat-Cow Spine Flow', durationSec: 60, reps: '60s', instructions: 'On hands and knees: inhale arch back looking gently up (Cow), exhale round back tucking chin (Cat).' },
      { name: 'Doorway Chest Stretch', durationSec: 60, reps: '30s per side', instructions: 'Place forearm against doorframe, step forward gently to feel a comfortable stretch across chest and shoulders.' },
      { name: 'Standing Hamstring & Calf Reach', durationSec: 60, reps: '30s per leg', instructions: 'Extend one leg forward with heel on ground, hinge hips back and reach toward toes comfortably.' },
      { name: 'Deep Diaphragmatic Breathing', durationSec: 60, reps: '60s', instructions: 'Inhale deep into belly for 4s, hold 2s, exhale slowly for 6s. Rest and reset.' }
    ]
  },
  Thursday: {
    title: 'Full Body Beginner Strength C',
    duration: '10–15 mins',
    intensity: 'Beginner Friendly',
    description: 'Postural endurance, leg power, and upper body control.',
    exercises: [
      { name: 'Warmup: Jumping Jacks or Step-Jacks', durationSec: 60, reps: '60s', instructions: 'Step or hop feet out while raising arms overhead. Keep knees soft and land gently.' },
      { name: 'Sumo Squats (Wide Stance)', durationSec: 45, reps: '10–12 reps', instructions: 'Stand with feet wider than shoulder width, toes pointed outward at 45°. Squat down and push through heels.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Shake out legs.' },
      { name: 'Prone Cobra (Back & Posture)', durationSec: 45, reps: '10 reps (2s hold)', instructions: 'Lie face down. Squeeze shoulder blades together and lift upper chest and arms slightly off floor.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Breathe smoothly.' },
      { name: 'Wall Sit Hold', durationSec: 30, reps: '20–30s hold', instructions: 'Lean back against a flat wall, slide down until thighs are roughly parallel to ground. Hold steadily.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Stand and shake legs.' },
      { name: 'Knee-to-Elbow Standing Crunches', durationSec: 45, reps: '12 reps', instructions: 'Hands behind ears, bring right knee up across toward left elbow, then switch sides.' },
      { name: 'Cool Down: Full Body Reaching Stretch', durationSec: 60, reps: '60s', instructions: 'Stand tall, reach arms up to the ceiling, stretch long from feet to fingertips, then fold gently down.' }
    ]
  },
  Friday: {
    title: 'Full Body Endurance & Tone',
    duration: '10–15 mins',
    intensity: 'Beginner Friendly',
    description: 'Wrap up the weekdays strong with full body engagement.',
    exercises: [
      { name: 'Warmup: High Knees Walk & Arm Hugs', durationSec: 60, reps: '60s', instructions: 'Lift knees toward chest alternately while swinging arms open and closed across chest.' },
      { name: 'Standard Bodyweight Squats', durationSec: 45, reps: '12 reps', instructions: 'Smooth tempo: 2 seconds down, pause, drive up with good posture.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Short break.' },
      { name: 'Push-up Progression (Knee/Wall)', durationSec: 45, reps: '8–12 reps', instructions: 'Form over speed. Keep elbows tucked at 45 degrees, chest touching lowest comfortable point.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Breathe and hydrate.' },
      { name: 'Single-Leg Glute Bridge', durationSec: 45, reps: '6 reps per leg', instructions: 'Lie on back, lift one foot off floor, drive through the supporting heel to raise hips.' },
      { name: 'Rest & Breathe', durationSec: 30, reps: '30s', instructions: 'Reset for plank.' },
      { name: 'Side Plank on Knees', durationSec: 40, reps: '20s per side', instructions: 'Lie on side with knees bent at 90°, prop up onto elbow, lift hips off ground in a straight line.' },
      { name: 'Cool Down: Child\'s Pose & Deep Breaths', durationSec: 60, reps: '60s', instructions: 'Rest comfortably on knees, arms stretched forward, forehead resting on floor.' }
    ]
  },
  Saturday: {
    title: 'Light Activity & Mobility Walk',
    duration: '15 mins',
    intensity: 'Light Activity',
    description: 'Active weekend recovery: gentle walking, ankle/hip mobility, and fresh air.',
    exercises: [
      { name: '10–15 Min Brisk Walk', durationSec: 300, reps: 'Outdoor or Indoor', instructions: 'Put on comfortable footwear and take a pleasant, steady-paced walk around Kaggalipura or campus.' },
      { name: 'Standing Calf Raises', durationSec: 45, reps: '15 reps', instructions: 'Stand with hands on wall for balance, lift up onto the balls of both feet, hold 1s, lower slowly.' },
      { name: 'Butterfly Hip Stretch', durationSec: 60, reps: '60s hold', instructions: 'Sit on floor, soles of feet touching together, gently let knees fall open. Hold tall posture.' },
      { name: 'Standing Chest & Back Opener', durationSec: 60, reps: '60s', instructions: 'Interlock fingers behind your back and gently draw shoulders down and back.' }
    ]
  },
  Sunday: {
    title: 'Sunday Rest & Restoration',
    duration: 'Rest Day',
    intensity: 'Rest',
    description: 'True rest is when muscle recovery and repair happens. Sleep well and hydrate.',
    exercises: [
      { name: 'Rest & Spine Decompression', durationSec: 60, reps: 'Optional', instructions: 'Lie flat on a bed or mat with knees supported by a pillow. Relax completely for 5–10 minutes.' },
      { name: 'Hydration & Nutrition Reflection', durationSec: 60, reps: 'Reflection', instructions: 'Review your weekly hydration and protein intake. Prepare clean groceries for the week ahead.' }
    ]
  }
};

class WorkoutRunner {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentWorkout = null;
    this.currentIndex = 0;
    this.remainingSec = 0;
    this.timerId = null;
    this.isRunning = false;
  }

  startWorkout(dayName) {
    this.currentWorkout = WORKOUT_SCHEDULE[dayName] || WORKOUT_SCHEDULE.Monday;
    this.currentIndex = 0;
    this.loadExercise(0);
    return this.currentWorkout;
  }

  loadExercise(index) {
    if (!this.currentWorkout || index >= this.currentWorkout.exercises.length) {
      this.finish();
      return null;
    }
    this.currentIndex = index;
    const exercise = this.currentWorkout.exercises[index];
    this.remainingSec = exercise.durationSec || 45;
    this.isRunning = false;
    this.clearTimer();
    return exercise;
  }

  togglePlayPause(onTick) {
    if (this.isRunning) {
      this.pause();
    } else {
      this.play(onTick);
    }
    return this.isRunning;
  }

  play(onTick) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      this.remainingSec--;
      if (typeof onTick === 'function') {
        onTick(this.remainingSec, this.getCurrentExercise());
      }
      if (this.remainingSec <= 0) {
        this.playBeep();
        if (this.currentIndex + 1 < this.currentWorkout.exercises.length) {
          this.next(onTick);
        } else {
          this.finish();
        }
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    this.clearTimer();
  }

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  next(onTick) {
    this.clearTimer();
    const nextIdx = this.currentIndex + 1;
    if (nextIdx < this.currentWorkout.exercises.length) {
      this.loadExercise(nextIdx);
      this.play(onTick);
      return this.getCurrentExercise();
    } else {
      this.finish();
      return null;
    }
  }

  prev() {
    this.clearTimer();
    const prevIdx = Math.max(0, this.currentIndex - 1);
    this.loadExercise(prevIdx);
    return this.getCurrentExercise();
  }

  finish() {
    this.clearTimer();
    this.isRunning = false;
    this.playCelebrationSound();
    if (typeof this.onComplete === 'function') {
      this.onComplete();
    }
  }

  getCurrentExercise() {
    if (!this.currentWorkout) return null;
    return this.currentWorkout.exercises[this.currentIndex];
  }

  playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext unavailable or blocked by browser policy
    }
  }

  playCelebrationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.3);
        osc.start(audioCtx.currentTime + idx * 0.12);
        osc.stop(audioCtx.currentTime + idx * 0.12 + 0.3);
      });
    } catch (e) {}
  }
}

if (typeof window !== 'undefined') {
  window.WORKOUT_SCHEDULE = WORKOUT_SCHEDULE;
  window.WorkoutRunner = WorkoutRunner;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WORKOUT_SCHEDULE, WorkoutRunner };
}
