import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card, Chip, ProgressBar, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { Gauge } from './components/Gauge';
import { PermissionCard } from './components/PermissionCard';
import { meteringToSpl, zoneFor, safeExposure, placeFor, SESSION_SECONDS } from './util';

type Phase = 'idle' | 'measuring' | 'done';
type Perm = 'unknown' | 'granted' | 'denied';

export default function App({ onResult }: MiniAppProps) {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 100);
  const [perm, setPerm] = useState<Perm>('unknown');
  const [phase, setPhase] = useState<Phase>('idle');
  const [db, setDb] = useState<number | null>(null);
  const [peak, setPeak] = useState(0);
  const [avg, setAvg] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const samples = useRef<number[]>([]);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;
  const elapsedRef = useRef(0);

  const stop = useCallback(async (finished: boolean) => {
    if (phaseRef.current !== 'measuring') return;
    setBusy(true);
    try { await recorder.stop(); } catch { /* */ }
    try { await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); } catch { /* */ }
    // Kayıt dosyası kullanılmaz; recorder.uri'ye dokunmuyoruz, geçici dosya sistemce temizlenir.
    const list = samples.current;
    const mean = list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0;
    const max = list.length ? Math.max(...list) : 0;
    setAvg(mean); setPeak(max);
    if (finished || list.length >= 20) {
      setPhase('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onResult({ score: mean, label: `${mean} dB`, xp: 15, shareText: shareTextFor(max, mean), meta: { peak: max, avg: mean, seconds: Math.round(elapsedRef.current) } });
    } else {
      setPhase('idle');
    }
    setBusy(false);
  }, [recorder, onResult]);

  const start = useCallback(async () => {
    setBusy(true);
    try {
      const res = await requestRecordingPermissionsAsync();
      if (!res.granted) { setPerm('denied'); setBusy(false); return; }
      setPerm('granted');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      samples.current = [];
      setPeak(0); setAvg(0); setElapsed(0); setDb(null);
      recorder.record();
      setPhase('measuring');
    } catch {
      setPerm((p) => (p === 'granted' ? p : 'denied'));
    }
    setBusy(false);
  }, [recorder]);

  // Her 100 ms'de metering oku
  useEffect(() => {
    if (phase !== 'measuring' || !state.isRecording) return;
    const spl = meteringToSpl(state.metering);
    if (spl == null) return;
    setDb(spl);
    samples.current.push(spl);
    const list = samples.current;
    setPeak((p) => Math.max(p, spl));
    setAvg(Math.round(list.reduce((a, b) => a + b, 0) / list.length));
    const sec = state.durationMillis / 1000;
    elapsedRef.current = sec;
    setElapsed(sec);
    if (sec >= SESSION_SECONDS) stop(true).catch(() => {});
  }, [state.metering, state.durationMillis, state.isRecording, phase, stop]);

  useEffect(() => () => { try { recorder.stop().catch(() => {}); } catch { /* */ } }, [recorder]);

  const zone = db != null ? zoneFor(db) : null;
  const live = phase === 'measuring';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card padded={false} style={{ paddingTop: space.lg, paddingBottom: space.md, alignItems: 'center' }}>
        <Gauge db={phase === 'done' ? avg : db} live={live} />
        {zone && live ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -8 }}>
            <Chip label={zone.name} active color={zone.color} small />
            <AppText variant="small" muted>{placeFor(db ?? 0)} gibi</AppText>
          </View>
        ) : (
          <AppText variant="small" muted style={{ marginTop: -8 }}>{phase === 'done' ? `Ortalama · ${placeFor(avg)} gibi` : 'Ölçüm için başlat'}</AppText>
        )}
      </Card>

      {live ? (
        <View style={{ marginTop: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <AppText variant="small" muted>1 dakikalık ölçüm</AppText>
            <AppText variant="small" muted>{Math.min(SESSION_SECONDS, Math.round(elapsed))} / {SESSION_SECONDS} sn</AppText>
          </View>
          <ProgressBar value={elapsed / SESSION_SECONDS} gradient={gradients.ember} />
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: space.md }}>
        <Stat label="Tepe" value={peak ? `${peak} dB` : '—'} icon="trending-up" color={colors.coral} />
        <Stat label="Ortalama" value={avg ? `${avg} dB` : '—'} icon="analytics" />
        <Stat label="Güvenli süre" value={db != null || avg ? safeExposure(live ? (db ?? 0) : avg) : '—'} icon="time" color={colors.amber} />
      </View>

      {zone && live ? (
        <Card style={{ marginTop: space.md, borderColor: zone.color }}>
          <AppText variant="bodyStrong" color={zone.color}>{zone.name}</AppText>
          <AppText variant="small" muted>{zone.advice}</AppText>
        </Card>
      ) : null}

      {perm === 'denied' ? <View style={{ marginTop: space.lg }}><PermissionCard onRetry={start} /></View> : null}

      {phase === 'idle' ? (
        <Button title="Ölçmeye başla" size="lg" icon="mic" gradient={gradients.ember} loading={busy} style={{ marginTop: space.lg }} onPress={start} />
      ) : null}
      {phase === 'measuring' ? (
        <Button title="Durdur" size="lg" icon="stop" variant="secondary" loading={busy} style={{ marginTop: space.lg }} onPress={() => stop(false)} />
      ) : null}

      {phase === 'done' ? (
        <Animated.View entering={FadeInDown} style={{ marginTop: space.xl }}>
          <ShareCard
            title={`${peak} dB ölçtüm 🎸`}
            subtitle={`Ortalama ${avg} dB · ${placeFor(avg)} gibi · güvenli süre ${safeExposure(avg)}`}
            gradient={gradients.ember}
            shareText={shareTextFor(peak, avg)}
            makerName={SEBAHATTIN.name}
          >
            <AppText variant="small" color="rgba(255,255,255,0.85)">{zoneFor(avg).advice}</AppText>
          </ShareCard>
          <Button title="Yeniden ölç" variant="secondary" icon="refresh" style={{ marginTop: space.md }} onPress={() => { setPhase('idle'); setDb(null); }} />
        </Animated.View>
      ) : null}

      <Card style={{ marginTop: space.lg }}>
        <AppText variant="h3">Bilmen gerekenler</AppText>
        <AppText muted style={{ marginTop: 4 }}>• Ses kaydedilmez, yalnızca seviye ölçülür.{'\n'}• Değerler yaklaşıktır, kalibre değildir; telefon mikrofonu ve kılıf sonucu değiştirir.{'\n'}• 85 dB'de 8 saat güvenli kabul edilir; her +3 dB süreyi yarıya indirir.{'\n'}• Konser sonrası çınlama, kulağın "fazla oldu" demesidir.</AppText>
        <AppText variant="small" faint style={{ marginTop: space.sm }}>Bu uygulama tıbbi tanı yerine geçmez ve profesyonel gürültü ölçümünün yerini tutmaz.</AppText>
      </Card>
    </ScrollView>
  );
}

const shareTextFor = (peak: number, avg: number) => `${placeFor(peak).charAt(0).toLocaleUpperCase('tr') + placeFor(peak).slice(1)} gibi bir yerde ${peak} dB ölçtüm 🎸 (ort. ${avg} dB). Kulağını koru! aihearX`;

const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 32 } });
