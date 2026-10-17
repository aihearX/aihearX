import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Countdown, FeedbackFlash, sfx } from '@/core/game';
import { AppText, Button } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { DUEL_TARGET, START_P, fmtPct, growDuel, levelForP, makeTrial, shrink, type Trial } from '../logic';
import { badHaptic, goodHaptic } from '../haptics';
import { usePairPlayer, type Sounding } from '../usePairPlayer';
import { ToneZones } from './ToneZones';

export type Side = 'a' | 'b';
type Flash = { kind: 'good' | 'bad' | null; n: number };
type G = { p: number; a: number; b: number; round: number; trial: Trial | null; answerable: boolean; alive: boolean };

type Props = { names: { a: string; b: string }; onFinish: (scores: { a: number; b: number }) => void; onQuit: () => void };

/** Bölünmüş ekran düello: üst yarı 180° döndürülmüş. İlk doğru dokunan puanı alır; yanlış dokunan rakibe verir. */
export function DuelGame({ names, onFinish, onQuit }: Props) {
  const { sounding, playPair, stop: stopPlayer } = usePairPlayer();
  const g = useRef<G>({ p: START_P, a: 0, b: 0, round: 0, trial: null, answerable: false, alive: false });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [ready, setReady] = useState(false);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [round, setRound] = useState(0);
  const [p, setP] = useState(START_P);
  const [answerable, setAnswerable] = useState(false);
  const [flashA, setFlashA] = useState<Flash>({ kind: null, n: 0 });
  const [flashB, setFlashB] = useState<Flash>({ kind: null, n: 0 });
  const [last, setLast] = useState<{ side: Side; ok: boolean } | null>(null);

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const next = useCallback(async () => {
    const s = g.current;
    if (!s.alive) return;
    s.round += 1;
    setRound(s.round);
    const t = makeTrial(s.p, levelForP(s.p));
    s.trial = t;
    s.answerable = false;
    setAnswerable(false);
    setLast(null);
    await playPair(t, () => { if (s.alive && s.trial === t) { s.answerable = true; setAnswerable(true); } });
  }, [playPair]);

  const answer = useCallback((side: Side, choice: 1 | 2) => {
    const s = g.current;
    if (!s.alive || !s.answerable || !s.trial) return;
    s.answerable = false;
    setAnswerable(false);
    const ok = (choice === 1) === s.trial.higherFirst;
    const winner: Side = ok ? side : side === 'a' ? 'b' : 'a';
    s[winner] += 1;
    s.p = ok ? shrink(s.p) : growDuel(s.p);
    setScores({ a: s.a, b: s.b });
    setP(s.p);
    setLast({ side, ok });
    const bump = (f: Flash, kind: 'good' | 'bad'): Flash => ({ kind, n: f.n + 1 });
    if (ok) { if (side === 'a') setFlashA((f) => bump(f, 'good')); else setFlashB((f) => bump(f, 'good')); goodHaptic(); sfx('ding'); }
    else { if (side === 'a') setFlashA((f) => bump(f, 'bad')); else setFlashB((f) => bump(f, 'bad')); badHaptic(); sfx('buzz'); }
    if (s[winner] >= DUEL_TARGET) {
      s.alive = false;
      later(() => { stopPlayer(); finishRef.current({ a: s.a, b: s.b }); }, 900);
      return;
    }
    later(() => { next().catch(() => {}); }, 1000);
  }, [next, stopPlayer]);

  const begin = useCallback(() => {
    g.current = { p: START_P, a: 0, b: 0, round: 0, trial: null, answerable: false, alive: true };
    setReady(true);
    next().catch(() => {});
  }, [next]);

  useEffect(() => () => { g.current.alive = false; timers.current.forEach(clearTimeout); }, []);

  const status = answerable ? 'Hangisi daha tiz?' : sounding ? `${sounding}. ses…` : ready ? 'Dinle…' : ' ';
  return (
    <View style={styles.root}>
      <View style={[styles.half, styles.flip]}>
        <Half side="b" name={names.b} score={scores.b} status={status} sounding={sounding} enabled={answerable} onPick={(c) => answer('b', c)} flash={flashB} last={last} />
      </View>
      <View style={styles.band}>
        <AppText variant="tiny" faint style={styles.flipText}>{round}. tur · fark {fmtPct(p)}</AppText>
        <View style={styles.bandMid}>
          <AppText variant="h3" color={colors.coral}>{scores.b}</AppText>
          <Ionicons name="flash" size={16} color={colors.coral} />
          <AppText variant="h3" color={colors.accent}>{scores.a}</AppText>
        </View>
        <AppText variant="tiny" faint>{round}. tur · fark {fmtPct(p)}</AppText>
      </View>
      <View style={styles.half}>
        <Half side="a" name={names.a} score={scores.a} status={status} sounding={sounding} enabled={answerable} onPick={(c) => answer('a', c)} flash={flashA} last={last} />
      </View>
      <View style={styles.quit}><Button title="Bırak" variant="ghost" size="sm" icon="close" haptic={false} onPress={() => { g.current.alive = false; stopPlayer(); onQuit(); }} /></View>
      {!ready ? <Countdown onDone={begin} label="Düello!" /> : null}
    </View>
  );
}

type HalfProps = { side: Side; name: string; score: number; status: string; sounding: Sounding; enabled: boolean; onPick: (c: 1 | 2) => void; flash: Flash; last: { side: Side; ok: boolean } | null };

function Half({ side, name, score, status, sounding, enabled, onPick, flash, last }: HalfProps) {
  const tint = side === 'a' ? colors.accent : colors.coral;
  const note = last ? (last.side === side ? (last.ok ? '+1 doğru!' : 'Yanlış, puan rakibe') : last.ok ? 'Rakip önce bildi' : '+1 rakip yanıldı') : status;
  return (
    <View style={styles.halfInner}>
      <View style={styles.head}>
        <AppText variant="h3" color={tint} numberOfLines={1} style={{ flex: 1 }}>{name}</AppText>
        <AppText variant="display" color={tint} style={{ fontVariant: ['tabular-nums'] }}>{score}</AppText>
        <AppText variant="small" faint>/ {DUEL_TARGET}</AppText>
      </View>
      <AppText variant="bodyStrong" center color={last ? (last.side === side ? (last.ok ? colors.mint : colors.red) : last.ok ? colors.textMuted : colors.mint) : enabled ? colors.mint : colors.textMuted} style={{ marginBottom: 8 }}>{note}</AppText>
      <ToneZones sounding={sounding} enabled={enabled} onPick={onPick} compact />
      <FeedbackFlash kind={flash.kind} trigger={flash.n} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  half: { flex: 1 },
  flip: { transform: [{ rotate: '180deg' }] },
  halfInner: { flex: 1, padding: 12, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 },
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, marginHorizontal: 12 },
  bandMid: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flipText: { transform: [{ rotate: '180deg' }] },
  quit: { alignItems: 'center', paddingBottom: 8 },
});
