let audioContext;
let lastTapAt = 0;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTone({ frequency, duration, type = 'sine', gain = 0.05, delay = 0 }) {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playSweep({ from, to, duration, type = 'sine', gain = 0.04, delay = 0 }) {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, start);
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(Math.max(from, to) * 1.25, start);
  filter.Q.setValueAtTime(6, start);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.018);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(filter);
  filter.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

export function playTapSound() {
  const now = performance.now();
  if (now - lastTapAt < 45) return;
  lastTapAt = now;

  playTone({ frequency: 880, duration: 0.075, type: 'triangle', gain: 0.035 });
  playTone({ frequency: 1320, duration: 0.065, type: 'sine', gain: 0.022, delay: 0.035 });
}

export function playFoundSound() {
  playTone({ frequency: 1046.5, duration: 0.12, type: 'triangle', gain: 0.045 });
  playTone({ frequency: 1568, duration: 0.14, type: 'sine', gain: 0.04, delay: 0.07 });
  playTone({ frequency: 2093, duration: 0.18, type: 'sine', gain: 0.032, delay: 0.15 });
}

export function playCitySelectSound() {
  playSweep({ from: 220, to: 1568, duration: 0.34, type: 'sine', gain: 0.036 });
  playSweep({ from: 329.63, to: 2349.32, duration: 0.26, type: 'triangle', gain: 0.022, delay: 0.08 });
  playTone({ frequency: 1760, duration: 0.12, type: 'sine', gain: 0.024, delay: 0.26 });
  playTone({ frequency: 2637.02, duration: 0.1, type: 'sine', gain: 0.018, delay: 0.34 });
}
