import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '@/core/game';
import { badHaptic, goodHaptic, tapHaptic } from './haptics';
import { useSequencePlayer } from './useSequencePlayer';
import {
  MAX_LIVES, RANDOM_PADS, REVEAL_QUIPS, SONG_QUIPS, WRONG_QUIPS, activeNotes, dailyRng, dailySong, gapMsFor, isShuffledRound, isSilentRound,
  levelFor, padSeqFor, padsFor, phraseBonus, phraseSpans, pickNote, pickQuip, rhythmEvents, roundPoints, shuffle, songAt, songBonus, soundingCount,
  type Mode, type Pad, type RoundInfo, type Span,
} from './logic';
import type { Song } from './songs';

export type Turn = 'listen' | 'input' | 'wait' | 'reveal';
export type Summary = {
  mode: Mode; score: number; rounds: number; level: number; silentTotal: number; silentOk: number; won: boolean;
  song: Song | null; songNotes: number; songTotal: number; songsDone: number;
};
export type Reveal = { kind: 'phrase' | 'song'; song: Song; phrase: number; line: string; quip: string; n: number };
export type SongProgress = { phrase: number; phrases: number; notes: number; total: number; songNo: number } | null;
type Flash = { kind: 'good' | 'bad' | null; n: number };
type Pop = { text: string; n: number };

/** Değişken oyun durumu (kapanış sorunlarından kaçınmak için ref'te tutulur; ekran için state'e yansıtılır). */
type G = {
  mode: Mode; rng: () => number; pads: Pad[]; song: Song | null; songCursor: number; padSeq: number[]; spans: Span[]; phrase: number;
  seq: number[]; idx: number; inputStart: number; turn: Turn; roundNo: number;
  lives: number; score: number; level: number; completed: number; silentTotal: number; silentOk: number;
  songNotes: number; songsDone: number; lastQuip: string; retried: boolean; info: RoundInfo; alive: boolean;
};
const fresh = (mode: Mode, cursor: number): G => ({
  mode, rng: mode === 'daily' ? dailyRng() : Math.random, pads: [...RANDOM_PADS], song: null, songCursor: cursor, padSeq: [], spans: [], phrase: 0,
  seq: [], idx: 0, inputStart: 0, turn: 'wait', roundNo: 0,
  lives: MAX_LIVES, score: 0, level: 1, completed: 0, silentTotal: 0, silentOk: 0,
  songNotes: 0, songsDone: 0, lastQuip: '', retried: false, info: { silent: false, shuffled: false }, alive: false,
});
const padIds = (pads: readonly Pad[]) => pads.map((p) => p.id);

