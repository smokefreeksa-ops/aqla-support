import type { AcousticState } from "./sos.types";

/**
 * PRIVACY BOUNDARY:
 * This module receives raw sample frames strictly inside the browser tab.
 * It returns only derived numeric features. Raw samples are never returned,
 * stored, or transmitted. Callers must discard sample buffers immediately.
 */

export interface RawFrame {
  timeDomain: Float32Array;
  frequencyBins: Uint8Array;
  sampleRate: number;
}

function mean(a: number[]): number {
  if (a.length === 0) return 0;
  let s = 0;
  for (const x of a) s += x;
  return s / a.length;
}

function stddev(a: number[]): number {
  if (a.length === 0) return 0;
  const m = mean(a);
  let s = 0;
  for (const x of a) s += (x - m) * (x - m);
  return Math.sqrt(s / a.length);
}

function normalize(x: number, lo: number, hi: number): number {
  if (hi <= lo) return 0;
  return Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
}

/**
 * Extract derived acoustic features from a sequence of short analysis frames.
 * All frame contents must be discarded by the caller after this returns.
 */
export function extractAcousticState(frames: RawFrame[]): AcousticState {
  if (frames.length === 0) {
    return {
      rmsEnergy: 0,
      zeroCrossingRate: 0,
      rmsVariability: 0,
      featureVariability: 0,
      signalQuality: 0,
      currentStateScore: 0,
    };
  }

  const rmsSeries: number[] = [];
  const zcrSeries: number[] = [];
  const centroidSeries: number[] = [];
  let clippedFrames = 0;
  let silentFrames = 0;

  for (const f of frames) {
    const t = f.timeDomain;
    let sumSq = 0;
    let zc = 0;
    let clipped = false;
    let prev = t[0];
    for (let i = 0; i < t.length; i++) {
      const v = t[i];
      sumSq += v * v;
      if (Math.abs(v) > 0.98) clipped = true;
      if (i > 0 && ((prev >= 0 && v < 0) || (prev < 0 && v >= 0))) zc++;
      prev = v;
    }
    const rms = Math.sqrt(sumSq / t.length);
    const zcr = zc / t.length;
    rmsSeries.push(rms);
    zcrSeries.push(zcr);
    if (rms < 0.005) silentFrames++;
    if (clipped) clippedFrames++;

    // Spectral centroid from magnitude bins.
    const bins = f.frequencyBins;
    let num = 0;
    let den = 0;
    for (let i = 0; i < bins.length; i++) {
      const mag = bins[i] / 255;
      num += i * mag;
      den += mag;
    }
    const centroidBin = den > 0 ? num / den : 0;
    // Map bin index to Hz (approximate).
    const nyquist = f.sampleRate / 2;
    const centroidHz = (centroidBin / bins.length) * nyquist;
    centroidSeries.push(centroidHz);
  }

  const rmsEnergy = mean(rmsSeries);
  const zcr = mean(zcrSeries);
  const rmsVariability = stddev(rmsSeries);
  const centroid = mean(centroidSeries);
  const centroidVar = stddev(centroidSeries);
  const featureVariability = (rmsVariability * 4 + centroidVar / 2000) / 2;

  // Signal quality: penalize silence and clipping.
  const totalFrames = frames.length;
  const silentRatio = silentFrames / totalFrames;
  const clippedRatio = clippedFrames / totalFrames;
  const rawEnergyOk = normalize(rmsEnergy, 0.005, 0.05);
  const signalQuality = Math.max(
    0,
    Math.min(1, rawEnergyOk * (1 - silentRatio) * (1 - clippedRatio)),
  );

  // Current state score: blend of arousal proxies. NOT a clinical biomarker.
  const arousal = normalize(rmsEnergy, 0.01, 0.12);
  const jitter = normalize(rmsVariability, 0.005, 0.05);
  const spectral = normalize(centroid, 800, 3500);
  const currentStateScore = Math.max(
    0,
    Math.min(1, arousal * 0.45 + jitter * 0.35 + spectral * 0.2),
  );

  return {
    rmsEnergy,
    zeroCrossingRate: zcr,
    rmsVariability,
    spectralCentroid: centroid,
    featureVariability,
    signalQuality,
    currentStateScore,
  };
}
