import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { playSignal, type Playback } from '@/core/audio';
import { rankFor, sfx } from '@/core/game';
import { useSettings } from '@/core/store/settings';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import { MAX_LIVES, MAX_STEP, TOTAL_ROUNDS, XP_REWARD, dailyRng, freeRng, fmtSnr, gainFor, levelsFor, makeTriplets, sameTriplet, shareTextFor, skillSentence } from './logic';
import { speechShapedNoise } from './noise';
import { findTurkishVoice, speakDigits, stopSpeech, type VoiceInfo } from './tts';
import { useGurultuStore } from './store';

export type Phase = 'intro' | 'countdown' | 'play' | 'result';
export type Mode = 'free' | 'daily';

export type GameState = {
  round: number; step: number; score: number; combo: number; wrongStreak: number;
  correct: number; bestStep: number; bestSnrDb: number | null; bestCombo: number;
};
const INITIAL: GameState = { round: 0, step: 0, score: 0, combo: 0, wrongStreak: 0, correct: 0, bestStep: 0, bestSnrDb: null, bestCombo: 0 };

export type Feedback = { kind: 'good' | 'bad' | null; trigger: number; text: string };
export type Pop = { text: string; key: number };
export type Result = { score: number; ratio: number; prevBest: number; shareText: string; skill: string; stats: { label: string; value: string | number }[] };

function haptic(kind: 'light' | 'success' | 'error') {
  if (!useSettings.getState().haptics) return;
  const p = kind === 'light'
    ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    : Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  p.catch(() => {});
}

/**
 * Oyun döngüsü. Senkron: gürültü başlar → 150 ms sonra TTS rakamları okur → TTS bitince +300 ms kuyrukla gürültü durur.
 * Her tur bir "token" alır; eski turun gecikmeli işleri token eskiyince yok sayılır.
 */
