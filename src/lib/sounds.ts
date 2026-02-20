const ctx = () => {
  if (!(window as any).__audioCtx) {
    (window as any).__audioCtx = new AudioContext();
  }
  return (window as any).__audioCtx as AudioContext;
};

const beep = (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // Audio not supported
  }
};

/** Placing X symbol — short bright click */
export const playPlaceX = () => {
  beep(880, 0.08, "square", 0.08);
};

/** Placing O symbol — slightly lower tone */
export const playPlaceO = () => {
  beep(660, 0.08, "square", 0.08);
};

/** Win fanfare — ascending notes */
export const playWin = () => {
  beep(523, 0.15, "square", 0.12);
  setTimeout(() => beep(659, 0.15, "square", 0.12), 120);
  setTimeout(() => beep(784, 0.15, "square", 0.12), 240);
  setTimeout(() => beep(1047, 0.3, "square", 0.15), 360);
};

/** Draw — descending flat tone */
export const playDraw = () => {
  beep(440, 0.2, "triangle", 0.1);
  setTimeout(() => beep(370, 0.3, "triangle", 0.1), 180);
};