export function useTonGame(onFinish: (s: Summary) => void) {
  const { lit, playSequence, playRhythm, playNote, stop: stopPlayer } = useSequencePlayer();
  const g = useRef<G>(fresh('random', 0));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const [seq, setSeq] = useState<number[]>([]);
  const [pads, setPads] = useState<Pad[]>([...RANDOM_PADS]);
  const [order, setOrder] = useState<number[]>(activeNotes(1));
  const [turn, setTurn] = useState<Turn>('wait');
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [info, setInfo] = useState<RoundInfo>({ silent: false, shuffled: false });
  const [flash, setFlash] = useState<Flash>({ kind: null, n: 0 });
  const [pop, setPop] = useState<Pop>({ text: '', n: 0 });
  const [progress, setProgress] = useState(0);
  const [quip, setQuip] = useState('');
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [songProgress, setSongProgress] = useState<SongProgress>(null);

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const setTurnBoth = (t: Turn) => { g.current.turn = t; setTurn(t); };
  const baseOrder = (s: G) => (s.song ? padIds(s.pads) : activeNotes(s.level));
  const syncSong = useCallback((s: G) => {
    setSongProgress(s.song ? { phrase: s.phrase, phrases: s.spans.length, notes: s.songNotes, total: s.padSeq.length, songNo: s.songsDone + 1 } : null);
  }, []);
  const loadSong = useCallback((s: G, song: Song) => {
    s.song = song; s.pads = padsFor(song); s.padSeq = padSeqFor(song, s.pads); s.spans = phraseSpans(song);
    s.phrase = 0; s.songNotes = 0; s.seq = [];
    setPads(s.pads); setOrder(padIds(s.pads)); setSeq([]); syncSong(s);
  }, [syncSong]);

  const finish = useCallback((won: boolean) => {
    const s = g.current;
    if (!s.alive) return;
    s.alive = false;
    clearTimers();
    stopPlayer();
    setTurnBoth('wait');
    finishRef.current({
      mode: s.mode, score: s.score, rounds: s.completed, level: s.level, silentTotal: s.silentTotal, silentOk: s.silentOk, won,
      song: s.song, songNotes: s.songNotes, songTotal: s.song ? soundingCount(s.song) : 0, songsDone: s.songsDone,
    });
  }, [stopPlayer]);

  /** Diziyi çalar (sessiz turda ışıksız), karışık turda sonra pad'leri karıştırır, sırayı oyuncuya verir. */
  const listen = useCallback(async () => {
    const s = g.current;
    if (!s.alive) return;
    setTurnBoth('listen');
    setQuip('');
    setOrder(baseOrder(s));
    const ok = await playSequence(s.seq, s.pads, gapMsFor(s.level), !s.info.silent);
    if (!ok || !s.alive) return;
    if (s.info.shuffled) setOrder(shuffle(baseOrder(s), s.rng));
    s.idx = 0;
    s.inputStart = Date.now();
    setProgress(0);
    setTurnBoth('input');
  }, [playSequence]);

  const nextRound = useCallback(() => {
    const s = g.current;
    if (!s.alive) return;
    s.roundNo += 1;
    const lvl = levelFor(s.roundNo);
    if (lvl > s.level) sfx('levelUp');
    s.level = lvl;
    if (s.song) {
      const span = s.spans[s.phrase] ?? { start: 0, end: 0 };
      s.seq = s.padSeq.slice(span.start, span.start + s.seq.length + 1);
    } else {
      s.seq = [...s.seq, pickNote(s.seq, activeNotes(lvl), s.rng)];
    }
    s.info = { silent: isSilentRound(lvl, s.roundNo), shuffled: isShuffledRound(lvl, s.roundNo) };
    if (s.info.silent) s.silentTotal += 1;
    s.retried = false;
    setSeq(s.seq); setLevel(lvl); setInfo(s.info);
    later(() => { listen().catch(() => {}); }, 350);
  }, [listen]);

  /** Oyunu kurar; geri sayım bittiğinde `begin` çağrılır. songCursor: serbest şarkı modunda başlangıç şarkısı. */
  const start = useCallback((mode: Mode, songCursor = 0) => {
    clearTimers();
    stopPlayer();
    const s = fresh(mode, songCursor);
    g.current = s;
    setLives(MAX_LIVES); setScore(0); setLevel(1); setQuip(''); setReveal(null);
    setInfo({ silent: false, shuffled: false }); setTurnBoth('wait');
    setFlash({ kind: null, n: 0 }); setPop({ text: '', n: 0 });
    if (mode === 'random') { setPads([...RANDOM_PADS]); setOrder(activeNotes(1)); setSeq([]); setSongProgress(null); return; }
    loadSong(s, mode === 'daily' ? dailySong() : songAt(songCursor));
  }, [stopPlayer, loadSong]);

  const begin = useCallback(() => {
    g.current.alive = true;
    nextRound();
  }, [nextRound]);

  /** Cümle bitti: ritimli çal, perdeyi arala. Şarkı bittiyse konfeti + bonus. */
  const revealPhrase = useCallback((s: G, song: Song) => {
    const last = s.phrase >= s.spans.length - 1;
    const len = s.seq.length;
    const bonus = phraseBonus(len) + (last ? songBonus(song) : 0);
    s.score += bonus;
    if (last) s.songsDone += 1;
    s.lastQuip = pickQuip(last ? SONG_QUIPS : REVEAL_QUIPS, s.lastQuip, s.rng);
    setScore(s.score);
    setTurnBoth('reveal');
    syncSong(s);
    const phrase = s.phrase;
    setReveal((r) => ({ kind: last ? 'song' : 'phrase', song, phrase, line: song.lines[phrase] ?? song.lyricHint, quip: s.lastQuip, n: (r?.n ?? 0) + 1 }));
    later(() => { setPop((p) => ({ text: `+${bonus} ♪`, n: p.n + 1 })); sfx(last ? 'levelUp' : 'combo'); }, 350);
    later(() => { playRhythm(last ? rhythmEvents(song, s.pads) : rhythmEvents(song, s.pads, phrase), s.pads).catch(() => {}); }, 900);
  }, [playRhythm, syncSong]);

  /** Reveal kartından devam: sonraki cümle ya da sonraki şarkı. */
  const continueGame = useCallback(() => {
    const s = g.current;
    if (!s.alive || s.turn !== 'reveal' || !s.song) return;
    // Perde açılır açılmaz dokunulursa bekleyen ritimli çalım (900 ms) zamanlayıcısı hâlâ duruyor olabilir;
    // o sonradan çalışırsa yeni turun dinleme çalımını iptal eder ve oyun "Dinle…"de askıda kalır.
    clearTimers();
    stopPlayer();
    setReveal(null);
    const last = s.phrase >= s.spans.length - 1;
    if (last) {
      if (s.mode === 'daily') { finish(true); return; }
      s.songCursor += 1;
      loadSong(s, songAt(s.songCursor));
    } else {
      s.phrase += 1; s.seq = []; setSeq([]); syncSong(s);
    }
    setTurnBoth('wait');
    later(nextRound, 300);
  }, [stopPlayer, finish, nextRound, loadSong, syncSong]);

  const tap = useCallback((id: number) => {
    const s = g.current;
    if (!s.alive || s.turn !== 'input') return;
    const pad = s.pads[id];
    if (!pad) return;
    playNote(pad);
    tapHaptic();
    if (id === s.seq[s.idx]) {
      s.idx += 1;
      setProgress(s.idx);
      if (s.idx < s.seq.length) return;
      // tur tamam
      setTurnBoth('wait');
      const round = s.seq.length;
      const gain = roundPoints(round, Date.now() - s.inputStart);
      s.score += gain;
      s.completed += 1;
      if (s.info.silent && !s.retried) s.silentOk += 1;
      setScore(s.score);
      setPop((p) => ({ text: `+${gain}`, n: p.n + 1 }));
      setFlash((f) => ({ kind: 'good', n: f.n + 1 }));
      goodHaptic();
      if (s.song) {
        const span = s.spans[s.phrase] ?? { start: 0, end: 0 };
        s.songNotes = span.start + round;
        syncSong(s);
        if (round >= span.end - span.start) { later(() => revealPhrase(s, s.song!), 500); return; }
      }
      later(() => { sfx('combo'); }, 300);
      later(nextRound, 1000);
      return;
    }
    // yanlış
    setTurnBoth('wait');
    s.lives -= 1;
    s.retried = true;
    s.lastQuip = pickQuip(WRONG_QUIPS, s.lastQuip, s.rng);
    setLives(s.lives);
    setQuip(s.lastQuip);
    setFlash((f) => ({ kind: 'bad', n: f.n + 1 }));
    badHaptic();
    sfx('buzz');
    if (s.lives <= 0) { later(() => finish(false), 900); return; }
    later(() => { listen().catch(() => {}); }, 1400);
  }, [playNote, finish, nextRound, listen, revealPhrase, syncSong]);

  const abort = useCallback(() => { g.current.alive = false; clearTimers(); stopPlayer(); }, [stopPlayer]);
  useEffect(() => () => { g.current.alive = false; clearTimers(); }, []);

  return { seq, pads, order, turn, lives, score, level, info, flash, pop, progress, quip, reveal, songProgress, lit, start, begin, tap, continueGame, abort };
}
