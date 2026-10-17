import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { playSignal, playTone, renderTone, silence, type Playback } from '@/core/audio';
import { sfx } from '@/core/game';
import { useSettings } from '@/core/store/settings';
import type { MiniAppProps } from '@/core/registry/types';
import { REPLAYS_PER_TRIAL, TEST_FREQS, TONE_AMPLITUDE, TONE_DURATION, XP_REWARD, badgeFor, buildTrials, estimateAge, shareTextFor, type AgeEstimate, type Badge, type Mark, type Trial } from './data';
import { useEarAgeStore, type EarAgeEntry } from './store';

export type Phase = 'intro' | 'headphone' | 'volume' | 'test' | 'result';
export type Outcome = { estimate: AgeEstimate; badge: Badge; highest: number | null; lowConfidence: boolean; entry: EarAgeEntry; previous: number | null };

function haptic(kind: 'light' | 'success' | 'warning') {
  if (!useSettings.getState().haptics) return;
  const p = kind === 'light'
    ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    : Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
  p.catch(() => {});
}

/**
 * Test akışı: 17→8 kHz tonlar + 2 sessiz tuzak. Her deneme bir kez tekrar çalınabilir.
 * Tuzaklar bittikten sonra üst üste 3 "Duydum" gelirse kalan kalın frekanslar duyulmuş sayılır (hızlı bitiş).
 */
export function useEarAge(onResult: MiniAppProps['onResult']) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState<Partial<Record<number, Mark>>>({});
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [replays, setReplays] = useState(REPLAYS_PER_TRIAL);
  const [honesty, setHonesty] = useState<string | null>(null);
  const [checked, setChecked] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const warble = useEarAgeStore((s) => s.warble);

  const current = useRef<Playback | null>(null);
  const token = useRef(0);
  const catchFails = useRef(0);
  const heardStreak = useRef(0);
  const marksRef = useRef<Partial<Record<number, Mark>>>({});
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const stopCurrent = useCallback(() => { token.current++; current.current?.stop(); current.current = null; setPlaying(false); }, []);
  useEffect(() => () => { token.current++; current.current?.stop(); }, []);

  const playTrial = useCallback(async (t: Trial) => {
    stopCurrent();
    const my = ++token.current;
    setPlaying(true);
    try {
      const sig = t.kind === 'catch' ? silence(TONE_DURATION) : renderTone({ freq: t.freq, duration: TONE_DURATION, amplitude: TONE_AMPLITUDE, ramp: 0.05, kind: warble ? 'warble' : 'sine' });
      const p = await playSignal(sig, 1);
      if (my !== token.current) { p.stop(); return; }
      current.current = p;
      await p.done;
    } catch { /* ses çalınamadı */ }
    if (my !== token.current) return;
    setPlaying(false);
    setPlayed(true);
  }, [stopCurrent, warble]);

  const earCheck = useCallback(async (ear: 'left' | 'right') => {
    stopCurrent();
    const my = ++token.current;
    setPlaying(true);
    try {
      const p = await playTone({ freq: 1000, duration: 0.7, amplitude: 0.4, ear, kind: 'warble' });
      if (my !== token.current) { p.stop(); return; }
      current.current = p;
      await p.done;
    } catch { /* */ }
    if (my === token.current) setPlaying(false);
  }, [stopCurrent]);
  const confirmEar = useCallback((ear: 'left' | 'right') => { haptic('light'); setChecked((c) => ({ ...c, [ear]: true })); }, []);

  const goTo = useCallback((t: Trial[], i: number) => {
    setIdx(i);
    setPlayed(false);
    setReplays(REPLAYS_PER_TRIAL);
    setTimeout(() => { playTrial(t[i]!).catch(() => {}); }, 450);
  }, [playTrial]);

  const beginTest = useCallback(() => {
    const t = buildTrials();
    setTrials(t);
    marksRef.current = {};
    setMarks({});
    catchFails.current = 0;
    heardStreak.current = 0;
    setHonesty(null);
    setOutcome(null);
    setPhase('test');
    goTo(t, 0);
  }, [goTo]);

  const finish = useCallback((finalMarks: Partial<Record<number, Mark>>) => {
    stopCurrent();
    const heard = TEST_FREQS.filter((f) => finalMarks[f] === 'heard' || finalMarks[f] === 'inferred');
    const highest = heard.length ? Math.max(...heard) : null;
    const estimate = estimateAge(highest);
    const lowConfidence = catchFails.current > 0;
    const store = useEarAgeStore.getState();
    const previous = store.history[0]?.age ?? null;
    const entry = store.add({ age: estimate.age, highest, lowConfidence, heard });
    setOutcome({ estimate, badge: badgeFor(highest), highest, lowConfidence, entry, previous });
    setPhase('result');
    haptic('success');
    sfx('levelUp');
    onResultRef.current({ score: estimate.age, label: `${estimate.age} yaş`, xp: XP_REWARD, shareText: shareTextFor(estimate.age), meta: { highestHeard: highest, lowConfidence } });
  }, [stopCurrent]);

  const answer = useCallback((heard: boolean) => {
    if (playing || !played) return;
    const t = trials[idx];
    if (!t) return;
    haptic('light');
    const lastCatch = trials.reduce((a, x, i) => (x.kind === 'catch' ? i : a), -1);
    if (t.kind === 'catch') {
      if (heard) { catchFails.current++; setHonesty('Dürüst ol 😉 Bu sefer hiç ses yoktu.'); sfx('buzz'); haptic('warning'); }
    } else {
      setHonesty(null);
      const next: Partial<Record<number, Mark>> = { ...marksRef.current, [t.freq]: heard ? 'heard' : 'missed' };
      heardStreak.current = heard ? heardStreak.current + 1 : 0;
      sfx(heard ? 'ding' : 'tick');
      if (heard && heardStreak.current >= 3 && idx >= lastCatch) {
        for (const f of TEST_FREQS) if (f < t.freq && next[f] == null) next[f] = 'inferred';
        marksRef.current = next;
        setMarks(next);
        finish(next);
        return;
      }
      marksRef.current = next;
      setMarks(next);
    }
    if (idx + 1 >= trials.length) { finish(marksRef.current); return; }
    goTo(trials, idx + 1);
  }, [playing, played, trials, idx, finish, goTo]);

  const replay = useCallback(() => {
    const t = trials[idx];
    if (!t || playing || replays <= 0) return;
    setReplays((r) => r - 1);
    playTrial(t).catch(() => {});
  }, [trials, idx, playing, replays, playTrial]);

  const restart = useCallback(() => { stopCurrent(); setChecked({ left: false, right: false }); setOutcome(null); setPhase('intro'); }, [stopCurrent]);

  const toneIndex = trials.slice(0, idx + 1).filter((x) => x.kind === 'tone').length;
  const currentTrial = trials[idx] ?? null;
  return { phase, setPhase, trials, idx, toneIndex, currentTrial, marks, playing, played, replays, honesty, dismissHonesty: () => setHonesty(null), checked, outcome, warble, earCheck, confirmEar, beginTest, answer, replay, restart, stopCurrent };
}
