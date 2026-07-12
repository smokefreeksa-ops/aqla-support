import { useCallback, useRef, useState } from "react";
import { VOICE_CAPTURE_SECONDS } from "../sos.constants";
import { extractAcousticState, type RawFrame } from "../sos.scoring";
import type { AcousticState } from "../sos.types";

/**
 * PRIVACY BOUNDARY:
 * This hook opens the microphone, extracts short analysis frames, and
 * returns ONLY derived numeric features. Raw sample buffers are held for
 * the duration of a single frame read and are discarded when the analyzer
 * disconnects. No MediaRecorder, no Blob, no upload, no download.
 */
export interface VoiceAnalysisState {
  status: "idle" | "requesting" | "recording" | "analyzing" | "done" | "error";
  secondsLeft: number;
  liveLevel: number; // 0..1 for waveform UI
  result?: AcousticState;
  error?: string;
}

export function useVoiceAnalysis() {
  const [state, setState] = useState<VoiceAnalysisState>({
    status: "idle",
    secondsLeft: VOICE_CAPTURE_SECONDS,
    liveLevel: 0,
  });

  const stopRef = useRef<() => void>(() => {});

  const cancel = useCallback(() => {
    stopRef.current();
  }, []);

  const capture = useCallback(async (): Promise<AcousticState | undefined> => {
    setState({
      status: "requesting",
      secondsLeft: VOICE_CAPTURE_SECONDS,
      liveLevel: 0,
    });

    let stream: MediaStream | undefined;
    let ctx: AudioContext | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    let analyser: AnalyserNode | undefined;
    let rafId = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const cleanup = () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (interval) clearInterval(interval);
      try {
        analyser?.disconnect();
      } catch {
        /* ignore */
      }
      try {
        source?.disconnect();
      } catch {
        /* ignore */
      }
      try {
        stream?.getTracks().forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
      try {
        if (ctx && ctx.state !== "closed") void ctx.close();
      } catch {
        /* ignore */
      }
    };
    stopRef.current = cleanup;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      cleanup();
      const err = (e as Error).message || "mic_denied";
      setState({
        status: "error",
        secondsLeft: 0,
        liveLevel: 0,
        error: err,
      });
      return undefined;
    }

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
    source = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    const frames: RawFrame[] = [];
    const timeBuf = new Float32Array(analyser.fftSize);
    const freqBuf = new Uint8Array(analyser.frequencyBinCount);

    setState({
      status: "recording",
      secondsLeft: VOICE_CAPTURE_SECONDS,
      liveLevel: 0,
    });

    const startedAt = performance.now();
    const targetMs = VOICE_CAPTURE_SECONDS * 1000;

    const tick = () => {
      if (cancelled || !analyser) return;
      analyser.getFloatTimeDomainData(timeBuf);
      analyser.getByteFrequencyData(freqBuf);
      // Copy this frame's data (Float32Array copy prevents mutation).
      frames.push({
        timeDomain: new Float32Array(timeBuf),
        frequencyBins: new Uint8Array(freqBuf),
        sampleRate: ctx!.sampleRate,
      });
      let peak = 0;
      for (let i = 0; i < timeBuf.length; i++) {
        const v = Math.abs(timeBuf[i]);
        if (v > peak) peak = v;
      }
      setState((s) => ({
        ...s,
        liveLevel: Math.min(1, peak * 2),
      }));
      if (performance.now() - startedAt >= targetMs) return;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((targetMs - (performance.now() - startedAt)) / 1000),
      );
      setState((s) => ({ ...s, secondsLeft: remaining }));
    }, 200);

    await new Promise<void>((resolve) => setTimeout(resolve, targetMs + 100));

    if (cancelled) return undefined;

    setState((s) => ({ ...s, status: "analyzing" }));
    const result = extractAcousticState(frames);
    // Drop references to the raw frames; the garbage collector reclaims buffers.
    frames.length = 0;
    cleanup();
    setState({
      status: "done",
      secondsLeft: 0,
      liveLevel: 0,
      result,
    });
    return result;
  }, []);

  return { state, capture, cancel };
}
