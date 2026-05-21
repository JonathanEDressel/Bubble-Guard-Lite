/**
 * Generates bubble_grow.wav and bubble_pop.wav as 16-bit mono PCM WAV files.
 * Run from the repo root:  node generate_sounds.js
 */

const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, 'BubbleGuardLite', 'assets', 'sounds');

function writeWav(filename, samples) {
  const dataBytes = samples.length * 2;
  const buf = Buffer.alloc(44 + dataBytes);

  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);          // PCM chunk size
  buf.writeUInt16LE(1, 20);           // PCM format
  buf.writeUInt16LE(1, 22);           // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);           // block align
  buf.writeUInt16LE(16, 34);          // bits per sample
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-32768, Math.min(32767, Math.round(samples[i])));
    buf.writeInt16LE(clamped, 44 + i * 2);
  }

  fs.writeFileSync(filename, buf);
  console.log('Written:', filename);
}

// ---------------------------------------------------------------------------
// bubble_grow  — gentle rising whistle (200 Hz → 700 Hz over 0.45 s)
//               with soft fade-in and fade-out
// ---------------------------------------------------------------------------
function generateGrow() {
  const duration   = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples    = [];
  let   phase      = 0;

  for (let i = 0; i < numSamples; i++) {
    const progress = i / numSamples;

    // Smooth frequency sweep
    const freq = 200 + 500 * (progress * progress);

    // Amplitude envelope: quick fade-in, long sustain, short fade-out
    let amp;
    if      (progress < 0.08) amp = progress / 0.08;
    else if (progress > 0.85) amp = (1 - progress) / 0.15;
    else                       amp = 1.0;

    // Integrate phase to avoid discontinuities
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;

    const s =
      Math.sin(phase) * 0.65 +
      Math.sin(2 * phase) * 0.20 +
      Math.sin(3 * phase) * 0.08;

    samples.push(amp * s * 22000);
  }
  return samples;
}

// ---------------------------------------------------------------------------
// bubble_pop  — sharp low-frequency thump + decaying noise burst (0.18 s)
// ---------------------------------------------------------------------------
// Seeded LCG so the noise is deterministic across runs
let _seed = 0x1337BEEF;
function rand() {
  _seed = (_seed ^ (_seed << 13)) >>> 0;
  _seed = (_seed ^ (_seed >> 17)) >>> 0;
  _seed = (_seed ^ (_seed << 5))  >>> 0;
  return (_seed / 0xFFFFFFFF) * 2 - 1; // [-1, 1]
}

function generatePop() {
  const duration   = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples    = [];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Low transient "thump"
    const thump = Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 35);

    // High-frequency noise spray
    const noise = rand() * Math.exp(-t * 50);

    // Small tonal "ping" from the membrane
    const ping  = Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t * 80);

    const s = thump * 0.55 + noise * 0.30 + ping * 0.15;
    samples.push(s * 28000);
  }
  return samples;
}

// ---------------------------------------------------------------------------
writeWav(path.join(OUT_DIR, 'bubble_grow.wav'), generateGrow());
writeWav(path.join(OUT_DIR, 'bubble_pop.wav'),  generatePop());
console.log('Done.');
