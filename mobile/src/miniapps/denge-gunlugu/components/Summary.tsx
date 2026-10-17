import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppText, Card, SectionHeader, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import { useDiary, summarize } from '../store';

export function Summary() {
  const episodes = useDiary((s) => s.episodes);
  const s = useMemo(() => summarize(episodes, 30), [episodes]);
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat label="Atak / 30 gün" value={s.count} icon="calendar" />
        <Stat label="Ort. şiddet" value={s.count ? `${s.meanSeverity}/10` : '—'} icon="speedometer" color={colors.amber} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Stat label="En sık tetikleyici" value={s.topTrigger ?? '—'} icon="flash" color={colors.coral} />
        <Stat label="En sık eşlik eden" value={s.topAccompanying ?? '—'} icon="ear" color={colors.accent2} />
      </View>

      <SectionHeader title="Örüntü ipuçları" subtitle="Tanı değil; hekiminle konuşmak için başlıklar" />
      {s.hints.length ? (
        <View style={{ gap: 8 }}>
          {s.hints.map((h) => (
            <Card key={h} style={{ borderColor: 'rgba(255,194,92,0.4)' }}>
              <AppText>💡 {h}</AppText>
            </Card>
          ))}
        </View>
      ) : (
        <Card><AppText muted>{s.count ? 'Henüz belirgin bir örüntü yok. Kayıt arttıkça ipuçları burada belirir.' : 'Son 30 günde kayıt yok.'}</AppText></Card>
      )}

      <SectionHeader title="Klinisyen özeti" subtitle="Muayenede göster ya da mesajla gönder" />
      <ShareCard
        title={`${s.count} atak / 30 gün`}
        subtitle={s.count ? `Ort. şiddet ${s.meanSeverity}/10${s.topTrigger ? ` · en sık: ${s.topTrigger}` : ''}` : 'Kayıt yok'}
        gradient={gradients.ocean}
        shareText={s.text}
        footer="aihearX Denge Günlüğü"
        makerName={SEBAHATTIN.name}
      >
        {Object.keys(s.typeCounts).length ? (
          <AppText variant="small" color="rgba(255,255,255,0.9)">{Object.entries(s.typeCounts).map(([k, v]) => `${k} ×${v}`).join(' · ')}</AppText>
        ) : null}
        {s.hints[0] ? <AppText variant="small" color="rgba(255,255,255,0.8)" style={{ marginTop: 6 }}>{s.hints[0]}</AppText> : null}
      </ShareCard>
      <AppText variant="small" faint center style={{ marginTop: space.md }}>"Metni Kopyala" ile son kayıtların satır satır panoya gelir. Bu uygulama tıbbi tanı yerine geçmez.</AppText>
    </View>
  );
}
