import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { compute, FREQS, TRANSDUCER_LABEL, type Inputs } from '../logic';
import { Stepper } from './Stepper';

const DEFAULT: Inputs = { freq: 1000, transducer: 'supra', test: 'AC', acTest: 60, bcTest: 10, acNon: 15, bcNon: 10 };

export function Calculator({ onSave }: { onSave: (label: string) => void }) {
  const [inp, setInp] = useState<Inputs>(DEFAULT);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const r = useMemo(() => compute(inp), [inp]);
  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => { setInp((p) => ({ ...p, [k]: v })); setSaved(false); };

  return (
    <View style={{ gap: space.md }}>
      <Animated.View entering={FadeInDown}>
        <Card>
          <AppText variant="tiny" color={colors.accent2}>AYARLAR</AppText>
          <View style={styles.chips}>
            <Chip label="Hava yolu (AC)" active={inp.test === 'AC'} onPress={() => set('test', 'AC')} color={colors.accent} />
            <Chip label="Kemik yolu (BC)" active={inp.test === 'BC'} onPress={() => set('test', 'BC')} color={colors.accent} />
          </View>
          <View style={styles.chips}>
            <Chip label="Supra-aural · IA 40" active={inp.transducer === 'supra'} onPress={() => set('transducer', 'supra')} color={colors.accent2} small />
            <Chip label="Insert · IA 55" active={inp.transducer === 'insert'} onPress={() => set('transducer', 'insert')} color={colors.accent2} small />
          </View>
          <View style={styles.chips}>
            {FREQS.map((f) => <Chip key={f} label={f >= 1000 ? `${f / 1000}k` : `${f}`} active={inp.freq === f} onPress={() => set('freq', f)} small />)}
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60)}>
        <Card>
          <AppText variant="tiny" color={colors.earRight}>TEST KULAĞI</AppText>
          <Stepper label="Hava yolu eşiği" value={inp.acTest} onChange={(v) => set('acTest', v)} color={colors.earRight} />
          <Stepper label="Kemik yolu eşiği" value={inp.bcTest} max={80} onChange={(v) => set('bcTest', v)} color={colors.earRight} />
          <View style={styles.divider} />
          <AppText variant="tiny" color={colors.earLeft}>TEST DIŞI KULAK</AppText>
          <Stepper label="Hava yolu eşiği" value={inp.acNon} onChange={(v) => set('acNon', v)} color={colors.earLeft} />
          <Stepper label="Kemik yolu eşiği" value={inp.bcNon} max={80} onChange={(v) => set('bcNon', v)} color={colors.earLeft} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120)} layout={LinearTransition.springify()}>
        <Card gradient={r.needed ? (r.dilemma ? gradients.ember : gradients.mint) : gradients.night}>
          <View style={styles.resultHead}>
            <Ionicons name={r.needed ? (r.dilemma ? 'warning' : 'shield-checkmark') : 'checkmark-circle'} size={22} color={colors.white} />
            <AppText variant="h2" color={colors.white}>{r.needed ? (r.dilemma ? 'Maskeleme ikilemi!' : 'Maskeleme gerekli') : 'Maskeleme gerekmez'}</AppText>
          </View>
          <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: 6 }}>{r.reason}</AppText>
          {r.needed ? (
            <View style={styles.numbers}>
              <View style={styles.numBox}><AppText variant="tiny" color="rgba(255,255,255,0.75)">BAŞLANGIÇ</AppText><AppText variant="h1" color={colors.white}>{r.initial}</AppText><AppText variant="tiny" color="rgba(255,255,255,0.75)">dB EM</AppText></View>
              <View style={styles.numBox}><AppText variant="tiny" color="rgba(255,255,255,0.75)">MAKSİMUM</AppText><AppText variant="h1" color={colors.white}>{r.max}</AppText><AppText variant="tiny" color="rgba(255,255,255,0.75)">dB EM</AppText></View>
              <View style={styles.numBox}><AppText variant="tiny" color="rgba(255,255,255,0.75)">PLATO ARALIĞI</AppText><AppText variant="h1" color={colors.white}>{Math.max(0, r.max - r.initial)}</AppText><AppText variant="tiny" color="rgba(255,255,255,0.75)">dB</AppText></View>
            </View>
          ) : null}
          {r.needed && r.dilemma ? (
            <AppText variant="small" color={colors.white} style={{ marginTop: space.sm }}>Gereken en düşük maske, izin verilen en yüksek maskeyi aşıyor. Çözüm: insert kulaklık (daha yüksek IA), SAL testi veya Weber ile yorumlama.</AppText>
          ) : r.needed && r.overmaskRisk ? (
            <AppText variant="small" color={colors.white} style={{ marginTop: space.sm }}>Aşırı maskeleme uyarısı: plato dar ({Math.max(0, r.max - r.initial)} dB). {r.max} dB EM üzerine çıkma; eşik 5 dB artınca maskeyi de artırırken üst sınırı izle.</AppText>
          ) : r.needed ? (
            <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: space.sm }}>Plato yöntemi: {r.initial} dB EM ile başla, eşik değişmeden maske 3 adım (15 dB) artırılabiliyorsa gerçek eşiktir.</AppText>
          ) : null}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180)}>
        <Card padded={false}>
          <Pressable onPress={() => setOpen((o) => !o)} style={styles.expandHead}>
            <Ionicons name="bulb" size={18} color={colors.amber} />
            <AppText variant="bodyStrong" style={{ flex: 1 }}>Nasıl hesaplandı?</AppText>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>
          {open ? (
            <Animated.View entering={FadeInDown} style={styles.expandBody}>
              {r.steps.map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepDot}><AppText variant="tiny" color={colors.white}>{i + 1}</AppText></View>
                  <AppText variant="small" muted style={{ flex: 1 }}>{s}</AppText>
                </View>
              ))}
              <AppText variant="small" faint style={{ marginTop: space.sm }}>
                Varsayımlar: IA {TRANSDUCER_LABEL[inp.transducer]} için {r.ia} dB sabit alınmıştır (gerçekte frekansa göre 40-80 dB arasında değişir). Hood plato yöntemi, basitleştirilmiş eğitim modeli; klinik protokolünüz farklı güvenlik payı kullanabilir.
              </AppText>
            </Animated.View>
          ) : null}
        </Card>
      </Animated.View>

      <Button title={saved ? 'Kaydedildi' : 'Hesaplamayı Tamamla'} icon={saved ? 'checkmark' : 'save'} disabled={saved} onPress={() => { setSaved(true); onSave(`${inp.test} ${inp.freq} Hz · ${r.needed ? `başlangıç ${r.initial} dB` : 'maske gerekmez'}`); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.sm },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  numbers: { flexDirection: 'row', gap: 8, marginTop: space.md },
  numBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: radius.md, padding: 10, alignItems: 'center' },
  expandHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.lg },
  expandBody: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: 8 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
