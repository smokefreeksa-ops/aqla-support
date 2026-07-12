import { useCallback, useEffect, useRef, useState } from "react";
import {
  MIN_SIGNAL_QUALITY,
  SECOND_LOOP_CRAVING_THRESHOLD,
} from "../sos.constants";
import { pickAlternateProtocol, PROTOCOLS } from "../sos.protocols";
import { selectSOSProtocol } from "../sos.selector";
import {
  appendHistory,
  computeEffectiveness,
  loadHistory,
  loadPersona,
  persistSession,
  recentCount24h,
} from "../sos.storage";
import type {
  AcousticState,
  AqlaPersona,
  ProtocolId,
  ProtocolSelection,
  SOSSession,
  SOSState,
} from "../sos.types";

export interface SOSMachine {
  state: SOSState;
  cravingBefore?: number;
  cravingAfter?: number;
  cravingDelta?: number;
  acoustic?: AcousticState;
  selection?: ProtocolSelection;
  persona?: AqlaPersona;
  isSecondLoop: boolean;
  firstProtocolId?: ProtocolId;
  sessionStartedAt?: string;
  triggerTag?: string;
  setCravingBefore: (n: number) => void;
  onVoiceCaptured: (a: AcousticState | undefined) => void;
  skipVoice: () => void;
  requestPermission: () => void;
  onProtocolFinished: () => void;
  setCravingAfter: (n: number) => void;
  finalize: (trigger?: string) => Promise<void>;
  reset: () => void;
  goToDelivery: () => void;
}

export function useSOSMachine(): SOSMachine {
  const [state, setState] = useState<SOSState>("idle");
  const [cravingBefore, setCravingBeforeState] = useState<number | undefined>();
  const [cravingAfter, setCravingAfterState] = useState<number | undefined>();
  const [cravingDelta, setCravingDelta] = useState<number | undefined>();
  const [acoustic, setAcoustic] = useState<AcousticState | undefined>();
  const [selection, setSelection] = useState<ProtocolSelection | undefined>();
  const [persona, setPersona] = useState<AqlaPersona | undefined>();
  const [isSecondLoop, setIsSecondLoop] = useState(false);
  const [firstProtocolId, setFirstProtocolId] = useState<ProtocolId | undefined>();
  const [sessionStartedAt, setSessionStartedAt] = useState<string | undefined>();
  const [triggerTag, setTriggerTag] = useState<string | undefined>();

  const finalizedRef = useRef(false);

  useEffect(() => {
    setPersona(loadPersona());
  }, []);

  const setCravingBefore = useCallback((n: number) => {
    setCravingBeforeState(n);
    setSessionStartedAt(new Date().toISOString());
    setState("permission");
  }, []);

  const requestPermission = useCallback(() => {
    setState("voice_capture");
  }, []);

  const skipVoice = useCallback(() => {
    setAcoustic(undefined);
    runSelection(undefined);
  }, []);

  const onVoiceCaptured = useCallback((a: AcousticState | undefined) => {
    if (!a || a.signalQuality < MIN_SIGNAL_QUALITY) {
      setState("fallback");
      setAcoustic(a);
      // Still deliver an intervention.
      runSelection(undefined);
      return;
    }
    setAcoustic(a);
    setState("local_analysis");
    // Small transition delay for the UI ("Preparing your intervention…").
    window.setTimeout(() => runSelection(a), 500);
  }, []);

  const runSelection = useCallback(
    (a: AcousticState | undefined) => {
      setState("context_fusion");
      const history = loadHistory();
      const now = new Date();
      const sel = selectSOSProtocol({
        acousticState: a,
        persona,
        localHour: now.getHours(),
        dayOfWeek: now.getDay(),
        currentCravingRating: cravingBefore,
        recentProtocolHistory: history,
        recentSOSCount24h: recentCount24h(history),
        previousProtocolEffectiveness: computeEffectiveness(history),
      });
      setSelection(sel);
      setState("protocol_selected");
      // Small pause so users see the routing screen briefly.
      window.setTimeout(() => setState("protocol_delivery"), 900);
    },
    [persona, cravingBefore],
  );

  const goToDelivery = useCallback(() => setState("protocol_delivery"), []);

  const onProtocolFinished = useCallback(() => {
    setState("post_craving_check");
  }, []);

  const setCravingAfter = useCallback(
    (n: number) => {
      setCravingAfterState(n);
      const before = cravingBefore ?? 0;
      setCravingDelta(before - n);
    },
    [cravingBefore],
  );

  const finalize = useCallback(
    async (trigger?: string) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      setTriggerTag(trigger);
      setState("logging");

      const before = cravingBefore ?? 0;
      const after = cravingAfter ?? before;
      const delta = before - after;
      const sel = selection;
      if (!sel) {
        setState("complete");
        return;
      }

      const session: SOSSession = {
        id: crypto.randomUUID(),
        startedAt: sessionStartedAt ?? new Date().toISOString(),
        completedAt: new Date().toISOString(),
        cravingBefore: before,
        cravingAfter: after,
        cravingDelta: delta,
        acousticFeatures: acoustic,
        protocolId: sel.protocol,
        selectionReason: sel.reason,
        personaSnapshot: persona,
        protocolCompleted: true,
        signalQuality: acoustic?.signalQuality,
        isSecondLoop,
        firstProtocolId,
        triggerTag: trigger,
      };

      appendHistory({
        protocolId: sel.protocol,
        cravingDelta: delta,
        at: Date.now(),
      });

      await persistSession(session);

      // If craving remains high, begin a second rescue loop with a different protocol.
      if (!isSecondLoop && after >= SECOND_LOOP_CRAVING_THRESHOLD) {
        const alt = pickAlternateProtocol(sel.protocol);
        setFirstProtocolId(sel.protocol);
        setIsSecondLoop(true);
        setSelection({ protocol: alt, reason: "second_loop_alt", confidence: 0.5 });
        setCravingBeforeState(after);
        setCravingAfterState(undefined);
        setCravingDelta(undefined);
        finalizedRef.current = false;
        setState("protocol_delivery");
        return;
      }

      setState("complete");
    },
    [
      acoustic,
      cravingAfter,
      cravingBefore,
      firstProtocolId,
      isSecondLoop,
      persona,
      selection,
      sessionStartedAt,
    ],
  );

  const reset = useCallback(() => {
    setState("idle");
    setCravingBeforeState(undefined);
    setCravingAfterState(undefined);
    setCravingDelta(undefined);
    setAcoustic(undefined);
    setSelection(undefined);
    setIsSecondLoop(false);
    setFirstProtocolId(undefined);
    setSessionStartedAt(undefined);
    setTriggerTag(undefined);
    finalizedRef.current = false;
  }, []);

  // Ensure PROTOCOLS import is retained (used by consumers via selection).
  void PROTOCOLS;

  return {
    state,
    cravingBefore,
    cravingAfter,
    cravingDelta,
    acoustic,
    selection,
    persona,
    isSecondLoop,
    firstProtocolId,
    sessionStartedAt,
    triggerTag,
    setCravingBefore,
    onVoiceCaptured,
    skipVoice,
    requestPermission,
    onProtocolFinished,
    setCravingAfter,
    finalize,
    reset,
    goToDelivery,
  };
}
