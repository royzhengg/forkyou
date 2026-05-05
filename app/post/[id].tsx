import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Svg, Path, Circle, Line, Polyline } from 'react-native-svg'
import { imgColors } from '@/constants/Colors'
import { useThemeColors } from '@/lib/ThemeContext'
import { usePosts } from '@/lib/PostsContext'
import { useAuthGate } from '@/lib/AuthGateContext'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

type CommentRow = {
  id: string
  content: string
  created_at: string
  users: { username: string; full_name: string | null } | null
}

const AVATAR_PALETTES = [
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#F1EEFE', color: '#534AB7' },
  { bg: '#F2F2EF', color: '#4A4A45' },
]

function paletteFor(username: string) {
  return AVATAR_PALETTES[username.charCodeAt(0) % AVATAR_PALETTES.length]
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

function ChevronLeft() {
  const colors = useThemeColors()
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  )
}

function DotsIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round">
      <Circle cx={12} cy={5} r={1} fill={colors.text2} stroke="none" />
      <Circle cx={12} cy={12} r={1} fill={colors.text2} stroke="none" />
      <Circle cx={12} cy={19} r={1} fill={colors.text2} stroke="none" />
    </Svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  const colors = useThemeColors()
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill={filled ? colors.liked : 'none'} stroke={filled ? colors.liked : colors.text2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  )
}

function CommentIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  const colors = useThemeColors()
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill={filled ? colors.text : 'none'} stroke={filled ? colors.text : colors.text2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  )
}

function ShareIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={18} cy={5} r={3} />
      <Circle cx={6} cy={12} r={3} />
      <Circle cx={18} cy={19} r={3} />
      <Line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
      <Line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
    </Svg>
  )
}

function PinIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={colors.text3} strokeWidth={1.5} strokeLinecap="round">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx={12} cy={10} r={3} />
    </Svg>
  )
}

function SendIcon({ active }: { active: boolean }) {
  const colors = useThemeColors()
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={active ? colors.text : colors.text3} strokeWidth={1.5} strokeLinecap="round">
      <Line x1={22} y1={2} x2={11} y2={13} />
      <Path d="M22 2L15 22 11 13 2 9l20-7z" />
    </Svg>
  )
}

function ImagePlaceholder() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth={0.8} strokeLinecap="round">
      <Path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <Circle cx={8.5} cy={8.5} r={1.5} />
      <Path d="M21 15l-5-5L5 21" />
    </Svg>
  )
}

function Stars({ count, max = 5, styles }: { count: number; max?: number; styles: any }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: max }).map((_, i) => (
        <Text key={i} style={[styles.star, i < count && styles.starOn]}>★</Text>
      ))}
    </View>
  )
}

