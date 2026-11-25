// Tiny WebAudio sound effects, synthesized at run time: no audio files, no network.
// Every sound is a short oscillator blip; the first user gesture unlocks the context.
export function createAudio() {
  let context = null;
  let muted = false;
  const audio = {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    unlock() {
      if (!context) {
        try {
          context = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
          context = null;
        }
      }
      if (context && context.state === 'suspended') context.resume();
    },
    play(name) {
      if (muted || !context) return;
      const now = context.currentTime;
      const notes = {
        pickup: [660, 0.06],
        chop: [220, 0.05],
        sizzle: [140, 0.12],
        ding: [880, 0.18],
        serve: [523, 0.1, 784, 0.14],
        coin: [988, 0.08, 1319, 0.12],
        fail: [196, 0.25],
        banish: [392, 0.08, 311, 0.1],
        surge: [330, 0.12, 262, 0.12],
      }[name];
      if (!notes) return;
      for (let i = 0; i < notes.length; i += 2) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = i === 0 ? 'triangle' : 'sine';
        oscillator.frequency.value = notes[i];
        const start = now + (i / 2) * 0.09;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + notes[i + 1]);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + notes[i + 1] + 0.02);
      }
    },
  };
  return audio;
}
