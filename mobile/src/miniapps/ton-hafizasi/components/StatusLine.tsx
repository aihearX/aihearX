import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, Chip } from '@/core/ui';
import { colors } from '@/core/theme';
import type { RoundInfo } from '../logic';
import type { SongProgress, Turn } from '../useTonGame';

type Props = { turn: Turn; info: RoundInfo; round: number; progress: number; quip: string; song: SongProgress };

/** Tur durumu: dinle / sıra sende; sessiz ve karışık rozetleri; gizli ezgide cümle ilerlemesi; yanlışta espri. */
export function StatusLine({ turn, info, round, progress, quip, song }: Props) {
  const text = quip
    ? quip
    : turn === 'listen' ? (info.silent ? 'Sadece dinle, ışık yok' : 'Dinle…')
    : turn === 'input' ? (info.shuffled ? "Sıra sende · pad'ler yer değiştirdi" : 'Sıra sende')
    : turn === 'reveal' ? 'Cümle tamam ♪' : ' ';
  const icon = quip ? 'chatbubble-ellipses' : turn === 'listen' ? 'ear' : turn === 'input' ? 'hand-left' : 'musical-notes';
  const color = quip ? colors.coral : turn === 'input' ? colors.mint : colors.accent;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText variant="h3" muted>{song ? `Gizli ezgi · ${song.notes}/${song.total} nota` : `${round}. tur`}</AppText>
        {song ? <Chip label={`Cümle ${Math.min(song.phrase + 1, song.phrases)}/${song.phrases}`} icon="musical-note" small /> : null}
        {info.silent ? <Chip label="Sessiz" icon="eye-off" small active color={colors.accent2} /> : null}
        {info.shuffled ? <Chip label="Karışık" icon="shuffle" small active color={colors.coral} /> : null}
      </View>
      <Animated.View key={text} entering={FadeIn.duration(150)} style={styles.row}>
        {turn !== 'wait' || quip ? <Ionicons name={icon} size={18} color={color} /> : null}
        <AppText variant="bodyStrong" color={color} numberOfLines={1} style={{ flex: 1 }}>{text}</AppText>
      </Animated.View>
      {turn === 'input' ? (
        <View style={styles.dots}>
          {Array.from({ length: round }).map((_, i) => <View key={i} style={[styles.dot, i < progress && styles.dotOn]} />)}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 8, gap: 4, minHeight: 72 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotOn: { backgroundColor: colors.mint },
});
