import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Svg, Path, Circle, Line, Rect, Polyline } from 'react-native-svg'
import { imgColors } from '@/constants/Colors'
import { useThemeColors } from '@/lib/ThemeContext'
import { usePosts } from '@/lib/PostsContext'
import { useAuth } from '@/lib/AuthContext'
import { useAuthGate } from '@/lib/AuthGateContext'
import { supabase } from '@/lib/supabase'
import { MY_CREATOR, MY_INITIALS, MY_AVATAR_BG, MY_AVATAR_COLOR } from '@/lib/data'
import type { Post } from '@/lib/data'

function GridIcon({ active }: { active: boolean }) {
  const colors = useThemeColors()
  const c = active ? colors.text : colors.text3
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={3} width={7} height={7} />
      <Rect x={14} y={3} width={7} height={7} />
      <Rect x={3} y={14} width={7} height={7} />
      <Rect x={14} y={14} width={7} height={7} />
    </Svg>
  )
}

function BookmarkIcon({ active }: { active: boolean }) {
  const colors = useThemeColors()
  const c = active ? colors.text : colors.text3
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  )
}

function HeartIcon({ active }: { active: boolean }) {
  const colors = useThemeColors()
  const c = active ? colors.text : colors.text3
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  )
}

function SettingsIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

function ShareIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={18} cy={5} r={3} />
      <Circle cx={6} cy={12} r={3} />
      <Circle cx={18} cy={19} r={3} />
      <Line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
      <Line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
    </Svg>
  )
}

function ImagePlaceholder() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth={0.8} strokeLinecap="round">
      <Path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <Circle cx={8.5} cy={8.5} r={1.5} />
      <Path d="M21 15l-5-5L5 21" />
    </Svg>
  )
}

type TabKey = 'posts' | 'saved' | 'liked'

function EmptyTab({ icon, lines }: { icon: React.ReactNode; lines: [string, string] }) {
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <View style={styles.emptyTab}>
      {icon}
      <Text style={styles.emptyText}>{lines[0]}{'\n'}{lines[1]}</Text>
    </View>
  )
}

function ThumbGrid({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const thumbSize = (width - 4) / 3

  if (posts.length === 0) return null

  return (
    <View style={styles.thumbGrid}>
      {posts.map(post => (
        <TouchableOpacity
          key={post.id}
          style={[styles.thumb, { width: thumbSize, height: thumbSize }]}
          onPress={() => router.push(`/post/${post.id}`)}
          activeOpacity={0.8}
        >
          <View style={[styles.thumbInner, { backgroundColor: imgColors[post.imgKey] }]}>
            <ImagePlaceholder />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('posts')
  const { posts } = usePosts()
  const { user } = useAuth()
  const { requireAuth } = useAuthGate()
  const router = useRouter()
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    if (!user) requireAuth()
  }, [user])

  useEffect(() => {
    if (!user) {
      setLikedIds([])
      setSavedIds([])
      return
    }
    Promise.all([
      (supabase.from('likes') as any).select('post_id').eq('user_id', user.id),
      (supabase.from('saves') as any).select('post_id').eq('user_id', user.id),
    ]).then(([likesRes, savesRes]) => {
      if (likesRes.data) setLikedIds(likesRes.data.map((r: any) => r.post_id))
      if (savesRes.data) setSavedIds(savesRes.data.map((r: any) => r.post_id))
    })
  }, [user?.id])

  const myPosts = posts.filter(p => p.creator === MY_CREATOR)
  const savedPosts = posts.filter(p => savedIds.includes(p.dbId))
  const likedPosts = posts.filter(p => likedIds.includes(p.dbId))

  function tabContent() {
    if (activeTab === 'posts') {
      return myPosts.length === 0
        ? <EmptyTab icon={<GridIcon active={false} />} lines={['No posts yet.', 'Share your first food experience.']} />
        : <ThumbGrid posts={myPosts} />
    }
    if (activeTab === 'saved') {
      return savedPosts.length === 0
        ? <EmptyTab icon={<BookmarkIcon active={false} />} lines={['No saved posts yet.', 'Bookmark reviews to find them here.']} />
        : <ThumbGrid posts={savedPosts} />
    }
    return likedPosts.length === 0
      ? <EmptyTab icon={<HeartIcon active={false} />} lines={['No liked posts yet.', 'Heart reviews you love.']} />
      : <ThumbGrid posts={likedPosts} />
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={{ width: 34 }} />
        <Text style={styles.username}>@{MY_CREATOR}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings')}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: MY_AVATAR_BG }]}>
              <Text style={[styles.avatarText, { color: MY_AVATAR_COLOR }]}>{MY_INITIALS}</Text>
            </View>
            <View style={styles.stats}>
              <TouchableOpacity style={styles.stat}>
                <Text style={styles.statNum}>{myPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stat}>
                <Text style={styles.statNum}>1.4k</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stat}>
                <Text style={styles.statNum}>312</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.displayName}>Sarah Lee</Text>
          <Text style={styles.bio}>Sydney-based food lover hunting hidden gems and honest eats. No sponsored content, ever.</Text>
          <View style={styles.locationTag}>
            <PinIcon />
            <Text style={styles.locationText}>Sydney, NSW</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings/edit-profile')}>
              <Text style={styles.editBtnText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <ShareIcon />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileTabs}>
          {([
            { key: 'posts', icon: <GridIcon active={activeTab === 'posts'} /> },
            { key: 'saved', icon: <BookmarkIcon active={activeTab === 'saved'} /> },
            { key: 'liked', icon: <HeartIcon active={activeTab === 'liked'} /> },
          ] as { key: TabKey; icon: React.ReactNode }[]).map(({ key, icon }) => (
            <TouchableOpacity
              key={key}
              style={[styles.profileTab, activeTab === key && styles.profileTabActive]}
              onPress={() => setActiveTab(key)}
            >
              {icon}
            </TouchableOpacity>
          ))}
        </View>

        {tabContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
    username: { fontSize: 15, fontWeight: '500', color: c.text },
    iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    header: { padding: 20, paddingBottom: 16 },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 24, fontWeight: '600' },
    stats: { flex: 1, flexDirection: 'row' },
    stat: { flex: 1, alignItems: 'center', gap: 2 },
    statNum: { fontSize: 17, fontWeight: '600', color: c.text, letterSpacing: -0.3 },
    statLabel: { fontSize: 10, color: c.text3 },
    displayName: { fontSize: 14, fontWeight: '500', color: c.text, marginBottom: 3 },
    bio: { fontSize: 12, color: c.text2, lineHeight: 18, marginBottom: 12 },
    locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
    locationText: { fontSize: 11, color: c.text3 },
    actionBtns: { flexDirection: 'row', gap: 8 },
    editBtn: { flex: 1, backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border2, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
    editBtnText: { fontSize: 13, fontWeight: '500', color: c.text },
    shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border2, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
    shareBtnText: { fontSize: 13, fontWeight: '500', color: c.text },
    profileTabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.border },
    profileTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -0.5 },
    profileTabActive: { borderBottomColor: c.text },
    thumbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 2 },
    thumb: { overflow: 'hidden' },
    thumbInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyTab: { alignItems: 'center', justifyContent: 'center', padding: 50, gap: 10 },
    emptyText: { fontSize: 13, color: c.text3, textAlign: 'center', lineHeight: 20 },
  })
}
