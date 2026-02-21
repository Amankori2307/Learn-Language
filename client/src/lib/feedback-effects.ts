import confetti from "canvas-confetti";

function canAnimate(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) {
    return null;
  }
  return new Context();
}

function playTone(
  context: AudioContext,
  frequency: number,
  durationMs: number,
  startTime: number,
  gainLevel: number,
  type: OscillatorType = "sine",
  endFrequency?: number,
) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const filterNode = context.createBiquadFilter();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (typeof endFrequency === "number") {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + durationMs / 1000);
  }

  filterNode.type = "lowpass";
  filterNode.frequency.setValueAtTime(4000, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.006);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationMs / 1000);

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + durationMs / 1000);
}

export function runSuccessEffects(enabled: boolean) {
  if (!enabled) {
    return;
  }

  if (canAnimate()) {
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.65 },
      colors: ["#22c55e", "#34d399", "#86efac"],
    });
  }

  const audio = createAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  playTone(audio, 784, 170, now, 0.055, "triangle");
  playTone(audio, 988, 190, now + 0.09, 0.05, "square");
  playTone(audio, 1318, 170, now + 0.16, 0.038, "triangle");
  playTone(audio, 659, 220, now + 0.12, 0.028, "sine");
  window.setTimeout(() => void audio.close(), 700);
}

export function runErrorEffects(enabled: boolean) {
  if (!enabled) {
    return;
  }

  const audio = createAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  playTone(audio, 280, 180, now, 0.05, "sawtooth", 210);
  playTone(audio, 220, 220, now + 0.1, 0.048, "triangle", 140);
  playTone(audio, 160, 230, now + 0.2, 0.038, "sine", 115);
  window.setTimeout(() => void audio.close(), 800);
}
