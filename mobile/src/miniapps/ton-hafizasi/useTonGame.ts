import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/core/game';
import { badHaptic, goodHaptic, tapHaptic } from './haptics';
import { useSequencePlayer } from './useSequencePlayer';
import { DAILY_CAP, MAX_LIVES, activeNotes, dailyRng, gapMsFor, isShuffledRound, isSilentRound, levelFor, pickNote, roundPoints, shuffle, type Mode, type RoundInfo } from './logic';

export type Turn = 'listen' | 'input' | 'wait';
export type Summary = { mode: Mode; score: number; rounds: number; level: number; silentTotal: number; silentOk: number; won: boolean };
type Flash = { kind: 'good' | 'bad' | null; n: number };
type Pop = { text: string; n: number };

/** Değişken oyun durumu (kapanış sorunlarından kaçınmak için ref'te tutulur; ekran için state'e yansıtılır). */
type G = {
  mode: Mode; rng: () => number; seq: number[]; idx: number; inputStart: number; turn: Turn;
  lives: number; score: number; level: number; completed: number; silentTotal: number; silentOk: number;
  retried: boolean; info: RoundInfo; alive: boolean;
};
const fresh = (mode: Mode): G => ({
  mode, rng: mode === 'daily' ? dailyRng() : Math.random, seq: [], idx: 0, inputStart: 0, turn: 'wait',
  lives: MAX_LIVES, score: 0, level: 1, completed: 0, silentTotal: 0, silentOk: 0, retried: false,
  info: { silent: false, shuffled: false }, alive: false,
});

export function useTonGame(onFinish: (s: Summary) => void) {
  const { lit, playSequence, playNote, stop: stopPlayer } = useSequencePlayer();
  const g = useRef<G>(fresh('free'));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const [seq, setSeq] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>(activeNotes(1));
  const [turn, setTurn] = useState<Turn>('wait');
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [info, setInfo] = useState<RoundInfo>({ silent: false, shuffled: false });
  const [flash, setFlash] = useState<Flash>({ kind: null, n: 0 });
  const [pop, setPop] = useState<Pop>({ text: '', n: 0 });
  const [progress, setProgress] = useState(0);

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const setTurnBoth = (t: Turn) => { g.current.turn = t; setTurn(t); };

  const finish = useCallback((won: boolean) => {
    const s = g.current;
    if (!s.alive) return;
    s.alive = false;
    clearTimers();
    stopPlayer();
    setTurnBoth('wait');
    finishRef.current({ mode: s.mode, score: s.score, rounds: s.completed, level: s.level, silentTotal: s.silentTotal, silentOk: s.silentOk, won });
  }, [stopPlayer]);

  /** Diziyi çalar (sessiz turda ışıksız), karışık turda sonra pad'leri karıştırır, sırayı oyuncuya verir. */
  const listen = useCallback(async () => {
    const s = g.current;
    if (!s.alive) return;
    setTurnBoth('listen');
    setOrder(activeNotes(s.level));
    const ok = await playSequence(s.seq, gapMsFor(s.level), !s.info.silent);
    if (!ok || !s.alive) return;
    if (s.info.shuffled) setOrder(shuffle(activeNotes(s.level), s.rng));
    s.idx = 0;
    s.inputStart = Date.now();
    setProgress(0);
    setTurnBoth('input');
  }, [playSequence]);

  const nextRound = useCallback(() => {
    const s = g.current;
    if (!s.alive) return;
    const round = s.seq.length + 1;
    const lvl = levelFor(round);
    if (lvl > s.level) sfx('levelUp');
    s.level = lvl;
    s.seq = [...s.seq, pickNote(s.seq, activeNotes(lvl), s.rng)];
    s.info = { silent: isSilentRound(lvl, round), shuffled: isShuffledRound(lvl, round) };
    if (s.info.silent) s.silentTotal += 1;
    s.retried = false;
    setSeq(s.seq); setLevel(lvl); setInfo(s.info);
    later(() => { listen().catch(() => {}); }, 350);
  }, [listen]);

  /** Oyunu kurar; geri sayım bittiğinde `begin` çağrılır. */
  const start = useCallback((mode: Mode) => {
    clearTimers();
    stopPlayer();
    g.current = fresh(mode);
    setSeq([]); setOrder(activeNotes(1)); setLives(MAX_LIVES); setScore(0); setLevel(1);
    setInfo({ silent: false, shuffled: false }); setTurnBoth('wait');
    setFlash({ kind: null, n: 0 }); setPop({ text: '', n: 0 });
  }, [stopPlayer]);

  const begin = useCallback(() => {
    g.current.alive = true;
    nextRound();
  }, [nextRound]);

  const tap = useCallback((note: number) => {
    const s = g.current;
    if (!s.alive || s.turn !== 'input') return;
    playNote(note);
    tapHaptic();
    if (note === s.seq[s.idx]) {
      s.idx += 1;
      setProgress(s.idx);
      if (s.idx < s.seq.length) return;
      // tur tamam
      setTurnBoth('wait');
      const round = s.seq.length;
      const gain = roundPoints(round, Date.now() - s.inputStart);
      s.score += gain;
      s.completed = round;
      if (s.info.silent && !s.retried) s.silentOk += 1;
      setScore(s.score);
      setPop((p) => ({ text: `+${gain}`, n: p.n + 1 }));
      setFlash((f) => ({ kind: 'good', n: f.n + 1 }));
      goodHaptic();
      later(() => { sfx('combo'); }, 300);
      if (s.mode === 'daily' && round >= DAILY_CAP) { later(() => finish(true), 900); return; }
      later(nextRound, 1000);
      return;
    }
    // yanlış
    setTurnBoth('wait');
    s.lives -= 1;
    s.retried = true;
    setLives(s.lives);
    setFlash((f) => ({ kind: 'bad', n: f.n + 1 }));
    badHaptic();
    sfx('buzz');
    if (s.lives <= 0) { later(() => finish(false), 700); return; }
    later(() => { listen().catch(() => {}); }, 1000);
  }, [playNote, finish, nextRound, listen]);

  const abort = useCallback(() => { g.current.alive = false; clearTimers(); stopPlayer(); }, [stopPlayer]);
  useEffect(() => () => { g.current.alive = false; clearTimers(); }, []);

  return { seq, order, turn, lives, score, level, info, flash, pop, progress, lit, start, begin, tap, abort };
}
