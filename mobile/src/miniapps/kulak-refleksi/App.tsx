import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ProgressBar, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { playTone, type Playback } from '@/core/audio';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { RESPONSE_WINDOW, TONE_FREQ, TONE_SECONDS, TRIALS, WRONG_PENALTY, randomDelay, randomEar, rtVerdict, summarize, type Ear, type Trial } from './logic';
import { useRefleksStore } from './store';
import { Pads } from './components/Pads';
import { Distribution } from './components/Distribution';

type Phase = 'intro' | 'play' | 'done';
type Status = 'waiting' | 'armed' | 'feedback';

export default function KulakRefleksi({ onResult }: MiniAppProps) {
  const { bestMeanRt, games, record } = useRefleksStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [checked, setChecked] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const [trials, setTrials] = useState<Trial[]>([]);
  const [status, setStatus] = useState<Status>('waiting');
  const [flash, setFlash] = useState<{ ear: Ear | null; color: string }>({ ear: null, color: colors.surface });
  const [msg, setMsg] = useState('Hazır ol…');
  const [lastRt, setLastRt] = useState<number | null>(null);
  const [isBest, setIsBest] = useState(false);

  const statusRef = useRef<Status>('waiting');
  const earRef = useRef<Ear>('left');
  const startRef = useRef(0);
  const trialsRef = useRef<Trial[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playRef = useRef<Playback | null>(null);
  const alive = useRef(true);

  const nextTrialRef = useRef<() => void>(() => {});

  const later = useCallback((fn: () => void, ms: number) => { const t = setTimeout(() => { if (alive.current) fn(); }, ms); timers.current.push(t); return t; }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  const setSt = useCallback((s: Status) => { statusRef.current = s; setStatus(s); }, []);

  const checkEar = async (ear: Ear) => {
    playRef.current?.stop();
    try { playRef.current = await playTone({ freq: TONE_FREQ, duration: 0.4, amplitude: 0.5, ear }); } catch { /* */ }
    setChecked((c) => ({ ...c, [ear]: true }));
  };

  const finish = useCallback((all: Trial[]) => {
    const s = summarize(all);
    const best = record(s.meanRt, s.accuracy);
    setIsBest(best);
    setPhase('done');
    const acc = Math.round(s.accuracy * 100);
    onResult({
      score: acc,
      points: s.points,
      xp: 30 + (best ? 10 : 0),
      label: s.meanRt == null ? 'Ölçülemedi' : `ort. ${s.meanRt} ms · %${acc}`,
      shareText: `Kulak Refleksi ⚡ ort. ${s.meanRt ?? '—'} ms · %${acc} doğru · aihearX`,
      meta: { meanRt: s.meanRt, medianRt: s.medianRt, bestRt: s.bestRt, best },
    });
  }, [onResult, record]);

  const recordTrial = useCallback((t: Trial) => {
    clearTimers();
    playRef.current?.stop();
    const all = [...trialsRef.current, t];
    trialsRef.current = all;
    setTrials(all);
    setSt('feedback');
    const ok = t.kind === 'hit';
    setLastRt(t.rt);
    setMsg(ok ? `${t.rt} ms` : t.kind === 'wrong' ? `Yanlış taraf · +${WRONG_PENALTY} ms ceza` : t.kind === 'early' ? 'Erken bastın' : 'Kaçırdın');
    setFlash({ ear: t.ear, color: ok ? 'rgba(74,222,128,0.35)' : 'rgba(255,92,92,0.35)' });
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    later(() => {
      setFlash({ ear: null, color: colors.surface });
      if (all.length >= TRIALS) finish(all);
      else nextTrialRef.current();
    }, 700);
  }, [clearTimers, finish, later, setSt]);

  const nextTrial = useCallback(() => {
    setSt('waiting');
    setMsg('Hazır ol…');
    const ear = randomEar();
    earRef.current = ear;
    later(async () => {
      if (statusRef.current !== 'waiting') return;
      try {
        playRef.current?.stop();
        playRef.current = await playTone({ freq: TONE_FREQ, duration: TONE_SECONDS, amplitude: 0.6, ear, ramp: 0.005 });
      } catch { /* ses yoksa yine de ölç */ }
      if (!alive.current || statusRef.current !== 'waiting') return;
      startRef.current = Date.now();
      setSt('armed');
      setMsg('Şimdi!');
      later(() => { if (statusRef.current === 'armed') recordTrial({ ear, kind: 'miss', rt: null }); }, RESPONSE_WINDOW);
    }, randomDelay());
  }, [later, recordTrial, setSt]);

  useEffect(() => { nextTrialRef.current = nextTrial; }, [nextTrial]);

  const tap = (side: Ear) => {
    const st = statusRef.current;
    if (st === 'feedback') return;
    if (st === 'waiting') { recordTrial({ ear: earRef.current, kind: 'early', rt: null }); return; }
    const rt = Date.now() - startRef.current;
    recordTrial({ ear: earRef.current, kind: side === earRef.current ? 'hit' : 'wrong', rt });
  };

  const start = () => {
    trialsRef.current = []; setTrials([]); setLastRt(null); setIsBest(false);
    setPhase('play');
    nextTrial();
  };

  useEffect(() => () => { alive.current = false; clearTimers(); playRef.current?.stop(); }, [clearTimers]);

  if (phase === 'intro') {
    const ready = checked.left && checked.right;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.ocean}>
            <AppText variant="display" color={colors.white}>Kulak Refleksi</AppText>
            <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: space.sm }}>
              Ton SOL ya da SAĞ kulağına gelir; doğru tarafa olabildiğince hızlı bas. {TRIALS} deneme. Yanlış taraf {WRONG_PENALTY} ms ceza, erken basmak boşa gider.
            </AppText>
          </Card>
        </Animated.View>
        <Card>
          <AppText variant="h3">🎧 Kulaklık takmadan oynanmaz</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>Hoparlörde sol/sağ ayrımı olmaz. Kulaklığı tak, iki kulağı da test et; ses hangi taraftan geliyorsa kulaklık doğru takılı demektir.</AppText>
          <View style={[styles.row, { marginTop: space.md }]}>
            <Button title={checked.left ? 'Sol ✓' : 'Sol kulağı dene'} icon="arrow-back" variant="secondary" onPress={() => void checkEar('left')} style={{ flex: 1 }} />
            <Button title={checked.right ? 'Sağ ✓' : 'Sağ kulağı dene'} icon="arrow-forward" variant="secondary" onPress={() => void checkEar('right')} style={{ flex: 1 }} />
          </View>
        </Card>
        <View style={styles.row}>
          <Stat label="En iyi ort." value={bestMeanRt == null ? '—' : `${bestMeanRt} ms`} icon="flash" color={colors.amber} />
          <Stat label="Oyun" value={games} icon="game-controller" />
        </View>
        <View style={styles.chips}><Chip label="1 kHz kısa ton" icon="musical-notes" /><Chip label="Ses göreli, kalibre değil" icon="information-circle" /></View>
        <Button title={ready ? 'Başla' : 'Önce iki kulağı da dene'} icon="play" size="lg" disabled={!ready} onPress={start} />
      </ScrollView>
    );
  }

  if (phase === 'done') {
    const s = summarize(trials);
    const acc = Math.round(s.accuracy * 100);
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={ZoomIn}>
          <ShareCard
            title={s.meanRt == null ? '—' : `${s.meanRt} ms`}
            subtitle={`%${acc} doğru · ${rtVerdict(s.meanRt)}${isBest ? ' · YENİ REKOR ⚡' : ''}`}
            gradient={gradients.ocean}
            makerName={SEBAHATTIN.name}
            shareText={`Kulak Refleksi ⚡ ort. ${s.meanRt ?? '—'} ms · %${acc} doğru · aihearX`}
          >
            <AppText variant="h3" color={colors.white}>{trials.map((t) => (t.kind === 'hit' ? (t.ear === 'left' ? '🔵' : '🔴') : '⚫')).join('')}</AppText>
          </ShareCard>
        </Animated.View>
        <View style={styles.row}>
          <Stat label="Medyan" value={s.medianRt == null ? '—' : `${s.medianRt} ms`} icon="speedometer" />
          <Stat label="En hızlı" value={s.bestRt == null ? '—' : `${s.bestRt} ms`} icon="flash" color={colors.amber} />
          <Stat label="Puan" value={s.points} icon="trophy" color={colors.mint} />
        </View>
        <Distribution trials={trials} />
        <AppText variant="tiny" faint center>Tepki süresi cihaz ve kulaklık gecikmesini de içerir; kendi rekorlarınla kıyasla. Tanı yerine geçmez.</AppText>
        <Button title="Tekrar Oyna" icon="refresh" size="lg" onPress={start} />
      </ScrollView>
    );
  }

  const done = trials.length;
  return (
    <View style={styles.play}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <AppText variant="tiny" faint>Deneme {Math.min(TRIALS, done + 1)}/{TRIALS}</AppText>
          <AppText variant="h2" color={status === 'armed' ? colors.mint : status === 'feedback' ? (lastRt != null && trials[done - 1]?.kind === 'hit' ? colors.mint : colors.red) : colors.textMuted}>{msg}</AppText>
        </View>
        <AppText variant="mono" muted>✓ {trials.filter((t) => t.kind === 'hit').length}</AppText>
      </View>
      <ProgressBar value={done / TRIALS} gradient={gradients.ocean} height={6} />
      <Pads onTap={tap} flash={flash.ear} flashColor={flash.color} />
      <AppText variant="tiny" faint center>Sesi duyunca o tarafa bas. Önce basarsan deneme yanar.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.lg },
  play: { flex: 1, padding: 16, paddingBottom: 32, gap: space.md },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
