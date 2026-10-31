// Synthesised sound effects (Web Audio) - realistic cracker sounds
let ctx, noise, muted = localStorage.getItem('muted') === '1';
const AC = window.AudioContext || window.webkitAudioContext;

const c = () => {
  if (!ctx && AC) {
    ctx = new AC();
    // Create noise buffer
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise = b;
  }
  return ctx;
};

export const isReady = () => !!ctx && ctx.state === 'running';
export const unlock = () => { const x = c(); return x ? x.resume() : Promise.resolve() };
export const isMuted = () => muted;
export const setMuted = m => { muted = m; localStorage.setItem('muted', m ? '1' : '0') };
let active = false; export const setActive = v => { active = v };
const ok = () => active && !muted && isReady();

// ---------- helpers ----------
const env = (g, t, d, v) => {
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + .01 + d);
};

function tone(type, f1, f2, d, v, delay = 0) {
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + d);
  env(g, t, d, v);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + d + .1);
}

function hiss(d, v, f, type = 'lowpass', delay = 0, f2) {
  const t = ctx.currentTime + delay;
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise;
  fl.type = type;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  env(g, t, d, v);
  s.connect(fl).connect(g).connect(ctx.destination);
  s.start(t); s.stop(t + d + .1);
}

// ---------- Realistic cracker SFX ----------