export function useNoiseGame(onResult: MiniAppProps['onResult']) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('free');
  const [voice, setVoice] = useState<VoiceInfo>({ status: 'checking' });
  const [game, setGame] = useState<GameState>(INITIAL);
  const [input, setInput] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: null, trigger: 0, text: '' });
  const [pop, setPop] = useState<Pop>({ text: '', key: 0 });
  const [result, setResult] = useState<Result | null>(null);

  const gameRef = useRef<GameState>(INITIAL);
  const inputRef = useRef<number[]>([]);
  const acceptingRef = useRef(false);
  const voiceRef = useRef<VoiceInfo>({ status: 'checking' });
  const modeRef = useRef<Mode>('free');
  const tripletsRef = useRef<number[][]>([]);
  const tokenRef = useRef(0);
  const noiseRef = useRef<Playback | null>(null);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const mountedRef = useRef(true);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const update = useCallback((g: GameState) => { gameRef.current = g; setGame(g); }, []);
  const setInputBoth = useCallback((v: number[]) => { inputRef.current = v; setInput(v); }, []);
  const setAcceptingBoth = useCallback((v: boolean) => { acceptingRef.current = v; setAccepting(v); }, []);

  const wait = useCallback((ms: number) => new Promise<void>((r) => {
    const t = setTimeout(() => { timersRef.current.delete(t); r(); }, ms);
    timersRef.current.add(t);
  }), []);

  const stopAudio = useCallback(() => {
    stopSpeech();
    noiseRef.current?.stop();
    noiseRef.current = null;
  }, []);

  const stopAll = useCallback(() => {
    tokenRef.current++;
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current.clear();
    stopAudio();
  }, [stopAudio]);

  useEffect(() => {
    mountedRef.current = true;
    findTurkishVoice().then((v) => { if (mountedRef.current) { voiceRef.current = v; setVoice(v); } });
    return () => { mountedRef.current = false; stopAll(); };
  }, [stopAll]);

  const presentRound = useCallback(async () => {
    const token = ++tokenRef.current;
    const stale = () => token !== tokenRef.current || !mountedRef.current;
    stopAudio();
    setInputBoth([]);
    setAcceptingBoth(false);
    setListening(true);
    const lv = levelsFor(gameRef.current.step);
    await wait(450);
    if (stale()) return;
    try {
      const p = await playSignal(speechShapedNoise(), lv.noiseAmp);
      if (stale()) { p.stop(); return; }
      noiseRef.current = p;
    } catch { /* gürültü çalınamadı; rakamlar yine de okunur */ }
    await wait(150);
    if (stale()) return;
    setAcceptingBoth(true);
    await speakDigits(tripletsRef.current[gameRef.current.round] ?? [], voiceRef.current, lv.speechVol);
    if (stale()) return;
    await wait(300);
    if (stale()) return;
    noiseRef.current?.stop();
    noiseRef.current = null;
    setListening(false);
  }, [stopAudio, wait, setInputBoth, setAcceptingBoth]);

  const finish = useCallback((g: GameState) => {
    const store = useGurultuStore.getState();
    const prevBest = store.best;
    const ratio = g.correct > 0 ? (g.bestStep + 1) / (MAX_STEP + 1) : 0;
    const shareText = shareTextFor(g.score, g.bestSnrDb);
    store.record({ score: g.score, step: g.bestStep, snrDb: g.bestSnrDb, day: modeRef.current === 'daily' ? dayKey() : undefined });
    setResult({
      score: g.score, ratio, prevBest, shareText, skill: skillSentence(g.bestSnrDb),
      stats: [
        { label: 'Doğru', value: `${g.correct}/${TOTAL_ROUNDS}` },
        { label: 'En zor SNR', value: g.bestSnrDb == null ? '—' : fmtSnr(g.bestSnrDb) },
        { label: 'En uzun kombo', value: `x${g.bestCombo}` },
      ],
    });
    setPhase('result');
    onResultRef.current({ score: g.score, points: g.score, label: rankFor(ratio).name, xp: XP_REWARD, shareText });
  }, []);

  const evaluate = useCallback((digits: number[]) => {
    const g = gameRef.current;
    const target = tripletsRef.current[g.round] ?? [];
    const ok = sameTriplet(digits, target);
    stopAll();
    setListening(false);
    setAcceptingBoth(false);
    const lv = levelsFor(g.step);
    let next: GameState;
    if (ok) {
      const combo = g.combo + 1;
      const gain = gainFor(g.step, combo);
      next = {
        ...g, score: g.score + gain, combo, wrongStreak: 0, correct: g.correct + 1,
        bestStep: Math.max(g.bestStep, g.step),
        bestSnrDb: g.bestSnrDb == null ? lv.snrDb : Math.min(g.bestSnrDb, lv.snrDb),
        bestCombo: Math.max(g.bestCombo, combo), step: Math.min(MAX_STEP, g.step + 1),
      };
      sfx(combo >= 3 ? 'combo' : 'ding');
      haptic('success');
      setPop({ text: `+${gain.toLocaleString('tr-TR')}`, key: Date.now() });
      setFeedback((f) => ({ kind: 'good', trigger: f.trigger + 1, text: combo >= 3 ? `x${Math.min(5, combo)} kombo! Gürültü artıyor` : 'Doğru! Gürültü artıyor' }));
    } else {
      next = { ...g, combo: 0, wrongStreak: g.wrongStreak + 1, step: Math.max(0, g.step - 1) };
      sfx('buzz');
      haptic('error');
      setFeedback((f) => ({ kind: 'bad', trigger: f.trigger + 1, text: `Doğrusu: ${target.join(' ')}` }));
    }
    const finished = next.wrongStreak >= MAX_LIVES || g.round + 1 >= TOTAL_ROUNDS;
    update(next);
    wait(finished ? 1100 : 900).then(() => {
      if (!mountedRef.current) return;
      if (finished) { finish(next); return; }
      update({ ...next, round: g.round + 1 });
      presentRound();
    });
  }, [stopAll, setAcceptingBoth, update, wait, finish, presentRound]);

  const pressDigit = useCallback((d: number) => {
    if (!acceptingRef.current || inputRef.current.length >= 3) return;
    haptic('light');
    const next = [...inputRef.current, d];
    setInputBoth(next);
    if (next.length === 3) evaluate(next);
  }, [setInputBoth, evaluate]);

  const backspace = useCallback(() => {
    if (!acceptingRef.current || !inputRef.current.length) return;
    haptic('light');
    setInputBoth(inputRef.current.slice(0, -1));
  }, [setInputBoth]);

  const start = useCallback((m: Mode) => {
    stopAll();
    tripletsRef.current = makeTriplets(m === 'daily' ? dailyRng() : freeRng());
    modeRef.current = m;
    setMode(m);
    update(INITIAL);
    setInputBoth([]);
    setResult(null);
    setFeedback({ kind: null, trigger: 0, text: '' });
    setPop({ text: '', key: 0 });
    setPhase('countdown');
  }, [stopAll, update, setInputBoth]);

  const beginRounds = useCallback(() => { setPhase('play'); presentRound(); }, [presentRound]);
  const toIntro = useCallback(() => { stopAll(); setPhase('intro'); }, [stopAll]);

  return { phase, mode, voice, game, input, listening, accepting, feedback, pop, result, levels: levelsFor(game.step), start, beginRounds, toIntro, pressDigit, backspace };
}
