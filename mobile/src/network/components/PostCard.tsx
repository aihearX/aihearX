import React, { useState } from 'react';
import { View, Pressable, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { AppText, Avatar, Card, Chip, Audiogram, useToast, pta, degreeLabel } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { roleName } from '@/core/registry/roles';
import { useSettings } from '@/core/store/settings';
import { useUser } from '@/core/store/user';
import type { Post } from '../types';
import { useNetwork } from '../store';
import { useResolveUser, timeAgo, uid } from '../hooks';
import { pushLike, pushComment } from '../api';
import { KindBadge, KIND_META } from './KindBadge';
import { PollView } from './PollView';
import { openUser } from './UserRow';

type Props = { post: Post; index?: number; onAuthor?: (id: string) => void; hideAuthorLink?: boolean };

/** Akış kartı: yazar, metin, vaka odyogramı, anket, etiketler ve eylem satırı. */
export function PostCard({ post, index = 0, onAuthor, hideAuthorLink }: Props) {
  const resolve = useResolveUser();
  const author = resolve(post.authorId);
  const me = useUser((s) => s.profile);
  const haptics = useSettings((s) => s.haptics);
  const calm = useSettings((s) => s.calmMode);
  const toast = useToast((s) => s.show);
  const toggleLike = useNetwork((s) => s.toggleLike);
  const addComment = useNetwork((s) => s.addComment);
  const vote = useNetwork((s) => s.vote);
  const myVote = useNetwork((s) => s.pollVotes[post.id]);
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const heart = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }));

  const like = () => {
    const next = toggleLike(post.id, post.likedByMe);
    if (!calm) heart.value = withSequence(withSpring(next ? 1.45 : 0.85, { damping: 6 }), withSpring(1, { damping: 10 }));
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (me) pushLike(me.id, post.id, next).catch(() => {});
  };
  const share = async () => {
    await Clipboard.setStringAsync(`${post.text}\n\n— ${author?.name ?? 'aihearX'} · aihearX Ağ`);
    toast('Metin kopyalandı', 'copy');
  };
  const send = () => {
    const text = draft.trim();
    if (!text || !me) return;
    const c = { id: uid('c'), authorId: me.id, text, createdAt: new Date().toISOString() };
    addComment(post.id, c);
    pushComment(post.id, c).catch(() => {});
    setDraft('');
    toast('Yorum eklendi', 'chatbubble');
  };
  const goAuthor = () => {
    if (hideAuthorLink) return;
    (onAuthor ?? openUser)(post.authorId);
  };

  const ptaR = post.caseData?.audiogram.right ? pta(post.caseData.audiogram.right.ac) : null;
  const ptaL = post.caseData?.audiogram.left ? pta(post.caseData.audiogram.left.ac) : null;
  const meta = KIND_META[post.kind];

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(320)}>
      <Card style={styles.card}>
        {/* yazar satırı */}
        <View style={styles.head}>
          <Pressable onPress={goAuthor} style={styles.authorRow} disabled={hideAuthorLink}>
            <Avatar name={author?.name ?? '?'} seed={post.authorId} size={42} />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <AppText variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{author?.name ?? 'Bilinmeyen'}</AppText>
                {author?.verified ? <Ionicons name="checkmark-circle" size={15} color={colors.accent2} /> : null}
                <AppText variant="tiny" faint>· {timeAgo(post.createdAt)}</AppText>
              </View>
              <View style={styles.nameRow}>
                {author ? <Chip label={roleName(author.role)} small /> : null}
                <KindBadge kind={post.kind} />
              </View>
            </View>
          </Pressable>
          {post.imageHint ? <AppText style={{ fontSize: 26 }}>{post.imageHint}</AppText> : null}
        </View>

        {/* metin */}
        <AppText variant="body" style={{ marginTop: 10 }}>{post.text}</AppText>

        {/* vaka odyogramı */}
        {post.caseData ? (
          <View style={styles.caseBox}>
            <View style={styles.caseHead}>
              <Ionicons name="pulse" size={14} color={meta.color} />
              <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={2}>{post.caseData.history}</AppText>
            </View>
            <Audiogram data={post.caseData.audiogram} width={Math.max(240, width - space.lg * 2 - space.lg * 2)} height={176} compact />
            <View style={styles.ptaRow}>
              {ptaR != null ? <AppText variant="tiny" color={colors.earRight}>Sağ SSO {ptaR} dB · {degreeLabel(ptaR)}</AppText> : null}
              {ptaL != null ? <AppText variant="tiny" color={colors.earLeft}>Sol SSO {ptaL} dB · {degreeLabel(ptaL)}</AppText> : null}
            </View>
            <AppText variant="tiny" faint>Eğitim amaçlı paylaşım; tanı yerine geçmez.</AppText>
          </View>
        ) : null}

        {/* anket */}
        {post.poll ? <PollView poll={post.poll} myVote={myVote} onVote={(i) => { vote(post.id, i); if (haptics) Haptics.selectionAsync().catch(() => {}); }} /> : null}

        {/* etiketler */}
        {post.tags.length ? (
          <View style={styles.tags}>
            {post.tags.map((t) => <AppText key={t} variant="small" color={colors.accent2}>#{t.replace(/\s+/g, '')}</AppText>)}
          </View>
        ) : null}

        {/* eylemler */}
        <View style={styles.actions}>
          <Pressable onPress={like} style={styles.action} hitSlop={6}>
            <Animated.View style={heartStyle}>
              <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={20} color={post.likedByMe ? colors.coral : colors.textMuted} />
            </Animated.View>
            <AppText variant="small" color={post.likedByMe ? colors.coral : colors.textMuted}>{post.likes}</AppText>
          </Pressable>
          <Pressable onPress={() => setOpen((o) => !o)} style={styles.action} hitSlop={6}>
            <Ionicons name={open ? 'chatbubble' : 'chatbubble-outline'} size={19} color={open ? colors.accent2 : colors.textMuted} />
            <AppText variant="small" color={open ? colors.accent2 : colors.textMuted}>{post.comments.length}</AppText>
          </Pressable>
          <Pressable onPress={share} style={styles.action} hitSlop={6}>
            <Ionicons name="share-outline" size={19} color={colors.textMuted} />
            <AppText variant="small" muted>Paylaş</AppText>
          </Pressable>
        </View>

        {/* yorumlar */}
        {open ? (
          <View style={styles.comments}>
            {post.comments.length === 0 ? <AppText variant="small" faint>İlk yorumu sen yaz.</AppText> : null}
            {post.comments.map((c) => {
              const u = resolve(c.authorId);
              return (
                <View key={c.id} style={styles.comment}>
                  <Pressable onPress={() => openUser(c.authorId)}><Avatar name={u?.name ?? '?'} seed={c.authorId} size={28} /></Pressable>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <AppText variant="small" style={{ fontWeight: '700' }}>{u?.name ?? 'Kullanıcı'}</AppText>
                      <AppText variant="tiny" faint>· {timeAgo(c.createdAt)}</AppText>
                    </View>
                    <AppText variant="small" muted>{c.text}</AppText>
                  </View>
                </View>
              );
            })}
            <View style={styles.composer}>
              <TextInput value={draft} onChangeText={setDraft} placeholder="Yorum yaz…" placeholderTextColor={colors.textFaint} style={styles.input} multiline maxLength={400} />
              <Pressable onPress={send} disabled={!draft.trim()} style={[styles.send, !draft.trim() && { opacity: 0.4 }]}>
                <Ionicons name="send" size={16} color={colors.white} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  authorRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  caseBox: { marginTop: 12, padding: 10, borderRadius: radius.md, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, gap: 6 },
  caseHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ptaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 22, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  comments: { marginTop: 12, gap: 10 },
  comment: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, color: colors.text, fontSize: 14, minHeight: 40, maxHeight: 100, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
