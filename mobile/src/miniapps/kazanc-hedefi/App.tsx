import React, { useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Audiogram, Button, Card, Chip, degreeLabel, pta } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { FORMULAS, PRESETS, patientText, targetGain, type Ear, type Formula, type Thresholds } from './logic';
import { GainChart } from './components/GainChart';
import { ThresholdEditor } from './components/ThresholdEditor';

export default function App({ onResult, role }: MiniAppProps) {
  const { width } = useWindowDimensions();
  const w = Math.min(width - 4 * space.lg, 360);
  const [right, setRight] = useState<Thresholds>(PRESETS[1]!.right);
  const [left, setLeft] = useState<Thresholds>(PRESETS[1]!.left);
  const [ear, setEar] = useState<Ear>('right');
  const [formula, setFormula] = useState<Formula>('pogo');
  const [preset, setPreset] = useState<string | null>('presbi');
  const [shown, setShown] = useState(false);
  const [saved, setSaved] = useState(false);

  const gainR = useMemo(() => targetGain(right, formula), [right, formula]);
  const gainL = useMemo(() => targetGain(left, formula), [left, formula]);
  const ptaR = pta(right), ptaL = pta(left);
  const f = FORMULAS.find((x) => x.id === formula)!;

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setRight(p.right); setLeft(p.left); setPreset(id); setSaved(false);
  };
  const edit = (v: Thresholds) => { (ear === 'right' ? setRight : setLeft)(v); setPreset(null); setSaved(false); };
  const compute = () => {
    setShown(true);
    if (!saved) {
      setSaved(true);
      onResult({ label: `${f.name} · Sağ PTA ${ptaR ?? '-'} / Sol PTA ${ptaL ?? '-'}`, xp: 20, points: 10, meta: { formula, ptaR, ptaL } });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.sunset}>
          <AppText variant="tiny" color="rgba(255,255,255,0.8)">EĞİTİM AMAÇLI YAKLAŞIK HEDEF</AppText>
          <AppText variant="h2" color={colors.white} style={{ marginTop: 4 }}>Eşikten hedef kazanca</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.88)" style={{ marginTop: 4 }}>Gerçek uygulama NAL-NL2 / DSL v5 reçetesi ve gerçek kulak ölçümü (REM) ile yapılır.</AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60)}>
        <Card style={{ marginTop: space.md }}>
          <AppText variant="tiny" color={colors.accent2}>HAZIR PROFİL</AppText>
          <View style={styles.chips}>
            {PRESETS.map((p) => <Chip key={p.id} label={p.name} small active={preset === p.id} onPress={() => applyPreset(p.id)} color={colors.accent} />)}
          </View>
          <View style={[styles.chips, { marginTop: space.md }]}>
            <Chip label="Sağ kulak" active={ear === 'right'} onPress={() => setEar('right')} color={colors.earRight} />
            <Chip label="Sol kulak" active={ear === 'left'} onPress={() => setEar('left')} color={colors.earLeft} />
            <View style={{ flex: 1 }} />
            <AppText variant="small" muted>PTA {ear === 'right' ? ptaR : ptaL} dB</AppText>
          </View>
          <ThresholdEditor values={ear === 'right' ? right : left} color={ear === 'right' ? colors.earRight : colors.earLeft} onChange={edit} />
          <AppText variant="small" faint style={{ marginTop: 6 }}>Sağ: {degreeLabel(ptaR)} · Sol: {degreeLabel(ptaL)}</AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100)}>
        <Card style={{ marginTop: space.md, alignItems: 'center' }}>
          <Audiogram data={{ right: { ac: right }, left: { ac: left } }} width={w} height={Math.round(w * 0.7)} showBone={false} speechBanana compact />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140)}>
        <Card style={{ marginTop: space.md }}>
          <AppText variant="tiny" color={colors.accent2}>FORMÜL</AppText>
          <View style={styles.chips}>
            {FORMULAS.map((x) => <Chip key={x.id} label={x.name} small active={formula === x.id} onPress={() => { setFormula(x.id); setSaved(false); }} color={colors.accent} />)}
          </View>
          <AppText variant="small" muted style={{ marginTop: 8 }}>{f.desc}</AppText>
        </Card>
      </Animated.View>

      <View style={{ marginTop: space.md }}>
        <Button title={shown ? 'Hedefi Güncelle' : 'Hedefi Hesapla'} icon="stats-chart" size="lg" onPress={compute} />
      </View>

      {shown ? (
        <Animated.View key={`${formula}-${right.join()}-${left.join()}`} entering={FadeIn.duration(300)} style={{ gap: space.md, marginTop: space.md }}>
          <Card style={{ alignItems: 'center' }}>
            <View style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: colors.earRight }]} /><AppText variant="small" muted>Sağ</AppText>
              <View style={[styles.dot, { backgroundColor: colors.earLeft, marginLeft: 10 }]} /><AppText variant="small" muted>Sol</AppText>
              <View style={{ flex: 1 }} />
              <AppText variant="small" color={colors.accent2}>{f.name} hedef insertion gain</AppText>
            </View>
            <GainChart right={gainR} left={gainL} width={w} height={Math.round(w * 0.6)} />
          </Card>
          <Card>
            <AppText variant="tiny" faint>FREKANS BAŞINA HEDEF (dB)</AppText>
            <View style={styles.table}>
              <View style={styles.tr}><AppText variant="tiny" faint style={styles.td}> </AppText>{[250, 500, '1k', '2k', '4k', '8k'].map((x) => <AppText key={x} variant="tiny" faint style={styles.td}>{x}</AppText>)}</View>
              <View style={styles.tr}><AppText variant="small" color={colors.earRight} style={styles.td}>Sağ</AppText>{gainR.map((g, i) => <AppText key={i} variant="mono" style={styles.td}>{g}</AppText>)}</View>
              <View style={styles.tr}><AppText variant="small" color={colors.earLeft} style={styles.td}>Sol</AppText>{gainL.map((g, i) => <AppText key={i} variant="mono" style={styles.td}>{g}</AppText>)}</View>
            </View>
          </Card>
          <Card style={{ borderColor: colors.accent2 }}>
            <View style={styles.legend}>
              <Ionicons name="chatbox-ellipses" size={16} color={colors.accent2} />
              <AppText variant="bodyStrong" color={colors.accent2}>{role === 'hasta' || role === 'aile' ? 'Sizin için özet' : 'Hastaya anlatım'}</AppText>
            </View>
            <AppText variant="body" style={{ marginTop: 6 }}>{patientText(ptaR, ptaL, gainR, gainL)}</AppText>
          </Card>
          <Card>
            <AppText variant="small" faint>Bu hedef, basitleştirilmiş eğitim formüllerinin (yarım kazanç, POGO, NAL-R) yaklaşık sonucudur; giriş seviyesine göre kompresyon, MPO/UCL sınırı ve kulak kanalı akustiğini (RECD/REM) içermez. Tanı ve cihaz uygulaması yerine geçmez.</AppText>
          </Card>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.sm, alignItems: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'stretch' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  table: { marginTop: 8, gap: 6 },
  tr: { flexDirection: 'row' },
  td: { flex: 1, textAlign: 'center' },
});
