import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Svg, Path, Circle } from 'react-native-svg'
import { imgColors } from '@/constants/Colors'
import { useThemeColors } from '@/lib/ThemeContext'
import { usePosts } from '@/lib/PostsContext'
import type { Post } from '@/lib/data'

function BellIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  )
}

function HeartIcon({ filled }: { filled?: boolean }) {
  const colors = useThemeColors()
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill={filled ? colors.liked : 'none'} stroke={filled ? colors.liked : colors.text3} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  )
}

function ImagePlaceholder() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth={0.8} strokeLinecap="round">
      <Path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <Circle cx={8.5} cy={8.5} r={1.5} />
      <Path d="M21 15l-5-5L5 21" />
    </Svg>
  )
}

function PostCard({ post, colWidth }: { post: Post; colWidth: number }) {
  const router = useRouter()
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const imgH = post.tall ? colWidth * (5 / 3) : colWidth * (4 / 3)

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push(`/post/${post.id}`)}>
      <View style={[styles.cardImg, { height: imgH, backgroundColor: imgColors[post.imgKey] }]}>
        <ImagePlaceholder />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.creatorRow}>
            <View style={[styles.avatarSm, { backgroundColor: post.avatarBg }]}>
              <Text style={[styles.avatarSmText, { color: post.avatarColor }]}>{post.initials}</Text>
            </View>
            <Text style={styles.creatorName}>@{post.creator}</Text>
          </View>
          <View style={styles.likeCount}>
            <HeartIcon />
            <Text style={styles.likeText}>{post.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function FeedScreen() {
  const [activeTab, setActiveTab] = useState<'Following' | 'Discover'>('Following')
  const { posts } = usePosts()
  const { width } = useWindowDimensions()
  const colWidth = (width - 16 - 6) / 2
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const leftCol = posts.filter((_, i) => i % 2 === 0)
  const rightCol = posts.filter((_, i) => i % 2 === 1)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>forkyou<Text style={styles.wordmarkDot}>.</Text></Text>
        <TouchableOpacity style={styles.iconBtn}>
          <BellIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['Following', 'Discover'] as const).map(tab => (
          <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={[styles.col, { width: colWidth }]}>
          {leftCol.map(post => <PostCard key={post.id} post={post} colWidth={colWidth} />)}
        </View>
        <View style={[styles.col, { width: colWidth }]}>
          {rightCol.map(post => <PostCard key={post.id} post={post} colWidth={colWidth} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    topBar: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: c.border,
    },
    wordmark: { fontFamily: 'DMSerifDisplay-Regular', fontSize: 22, color: c.text, letterSpacing: -0.5 },
    wordmarkDot: { color: c.accent },
    iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 24, borderBottomWidth: 0.5, borderBottomColor: c.border },
    tab: { paddingVertical: 10, position: 'relative' },
    tabText: { fontSize: 13, color: c.text3 },
    tabTextActive: { color: c.text, fontWeight: '500' },
    tabUnderline: { position: 'absolute', bottom: -0.5, left: 0, right: 0, height: 2, backgroundColor: c.text, borderRadius: 1 },
    scroll: { flex: 1 },
    grid: { flexDirection: 'row', gap: 6, padding: 8, alignItems: 'flex-start' },
    col: { gap: 6 },
    card: { borderRadius: 10, overflow: 'hidden', backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border },
    cardImg: { alignItems: 'center', justifyContent: 'center' },
    cardInfo: { padding: 7, paddingHorizontal: 9, paddingBottom: 8 },
    cardTitle: { fontSize: 11.5, color: c.text, lineHeight: 16, marginBottom: 6 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    avatarSm: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    avatarSmText: { fontSize: 6.5, fontWeight: '600' },
    creatorName: { fontSize: 10, color: c.text2 },
    likeCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    likeText: { fontSize: 10, color: c.text3 },
  })
}