function Dollars({ count, styles }: { count: number; styles: any }) {
  return (
    <View style={styles.starsRow}>
      {[1,2,3,4].map((_, i) => (
        <Text key={i} style={[styles.dollar, i < count && styles.dollarOn]}>$</Text>
      ))}
    </View>
  )
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { posts } = usePosts()
  const { requireAuth } = useAuthGate()
  const { user } = useAuth()
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const post = posts.find(p => p.id === Number(id))

  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const commentInputRef = useRef<TextInput>(null)
  const scrollRef = useRef<any>(null)

  const loadSocialState = useCallback(async () => {
    if (!post?.dbId) return
    const dbId = post.dbId

    const [countRes, commentsRes] = await Promise.all([
      (supabase.from('likes') as any).select('id', { count: 'exact', head: true }).eq('post_id', dbId),
      (supabase.from('comments') as any)
        .select('id, content, created_at, users(username, full_name)')
        .eq('post_id', dbId)
        .order('created_at', { ascending: true }),
    ])

    if (countRes.count != null) setLikeCount(countRes.count)
    if (commentsRes.data) setComments(commentsRes.data)

    if (user) {
      const [likeRes, saveRes] = await Promise.all([
        (supabase.from('likes') as any).select('id').eq('post_id', dbId).eq('user_id', user.id).maybeSingle(),
        (supabase.from('saves') as any).select('id').eq('post_id', dbId).eq('user_id', user.id).maybeSingle(),
      ])
      setLiked(!!likeRes.data)
      setSaved(!!saveRes.data)
    } else {
      setLiked(false)
      setSaved(false)
    }
  }, [post?.dbId, user?.id])

  useEffect(() => {
    loadSocialState()
  }, [loadSocialState])

  async function toggleLike() {
    if (!post?.dbId || !user) return
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(c => wasLiked ? c - 1 : c + 1)

    if (wasLiked) {
      const { error } = await (supabase.from('likes') as any)
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.dbId)
      if (error) { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1) }
    } else {
      const { error } = await (supabase.from('likes') as any)
        .insert({ user_id: user.id, post_id: post.dbId })
      if (error) { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1) }
    }
  }

  async function toggleSave() {
    if (!post?.dbId || !user) return
    const wasSaved = saved
    setSaved(!wasSaved)

    if (wasSaved) {
      const { error } = await (supabase.from('saves') as any)
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.dbId)
      if (error) setSaved(wasSaved)
    } else {
      const { error } = await (supabase.from('saves') as any)
        .insert({ user_id: user.id, post_id: post.dbId })
      if (error) setSaved(wasSaved)
    }
  }

  async function submitComment() {
    if (!comment.trim() || !post?.dbId || !user || submitting) return
    setSubmitting(true)
    const text = comment.trim()
    setComment('')
    const { error } = await (supabase.from('comments') as any)
      .insert({ user_id: user.id, post_id: post.dbId, content: text })
    if (!error) {
      await loadSocialState()
    } else {
      setComment(text)
    }
    setSubmitting(false)
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TouchableOpacity style={styles.backBar} onPress={() => router.back()}>
          <ChevronLeft />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text3 }}>Post not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <DotsIcon />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={[styles.photo, { backgroundColor: imgColors[post.imgKey] }]}>
          <ImagePlaceholder />
          <View style={styles.photoDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.actionsBar}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => requireAuth(toggleLike)}>
              <HeartIcon filled={liked} />
              <Text style={styles.actionCount}>{formatCount(likeCount)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => requireAuth(() => commentInputRef.current?.focus())}
            >
              <CommentIcon />
              <Text style={styles.actionCount}>{comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => requireAuth(toggleSave)}>
              <BookmarkIcon filled={saved} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <ShareIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.followPill, following && styles.followPillActive]}
            onPress={() => requireAuth(() => setFollowing(v => !v))}
          >
            <Text style={[styles.followText, following && styles.followTextActive]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.creatorRow}>
            <View style={[styles.avatar, { backgroundColor: post.avatarBg }]}>
              <Text style={[styles.avatarText, { color: post.avatarColor }]}>{post.initials}</Text>
            </View>
            <View>
              <Text style={styles.handle}>@{post.creator}</Text>
              <Text style={styles.timestamp}>2 days ago</Text>
            </View>
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postBody}>{post.body}</Text>

          <View style={styles.ratingsRow}>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingLabel}>Food</Text>
              <Stars count={post.food} styles={styles} />
            </View>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingLabel}>Vibe</Text>
              <Stars count={post.vibe} styles={styles} />
            </View>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingLabel}>Cost</Text>
              <Dollars count={post.cost} styles={styles} />
            </View>
          </View>

          <TouchableOpacity style={styles.locationPill}>
            <PinIcon />
            <Text style={styles.locationText}>{post.location}</Text>
          </TouchableOpacity>

          <View style={styles.hashtags}>
            {post.tags.map(tag => (
              <Text key={tag} style={styles.hashtag}>#{tag}</Text>
            ))}
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeading}>
            {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
          </Text>
          {comments.map(c => {
            const username = c.users?.username ?? 'user'
            const palette = paletteFor(username)
            return (
              <View key={c.id} style={styles.comment}>
                <View style={[styles.avatarXs, { backgroundColor: palette.bg }]}>
                  <Text style={[styles.avatarXsText, { color: palette.color }]}>
                    {username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentHandle}>@{username}</Text>
                  <Text style={styles.commentText}>{c.content}</Text>
                </View>
              </View>
            )
          })}
          {comments.length === 0 && (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInputBar}>
        <View style={[styles.avatarXs, { backgroundColor: '#FAEEDA', width: 28, height: 28 }]}>
          <Text style={[styles.avatarXsText, { color: '#854F0B', fontSize: 9 }]}>
            {user ? user.email?.slice(0, 2).toUpperCase() : 'ME'}
          </Text>
        </View>
        <TextInput
          ref={commentInputRef}
          style={styles.commentField}
          placeholder="Add a comment…"
          placeholderTextColor={colors.text3}
          value={comment}
          onChangeText={setComment}
          onFocus={() => requireAuth()}
          onSubmitEditing={submitComment}
          returnKeyType="send"
          editable={!submitting}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => requireAuth(submitComment)}
          disabled={submitting || !comment.trim()}
        >
          <SendIcon active={!!comment.trim()} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    backBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, marginLeft: -6 },
    backText: { fontSize: 14, color: c.text2 },
    iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    photo: { width: '100%', aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    photoDots: { position: 'absolute', bottom: 10, flexDirection: 'row', gap: 4 },
    dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.5)' },
    dotActive: { width: 14, borderRadius: 3, backgroundColor: '#fff' },
    actionsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: c.border },
    actionsLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
    actionCount: { fontSize: 11, color: c.text3 },
    followPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: c.border2 },
    followPillActive: { backgroundColor: c.surface, borderColor: c.border },
    followText: { fontSize: 12, fontWeight: '500', color: c.text },
    followTextActive: { color: c.text2 },
    content: { padding: 14, paddingHorizontal: 16, paddingBottom: 0 },
    creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 },
    avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 11, fontWeight: '600' },
    handle: { fontSize: 12, fontWeight: '500', color: c.text },
    timestamp: { fontSize: 10, color: c.text3, marginTop: 1 },
    postTitle: { fontSize: 15, fontWeight: '500', color: c.text, lineHeight: 22, marginBottom: 9, letterSpacing: -0.1 },
    postBody: { fontSize: 13, color: c.text2, lineHeight: 21, marginBottom: 13 },
    ratingsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
    ratingChip: { flex: 1, backgroundColor: c.surface, borderRadius: 8, borderWidth: 0.5, borderColor: c.border, padding: 7, paddingHorizontal: 10, gap: 4 },
    ratingLabel: { fontSize: 9, color: c.text3, textTransform: 'uppercase', letterSpacing: 0.6 },
    starsRow: { flexDirection: 'row', gap: 1.5 },
    star: { fontSize: 10, color: c.surface2 },
    starOn: { color: '#EF9F27' },
    dollar: { fontSize: 10, color: c.surface2, fontWeight: '500' },
    dollarOn: { color: '#1D9E75' },
    locationPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10, borderWidth: 0.5, borderColor: c.border },
    locationText: { fontSize: 12, color: c.text2 },
    hashtags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, paddingBottom: 14 },
    hashtag: { fontSize: 12, color: c.info },
    commentsSection: { borderTopWidth: 0.5, borderTopColor: c.border, padding: 12, paddingHorizontal: 16 },
    commentsHeading: { fontSize: 12, fontWeight: '500', color: c.text, marginBottom: 10 },
    noComments: { fontSize: 12, color: c.text3, textAlign: 'center', paddingVertical: 12 },
    comment: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    avatarXs: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    avatarXsText: { fontSize: 8, fontWeight: '600' },
    commentHandle: { fontSize: 11, fontWeight: '500', color: c.text },
    commentText: { fontSize: 12, color: c.text2, lineHeight: 18 },
    commentInputBar: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderTopWidth: 0.5, borderTopColor: c.border, backgroundColor: c.bg },
    commentField: { flex: 1, backgroundColor: c.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: c.text },
    sendBtn: { padding: 4 },
  })
}
