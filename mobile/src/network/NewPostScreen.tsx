import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, ScrollView, Switch, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Card, Chip, Button, Audiogram, AUDIOGRAM_FREQS, useToast, Avatar } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { useUser } from '@/core/store/user';
import type { Post, PostKind } from './types';
import { KIND_LABEL } from './types';
import { useNetwork } from './store';
import { pushPost } from './api';
import { uid } from './hooks';
import { KIND_META } from './components/KindBadge';

const KINDS: PostKind[] = ['gonderi', 'vaka', 'soru', 'ilan', 'etkinlik'];
const DEFAULT_DB = 20;
const PLACEHOLDER: Record<PostKind, string> = {
  gonderi: 'Ne düşünüyorsun? Klinikten bir not, bir gözlem, bir espri…',
  vaka: 'Kısa vaka öyküsü: yaş, cinsiyet, şikayet, bulgular. Kimlik bilgisi paylaşma.',
  soru: 'Sorunu açık yaz; etiketler doğru kişilere ulaştırır.',
  ilan: 'Pozisyon, kurum, şehir, çalışma şekli ve başvuru yolu.',
  etkinlik: 'Etkinlik adı, tarih, yer/online ve kayıt bilgisi.',
  basari: 'Neyi kutluyoruz?',
};

/** Yeni gönderi (modal): tür, metin, etiketler; vaka için odyogram, soru için anket. */
export function NewPostScreen() {
  const profile = useUser((s) => s.profile);
  const addPost = useNetwork((s) => s.addPost);
  const toast = useToast((s) => s.show);
  const { width } = useWindowDimensions();
  const [kind, setKind] = useState<PostKind>('gonderi');
  const [text, setText] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [withAudiogram, setWithAudiogram] = useState(false);
  const [right, setRight] = useState<number[]>(AUDIOGRAM_FREQS.map(() => DEFAULT_DB));
  const [left, setLeft] = useState<number[]>(AUDIOGRAM_FREQS.map(() => DEFAULT_DB));
  const [withPoll, setWithPoll] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '']);

  const tags = useMemo(() => Array.from(new Set(tagsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))).slice(0, 6), [tagsRaw]);
  const pollOptions = options.map((o) => o.trim()).filter(Boolean);
  const canShare = text.trim().length >= 3 && (!withPoll || kind !== 'soru' || pollOptions.length >= 2);

  const step = (ear: 'right' | 'left', i: number, delta: number) => {
    const set = ear === 'right' ? setRight : setLeft;
    set((arr) => arr.map((v, j) => (j === i ? Math.max(-10, Math.min(120, v + delta)) : v)));
  };

  const share = () => {
    if (!profile || !canShare) return;
    const post: Post = {
      id: uid('p'),
      authorId: profile.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      kind,
      tags,
      likes: 0,
      comments: [],
      likedByMe: false,
      caseData: kind === 'vaka' && withAudiogram ? { history: text.trim().slice(0, 80), audiogram: { right: { ac: right }, left: { ac: left } } } : undefined,
      poll: kind === 'soru' && withPoll && pollOptions.length >= 2 ? { options: pollOptions.slice(0, 4), votes: pollOptions.slice(0, 4).map(() => 0) } : undefined,
    };
    addPost(post);
    pushPost(post).catch(() => {});
    toast('Paylaşıldı', 'checkmark-circle');
    router.back();
  };

  const agWidth = Math.max(240, width - space.lg * 2 - space.lg * 2);

  return (
    <Screen scroll={false} padded={false} contentStyle={{ paddingBottom: 0 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
          <AppText variant="h2" style={{ flex: 1 }}>Yeni gönderi</AppText>
          <Button title="Paylaş" icon="paper-plane" size="sm" onPress={share} disabled={!canShare} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120, gap: 12 }}>
          {profile ? (
            <View style={styles.me}>
              <Avatar name={profile.name} seed={profile.id} size={36} />
              <View>
                <AppText variant="bodyStrong">{profile.name}</AppText>
                <AppText variant="tiny" faint>@{profile.handle} · herkese açık</AppText>
              </View>
            </View>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {KINDS.map((k) => <Chip key={k} label={KIND_LABEL[k]} icon={KIND_META[k].icon} color={KIND_META[k].color} active={kind === k} onPress={() => setKind(k)} />)}
          </ScrollView>

          <TextInput value={text} onChangeText={setText} placeholder={PLACEHOLDER[kind]} placeholderTextColor={colors.textFaint} style={styles.textarea} multiline maxLength={1200} autoFocus textAlignVertical="top" />
          <AppText variant="tiny" faint style={{ alignSelf: 'flex-end' }}>{text.length}/1200</AppText>

          <View>
            <AppText variant="small" muted style={{ marginBottom: 6 }}>Etiketler (virgülle ayır)</AppText>
            <TextInput value={tagsRaw} onChangeText={setTagsRaw} placeholder="maskeleme, pediatrik, fitting" placeholderTextColor={colors.textFaint} style={styles.input} autoCapitalize="none" autoCorrect={false} />
            {tags.length ? <View style={styles.tags}>{tags.map((t) => <Chip key={t} label={`#${t}`} small />)}</View> : null}
          </View>

          {kind === 'vaka' ? (
            <Animated.View entering={FadeInDown.duration(260)}>
              <Card style={{ gap: 10 }}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">Hızlı odyogram</AppText>
                    <AppText variant="small" muted>6 frekans × 2 kulak, 10 dB adımlar</AppText>
                  </View>
                  <Switch value={withAudiogram} onValueChange={setWithAudiogram} trackColor={{ true: colors.accent, false: colors.surfaceStrong }} />
                </View>
                {withAudiogram ? (
                  <>
                    <View style={styles.gridHead}>
                      <AppText variant="tiny" faint style={{ width: 44 }}>Hz</AppText>
                      <AppText variant="tiny" color={colors.earRight} style={{ flex: 1 }} center>Sağ (O)</AppText>
                      <AppText variant="tiny" color={colors.earLeft} style={{ flex: 1 }} center>Sol (X)</AppText>
                    </View>
                    {AUDIOGRAM_FREQS.map((f, i) => (
                      <View key={f} style={styles.gridRow}>
                        <AppText variant="mono" muted style={{ width: 44 }}>{f >= 1000 ? `${f / 1000}k` : f}</AppText>
                        <Stepper value={right[i] ?? DEFAULT_DB} color={colors.earRight} onMinus={() => step('right', i, -10)} onPlus={() => step('right', i, 10)} />
                        <Stepper value={left[i] ?? DEFAULT_DB} color={colors.earLeft} onMinus={() => step('left', i, -10)} onPlus={() => step('left', i, 10)} />
                      </View>
                    ))}
                    <View style={{ alignItems: 'center', marginTop: 4 }}>
                      <Audiogram data={{ right: { ac: right }, left: { ac: left } }} width={agWidth} height={190} compact />
                    </View>
                    <AppText variant="tiny" faint>Hasta kimliği paylaşma; eğitim amaçlı vaka.</AppText>
                  </>
                ) : null}
              </Card>
            </Animated.View>
          ) : null}

          {kind === 'soru' ? (
            <Animated.View entering={FadeInDown.duration(260)}>
              <Card style={{ gap: 10 }}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">Anket</AppText>
                    <AppText variant="small" muted>2-4 seçenek</AppText>
                  </View>
                  <Switch value={withPoll} onValueChange={setWithPoll} trackColor={{ true: colors.accent, false: colors.surfaceStrong }} />
                </View>
                {withPoll ? (
                  <>
                    {options.map((o, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TextInput value={o} onChangeText={(v) => setOptions((arr) => arr.map((x, j) => (j === i ? v : x)))} placeholder={`Seçenek ${i + 1}`} placeholderTextColor={colors.textFaint} style={[styles.input, { flex: 1 }]} maxLength={60} />
                        {options.length > 2 ? (
                          <Pressable onPress={() => setOptions((arr) => arr.filter((_, j) => j !== i))} hitSlop={8}><Ionicons name="remove-circle-outline" size={22} color={colors.textMuted} /></Pressable>
                        ) : null}
                      </View>
                    ))}
                    {options.length < 4 ? <Button title="Seçenek ekle" icon="add" variant="ghost" size="sm" onPress={() => setOptions((arr) => [...arr, ''])} /> : null}
                  </>
                ) : null}
              </Card>
            </Animated.View>
          ) : null}

          <AppText variant="tiny" faint center style={{ marginTop: 8 }}>Tıbbi içerikte ölçülü ol; paylaşımlar tanı yerine geçmez.</AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Stepper({ value, color, onMinus, onPlus }: { value: number; color: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onMinus} hitSlop={6} style={styles.stepBtn}><Ionicons name="remove" size={16} color={colors.text} /></Pressable>
      <AppText variant="mono" color={color} style={{ width: 34, textAlign: 'center' }}>{value}</AppText>
      <Pressable onPress={onPlus} hitSlop={6} style={styles.stepBtn}><Ionicons name="add" size={16} color={colors.text} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textarea: { minHeight: 130, color: colors.text, fontSize: 16, lineHeight: 23, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { color: colors.text, fontSize: 15, height: 44, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gridHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 4 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
});