export const sfx = {

  // ===== ROCKET =====
  // Whooshing whistle ascending → sky burst
  launch() {
    if (!ok()) return;
    // Rocket ignition sizzle
    hiss(.25, .3, 2500, 'highpass');
    // Ascending whistle (rising pitch)
    tone('sawtooth', 400, 3500, 1.2, .06);
    tone('sine', 600, 4000, 1.2, .08);
    // Trail hiss rising
    hiss(1.2, .2, 600, 'bandpass', 0, 5000);
    // Whoosh
    hiss(.6, .15, 1200, 'highpass', .1);
  },

  // ===== AERIAL BURST (after rocket reaches top) =====
  boom(v = 1) {
    if (!ok()) return;
    // Sharp initial crack
    hiss(.08, .8 * v, 8000, 'highpass');
    // Deep boom resonance
    tone('sine', 120, 25, .9, .6 * v);
    tone('sine', 80, 20, 1.2, .4 * v, .05);
    // Expanding crackle debris
    hiss(.8, .45 * v, 2000, 'lowpass', 0, 120);
    // Sparkle debris falling
    for (let i = 0; i < 14; i++) {
      hiss(.03, .1 * v, 5500, 'highpass', .1 + Math.random() * .9);
    }
    // Echo / reverb tail
    hiss(.4, .12 * v, 800, 'bandpass', .6);
  },

  // ===== CRACKLE (sparkle burst) =====
  crackle() {
    if (!ok()) return;
    for (let i = 0; i < 20; i++) {
      hiss(.025, .22, 5000, 'highpass', .08 + Math.random() * 1.2);
    }
    // Add some mid-range pops
    for (let i = 0; i < 6; i++) {
      tone('sine', 300 + Math.random() * 400, 80, .05, .12, .1 + Math.random() * .8);
    }
  },

  // ===== FLOWER POT (Anar) =====
  // Starts slow, builds to tall fountain of sparks with sizzling
  flowerPot(d = 3.2) {
    if (!ok()) return;
    const t = ctx.currentTime;

    // Base fountain hiss — starts quiet, grows louder, fades
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; s.loop = true;
    f.type = 'bandpass'; f.Q.value = .6;
    f.frequency.setValueAtTime(1200, t);
    f.frequency.linearRampToValueAtTime(4200, t + d * .5);
    f.frequency.linearRampToValueAtTime(2800, t + d * .8);
    f.frequency.linearRampToValueAtTime(1500, t + d);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.08, t + .3);
    g.gain.linearRampToValueAtTime(.32, t + d * .4);
    g.gain.setValueAtTime(.32, t + d * .7);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f).connect(g).connect(ctx.destination);
    s.start(t); s.stop(t + d + .1);

    // Sizzle sparks
    for (let i = 0; i < 50; i++) {
      const at = .3 + Math.random() * (d - .5);
      hiss(.03, .18 + Math.random() * .1, 4000 + Math.random() * 3000, 'highpass', at);
    }

    // Low rumble undertone
    const s2 = ctx.createBufferSource(), f2 = ctx.createBiquadFilter(), g2 = ctx.createGain();
    s2.buffer = noise; s2.loop = true;
    f2.type = 'lowpass'; f2.frequency.value = 400;
    g2.gain.setValueAtTime(.0001, t);
    g2.gain.exponentialRampToValueAtTime(.1, t + .5);
    g2.gain.setValueAtTime(.1, t + d - .8);
    g2.gain.exponentialRampToValueAtTime(.0001, t + d);
    s2.connect(f2).connect(g2).connect(ctx.destination);
    s2.start(t); s2.stop(t + d + .1);

    // Colour change pops (flower pot changes colours)
    for (let i = 1; i <= 3; i++) {
      const pt = d * (i / 4);
      tone('sine', 300, 150, .08, .15, pt);
      hiss(.06, .25, 6000, 'highpass', pt);
    }
  },

  // ===== 100-WALA (Ladi / Garland - rapid chain crackers) =====
  // Fast repeating pops/bangs like a string of firecrackers
  hundredWala(count = 100, duration = 6) {
    if (!ok()) return;
    const interval = duration / count;

    for (let i = 0; i < count; i++) {
      const delay = i * interval + (Math.random() - .5) * interval * .4;
      const vol = .15 + Math.random() * .15;
      const freq = 150 + Math.random() * 200;

      // Each individual cracker pop
      hiss(.04, vol, 6000 + Math.random() * 3000, 'highpass', delay);
      tone('sine', freq, 40, .06, vol * .7, delay);

      // Occasional louder double-pop
      if (Math.random() < .15) {
        hiss(.03, vol * 1.3, 7000, 'highpass', delay + .02);
        tone('sine', freq + 100, 30, .04, vol, delay + .025);
      }
    }

    // Continuous smoke/debris rumble underneath
    const t = ctx.currentTime;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; s.loop = true;
    f.type = 'lowpass'; f.frequency.value = 600;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.08, t + .3);
    g.gain.setValueAtTime(.08, t + duration - 1);
    g.gain.exponentialRampToValueAtTime(.0001, t + duration);
    s.connect(f).connect(g).connect(ctx.destination);
    s.start(t); s.stop(t + duration + .2);

    // Grand finale — last few are louder and faster
    const finaleStart = duration - duration * .15;
    for (let i = 0; i < 15; i++) {
      const d2 = finaleStart + Math.random() * duration * .12;
      hiss(.05, .35, 7000, 'highpass', d2);
      tone('sine', 200 + Math.random() * 300, 30, .08, .25, d2);
    }
  },

  // ===== GROUND CHAKKAR (spinning ground spinner) =====
  // Spinning whir that speeds up then pops
  chakkar(d = 3) {
    if (!ok()) return;
    const t = ctx.currentTime;

    // Spinning whir — oscillator sweeps up in speed
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(2000, t + d * .8);
    o.frequency.exponentialRampToValueAtTime(3000, t + d);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.08, t + .2);
    g.gain.linearRampToValueAtTime(.12, t + d * .6);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + d + .1);

    // Sizzle sparks while spinning
    for (let i = 0; i < 35; i++) {
      hiss(.02, .12, 4500 + Math.random() * 2000, 'highpass', Math.random() * d);
    }

    // Final pop when it ends
    hiss(.08, .5, 7000, 'highpass', d);
    tone('sine', 180, 40, .12, .3, d);
  },

  // ===== SPARKLER (hand sparkler sizzle) =====
  sparkler(d = 4) {
    if (!ok()) return;
    const t = ctx.currentTime;

    // Continuous gentle sizzle
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; s.loop = true;
    f.type = 'highpass'; f.frequency.value = 3000;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.12, t + .3);
    g.gain.setValueAtTime(.12, t + d - 1);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f).connect(g).connect(ctx.destination);
    s.start(t); s.stop(t + d + .1);

    // Tiny sparkle pops
    for (let i = 0; i < 60; i++) {
      hiss(.01, .06 + Math.random() * .06, 5000 + Math.random() * 4000, 'highpass', .3 + Math.random() * (d - .5));
    }
  },

  // ===== SKY SHOT / MULTI-SHOT =====
  // Repeated aerial launches with bursts
  skyShot(count = 5) {
    if (!ok()) return;
    for (let i = 0; i < count; i++) {
      const d = i * .8;
      // Thump launch
      tone('sine', 200, 80, .12, .2, d);
      hiss(.15, .2, 2000, 'highpass', d);
      // Whistle up
      tone('sine', 500, 2500, .5, .04, d + .05);
      // Burst
      hiss(.06, .5, 7000, 'highpass', d + .55);
      tone('sine', 130, 25, .6, .35, d + .55);
      hiss(.5, .25, 1500, 'lowpass', d + .55, 120);
      // Sparkle debris
      for (let j = 0; j < 6; j++) {
        hiss(.025, .1, 5000, 'highpass', d + .6 + Math.random() * .5);
      }
    }
  },

  // ===== Kept from original for UI interactions =====
  pop() {
    if (!ok()) return;
    hiss(.09, .7, 6000, 'highpass');
    tone('sine', 200, 50, .1, .3);
  },

  tick() {
    if (!ok()) return;
    tone('triangle', 900, 600, .07, .12);
  },

  open() {
    if (!ok()) return;
    hiss(.25, .15, 800, 'bandpass', 0, 3000);
    tone('sine', 660, 990, .2, .12, .05);
  },

  coin() {
    if (!ok()) return;
    tone('triangle', 988, 988, .1, .15);
    tone('triangle', 1319, 1319, .3, .15, .09);
    sfx.pop();
  },

  fanfare() {
    if (!ok()) return;
    // Grand Diwali fanfare
    [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, .5, .14, i * .13));
    // Followed by rapid 100-wala burst
    sfx.hundredWala(30, 1.5);
    // And a big sky burst
    setTimeout(() => { if (ok()) sfx.boom(1.2) }, 800);
  }
};
