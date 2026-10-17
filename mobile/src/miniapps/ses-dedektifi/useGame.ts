/**
 * Ses Dedektifi oyun durumu: tur akışı, ses çalma, süre, puan, can, kombo, seviye, sonuç.
 * Mantık bir ref'te (st) tutulur; her değişiklikten sonra `commit()` ile ekrana yansır.
 * Böylece async ses çalma ve zamanlayıcı geri çağrıları hiç bayat değer görmez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { playSignal, type Playback } from '@/core/audio';
import { sfx, useGameTimer, rankFor } from '@/core/game';
import { useSettings } from '@/core/store/settings';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import {
  DAILY_ROUNDS, LEVEL_HINT, LIVES, MAX_COMBO, REPLAY_COST, XP, levelFor, paramsFor, planDaily, planRound, ratioFor, roundPoints, shareTextFor,
  type Mode, type RoundPlan,
} from './engine';
import { renderSound } from './sounds';
import { useDedektifStore } from './store';
import type { Answer } from './components/OptionGrid';

export type Phase = 'intro' | 'countdown' | 'play' | 'result';
export type ResultData = { score: number; ratio: number; prevBest: number; rankName: string; shareText: string; stats: { label: string; value: string | number }[] };
export type Core = {
  phase: Phase; mode: Mode; round: number; level: number; lives: number; score: number; combo: number; maxCombo: number; correct: number; roundsPlayed: number;
  plan: RoundPlan | null; answer: Answer; playing: boolean;
  flash: { kind: 'good' | 'bad' | null; trigger: number };
  pop: { text: string; key: number };
  banner: { level: number; hint?: string; key: number } | null;
  result: ResultData | null;
};

const initial = (mode: Mode): Core => ({
  phase: 'intro', mode, round: 0, level: 1, lives: LIVES, score: 0, combo: 0, maxCombo: 0, correct: 0, roundsPlayed: 0,
  plan: null, answer: null, playing: false, flash: { kind: null, trigger: 0 }, pop: { text: '', key: 0 }, banner: null, result: null,
});

export function useGame(onResult: MiniAppProps['onResult']) {
  const [g, setG] = useState<Core>(() => initial('daily'));
  const st = useRef<Core>(g);
  const seq = useRef(0);
  const playback = useRef<Playback | null>(null);
  const token = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recent = useRef<string[]>([]);
  const dailyPlan = useRef<RoundPlan[] | null>(null);
  /** Bir sonraki tur önceden planlanır ve klibi geri bildirim beklerken üretilir (tur başında takılma olmaz). */
  const pending = useRef<RoundPlan | null>(null);
  const dayRef = useRef('');
  const leftRef = useRef(0);
  const resolveRef = useRef<(id: string | null) => void>(() => {});
  const haptics = useSettings((s) => s.haptics);
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  const record = useDedektifStore((s) => s.record);

  const commit = useCallback(() => setG({ ...st.current }), []);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const stopPlayback = useCallback(() => { token.current++; playback.current?.stop(); playback.current = null; }, []);
  const haptic = useCallback((k: 'success' | 'error') => {
    if (!hapticsRef.current) return;
    Haptics.notificationAsync(k === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, []);

  // Süre dolunca cevapsız say. setState güncelleyicisi içinden çağrıldığı için bir tık ertelenir.
  const { left, start: timerStart, stop: timerStop } = useGameTimer(10, () => { setTimeout(() => resolveRef.current(null), 0); });
  leftRef.current = left;

  /** Klibi üretir ve çalar; ilk çalışta tur süresini başlatır. Önceki ses her zaman durdurulur. */
  const playClip = useCallback(async (plan: RoundPlan, level: number, startTimer: boolean) => {
    stopPlayback();
    const tok = token.current;
    const p = paramsFor(level);
    st.current.playing = true;
    commit();
    try {
      const pb = await playSignal(renderSound(plan.sound, p.clip, p.noise), 1);
      if (tok !== token.current) { pb.stop(); return; }
      playback.current = pb;
      pb.done.then(() => { if (tok === token.current) { st.current.playing = false; commit(); } });
    } catch {
      if (tok === token.current) { st.current.playing = false; commit(); }
    }
    if (tok !== token.current) return;
    if (startTimer) timerStart(p.seconds);
  }, [commit, stopPlayback, timerStart]);

  const planFor = useCallback((round: number): RoundPlan => {
    const mode = st.current.mode;
    return (mode === 'daily' ? dailyPlan.current?.[round - 1] : undefined) ?? planRound(levelFor(round, mode), Math.random, recent.current);
  }, []);

  /** Gelecek turu planlar ve klibini arka planda önbelleğe alır. */
  const prefetch = useCallback((round: number) => {
    const plan = planFor(round);
    pending.current = plan;
    const p = paramsFor(levelFor(round, st.current.mode));
    later(() => { try { renderSound(plan.sound, p.clip, p.noise); } catch { /* çalma anında yeniden denenir */ } }, 80);
  }, [later, planFor]);

  const startRound = useCallback((round: number) => {
    const s = st.current;
    s.round = round;
    s.level = levelFor(round, s.mode);
    s.answer = null;
    s.pop = { text: '', key: s.pop.key };
    const plan = pending.current ?? planFor(round);
    pending.current = null;
    recent.current = [...recent.current.slice(-5), plan.sound.id];
    s.plan = plan;
    commit();
    void playClip(plan, s.level, true);
  }, [commit, planFor, playClip]);

  const finish = useCallback(() => {
    const s = st.current;
    const rounds = s.mode === 'daily' ? DAILY_ROUNDS : s.roundsPlayed;
    const ratio = ratioFor(s.score, rounds);
    const rank = rankFor(ratio);
    const prevBest = useDedektifStore.getState().best;
    record({ score: s.score, level: s.level, correct: s.correct, rank: rank.name, dayKey: s.mode === 'daily' ? dayRef.current : undefined });
    const shareText = shareTextFor(s.score, rank.name);
    s.result = {
      score: s.score, ratio, prevBest, rankName: rank.name, shareText,
      stats: [{ label: 'Doğru', value: `${s.correct}/${s.roundsPlayed}` }, { label: 'En uzun kombo', value: `x${Math.max(1, s.maxCombo)}` }, { label: 'Seviye', value: s.level }],
    };
    s.phase = 'result';
    s.plan = null;
    s.answer = null;
    s.pop = { text: '', key: s.pop.key };
    commit();
    onResult({ score: s.score, points: s.score, label: rank.name, xp: XP, shareText });
  }, [commit, onResult, record]);

  const next = useCallback(() => {
    const s = st.current;
    if (s.phase !== 'play') return;
    s.pop = { text: '', key: s.pop.key };
    if (s.lives <= 0 || (s.mode === 'daily' && s.round >= DAILY_ROUNDS)) { finish(); return; }
    const r = s.round + 1;
    const lv = levelFor(r, s.mode);
    if (lv > s.level) {
      void sfx('levelUp');
      haptic('success');
      s.banner = { level: lv, hint: LEVEL_HINT[lv], key: ++seq.current };
      commit();
      later(() => { st.current.banner = null; commit(); }, 1500);
      later(() => startRound(r), 900);
      return;
    }
    startRound(r);
  }, [commit, finish, haptic, later, startRound]);

  /** Seçim ya da süre dolumu (null). */
  const resolve = useCallback((chosen: string | null) => {
    const s = st.current;
    if (s.phase !== 'play' || !s.plan || s.answer) return;
    timerStop();
    stopPlayback();
    s.playing = false;
    const ok = chosen === s.plan.sound.id;
    s.answer = { chosenId: chosen ?? '', correctId: s.plan.sound.id };
    s.roundsPlayed = s.round;
    if (ok) {
      s.combo = Math.min(MAX_COMBO, s.combo + 1);
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      const pts = roundPoints(s.combo, leftRef.current);
      s.score += pts;
      s.correct += 1;
      s.flash = { kind: 'good', trigger: ++seq.current };
      s.pop = { text: `+${pts}`, key: ++seq.current };
      void sfx(s.combo >= 2 ? 'combo' : 'ding');
      haptic('success');
    } else {
      s.lives = Math.max(0, s.lives - 1);
      s.combo = 0;
      s.flash = { kind: 'bad', trigger: ++seq.current };
      void sfx('buzz');
      haptic('error');
    }
    commit();
    const gameOver = s.lives <= 0 || (s.mode === 'daily' && s.round >= DAILY_ROUNDS);
    if (!gameOver) prefetch(s.round + 1);
    later(next, ok ? 900 : 1700);
  }, [commit, haptic, later, next, prefetch, stopPlayback, timerStop]);
  resolveRef.current = resolve;

  const start = useCallback((mode: Mode) => {
    clearTimers();
    stopPlayback();
    timerStop();
    recent.current = [];
    dailyPlan.current = mode === 'daily' ? planDaily() : null;
    dayRef.current = dayKey();
    st.current = { ...initial(mode), phase: 'countdown' };
    commit();
    prefetch(1);
  }, [clearTimers, commit, prefetch, stopPlayback, timerStop]);

  const beginPlay = useCallback(() => {
    if (st.current.phase !== 'countdown') return;
    st.current.phase = 'play';
    startRound(1);
  }, [startRound]);

  const toIntro = useCallback((mode?: Mode) => {
    clearTimers();
    stopPlayback();
    timerStop();
    pending.current = null;
    st.current = initial(mode ?? st.current.mode);
    commit();
  }, [clearTimers, commit, stopPlayback, timerStop]);

  /** Tekrar dinle: 10 puan; süre devam eder. */
  const replay = useCallback(() => {
    const s = st.current;
    if (s.phase !== 'play' || !s.plan || s.answer || s.playing) return;
    s.score = Math.max(0, s.score - REPLAY_COST);
    commit();
    void playClip(s.plan, s.level, false);
  }, [commit, playClip]);

  const pick = useCallback((id: string) => resolve(id), [resolve]);

  useEffect(() => () => { clearTimers(); stopPlayback(); }, [clearTimers, stopPlayback]);

  return { g, left, start, beginPlay, toIntro, replay, pick };
}
