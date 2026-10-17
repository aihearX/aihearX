import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentType } from 'react';
import { AppText, Button, Card, Stat, ErrorBoundary } from '@/core/ui';
import { colors, space, type Gradient } from '@/core/theme';
import { GameResult } from '@/core/game';
import { useSettings } from '@/core/store/settings';
import type { MiniAppProps } from '@/core/registry/types';
import type { ArcadeEvent } from '@/arcade/shared/bridge';

export type ArcadeDomProps = {
  onEvent: (e: ArcadeEvent) => Promise<void>;
  seed: number;
  mode: string;
  sounds: boolean;
  dom?: import('expo/dom').DOMProps;
};

type Props = MiniAppProps & {
  Dom: ComponentType<ArcadeDomProps>;
  title: string;
  tagline: string;
  howTo: string[];
  gradient: Gradient;
  makerName: string;
  best: number;
  games: number;
  onSave: (score: number, stats: Record<string, number | string>) => void;
  /** skor → 0-1 oranı (rütbe için) */
  ratioOf: (score: number) => number;
  shareTextOf: (score: number, stats: Record<string, number | string>) => string;
  xp?: number;
  modes?: { id: string; name: string; hint: string }[];
};

/**
 * Arcade kabuğu: giriş → tam ekran Phaser (DOM bileşeni) → sonuç.
 * Oyun motoru WebView'da çalışır; haptik ve sonuç native tarafta işlenir.
 */
export function ArcadeShell({ Dom, title, tagline, howTo, gradient, makerName, best, games, onSave, ratioOf, shareTextOf, xp = 40, modes, onResult }: Props) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [mode, setMode] = useState(modes?.[0]?.id ?? 'normal');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [last, setLast] = useState<{ score: number; stats: Record<string, number | string> } | null>(null);
  const haptics = useSettings((s) => s.haptics);
  const sounds = useSettings((s) => s.sounds);

  const onEvent = useCallback(async (e: ArcadeEvent) => {
    if (e.type === 'haptic') {
      if (!haptics) return;
      if (e.kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      else if (e.kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      else Haptics.impactAsync(e.kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : e.kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }
    if (e.type === 'gameover') {
      setLast({ score: e.score, stats: e.stats });
      onSave(e.score, e.stats);
      onResult({ score: e.score, points: e.score, label: e.label, xp, shareText: shareTextOf(e.score, e.stats) });
      setPhase('result');
      return;
    }
    if (e.type === 'quit') setPhase('intro');
  }, [haptics, onSave, onResult, shareTextOf, xp]);

  const play = () => { setSeed(Math.floor(Math.random() * 1e9)); setPhase('play'); };

  if (phase === 'play') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ErrorBoundary title={`${title} (oyun motoru)`} onReset={() => setPhase('intro')}>
          <Dom onEvent={onEvent} seed={seed} mode={mode} sounds={sounds} dom={{ style: { flex: 1 }, scrollEnabled: false, bounces: false, matchContents: false }} />
        </ErrorBoundary>
        <Pressable onPress={() => setPhase('intro')} style={styles.quit}><Ionicons name="close" size={18} color={colors.text} /></Pressable>
      </View>
    );
  }
  if (phase === 'result' && last) {
    const stats = Object.entries(last.stats).slice(0, 3).map(([k, v]) => ({ label: k, value: v }));
    return <GameResult title={title} score={last.score} ratio={ratioOf(last.score)} best={best} stats={stats} gradient={gradient} shareText={shareTextOf(last.score, last.stats)} makerName={makerName} onReplay={play} />;
  }
  return (
    <View style={{ flex: 1, padding: space.lg, gap: 12 }}>
      <AppText variant="display">{title}</AppText>
      <AppText variant="body" muted>{tagline}</AppText>
      <Card>
        <AppText variant="tiny" faint>Nasıl oynanır?</AppText>
        {howTo.map((h, i) => <AppText key={i} variant="body" style={{ marginTop: 6 }}>{i + 1}. {h}</AppText>)}
      </Card>
      {modes && modes.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {modes.map((m) => <Button key={m.id} title={m.name} size="sm" variant={mode === m.id ? 'primary' : 'secondary'} onPress={() => setMode(m.id)} />)}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat label="Rekor" value={best.toLocaleString('tr-TR')} icon="trophy" color={colors.amber} />
        <Stat label="Oyun" value={games} icon="game-controller" />
      </View>
      <Button title="Oyna" icon="play" size="lg" gradient={gradient} onPress={play} />
      <AppText variant="tiny" faint center>🎧 Kulaklıkla daha iyi. Oyun yüklenirken bir an bekleyebilir.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  quit: { position: 'absolute', top: 10, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
});
