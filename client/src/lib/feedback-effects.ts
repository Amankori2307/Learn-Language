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
) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationMs / 1000);

  oscillator.connect(gainNode);
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
  playTone(audio, 660, 120, now, 0.05);
  playTone(audio, 880, 140, now + 0.11, 0.04);
  window.setTimeout(() => void audio.close(), 450);
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
  playTone(audio, 220, 140, now, 0.045);
  playTone(audio, 170, 170, now + 0.12, 0.04);
  window.setTimeout(() => void audio.close(), 450);
}
