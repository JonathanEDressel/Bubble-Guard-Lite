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
// bubble_grow  — soft ascending "blip" of a bubble forming underwater
//               Frequency rises 120 Hz → 280 Hz (small bubble = higher pitch)
// ---------------------------------------------------------------------------
function generateGrow() {
  const duration   = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples    = [];
  let   phase      = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Ascending chirp: frequency rises as the bubble detaches and shrinks
    const freq = 230 - 160 * Math.exp(-t * 25);

    // 5 ms soft attack, then exponential decay
    const amp = Math.min(1.0, t / 0.005) * Math.exp(-t * 11);

    // Nearly pure sine — water damps harmonics, giving bubbles a clean tone
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const s = Math.sin(phase) * 0.90 + Math.sin(2 * phase) * 0.10;

    samples.push(amp * s * 24000);
  }
  return samples;
}

// ---------------------------------------------------------------------------
// bubble_pop  — descending "bloop" of a bubble popping at the surface
//               Frequency drops 350 Hz → 60 Hz (Minnaert resonance chirp)
// ---------------------------------------------------------------------------
function generatePop() {
  const duration   = 0.28;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples    = [];
  let   phase      = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Descending chirp: bubble expands → lower resonant frequency
    const freq = 60 + 290 * Math.exp(-t * 20);

    // 3 ms near-instant attack, exponential decay
    const amp = Math.min(1.0, t / 0.003) * Math.exp(-t * 14);

    // Pure sine with a tiny second harmonic for slight liquid "wetness"
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const s = Math.sin(phase) * 0.92 + Math.sin(2 * phase) * 0.08;

    samples.push(amp * s * 28000);
  }
  return samples;
}

// ---------------------------------------------------------------------------
writeWav(path.join(OUT_DIR, 'bubble_grow.wav'), generateGrow());
writeWav(path.join(OUT_DIR, 'bubble_pop.wav'),  generatePop());
console.log('Done.');
