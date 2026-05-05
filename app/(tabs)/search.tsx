import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Svg, Circle, Line, Path } from 'react-native-svg'
import { imgColors } from '@/constants/Colors'
import { useThemeColors } from '@/lib/ThemeContext'
import { usePosts } from '@/lib/PostsContext'
import type { Post } from '@/lib/data'

const CHIPS = [
  { label: 'Ramen', emoji: '🍜', query: 'ramen' },
  { label: 'Brunch', emoji: '☀️', query: 'brunch' },
  { label: 'Dumplings', emoji: '🥟', query: 'dumplings' },
  { label: 'Date night', emoji: '🌙', query: 'date night' },
  { label: 'Cheap eats', emoji: '💸', query: 'cheap' },
  { label: 'Japanese', emoji: '🍣', query: 'japanese' },
  { label: 'Burgers', emoji: '🍔', query: 'burger' },
]

const TRENDING = [
  { tag: '#ramen', count: '4.2k posts' },
  { tag: '#sydneybrunch', count: '3.8k posts' },
  { tag: '#hiddengem', count: '2.9k posts' },
  { tag: '#melbournefood', count: '2.1k posts' },
  { tag: '#dumplings', count: '1.7k posts' },
  { tag: '#datenight', count: '1.4k posts' },
]

function SearchIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.text3} strokeWidth={1.5} strokeLinecap="round">
      <Circle cx={11} cy={11} r={8} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </Svg>
  )
}

function CloseIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={2} strokeLinecap="round">
      <Line x1={18} y1={6} x2={6} y2={18} />
      <Line x1={6} y1={6} x2={18} y2={18} />
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

function HeartIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={colors.text3} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const [activeChip, setActiveChip] = useState('ramen')
  const { posts } = usePosts()
  const { width } = useWindowDimensions()
  const colWidth = (width - 16 - 6) / 2
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])

  const results = query.trim()
    ? posts.filter(p => {
        const q = query.toLowerCase().replace('#', '')
        return (
          p.title.toLowerCase().includes(q) ||
          p.tags.some(t => t.includes(q)) ||
          p.creator.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q)
        )
      })
    : []

  const leftCol = results.filter((_, i) => i % 2 === 0)
  const rightCol = results.filter((_, i) => i % 2 === 1)

  function handleChip(chip: typeof CHIPS[number]) {
    setActiveChip(chip.query)
    setQuery(chip.query)
  }

  function handleTrending(tag: string) {
    setQuery(tag)
    setActiveChip('')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>forkyou<Text style={styles.wordmarkDot}>.</Text></Text>
      </View>

      <View style={styles.searchTop}>
        <View style={styles.searchWrap}>
          <SearchIcon />
          <TextInput
            style={styles.searchField}
            placeholder="Search dishes, places, vibes…"
            placeholderTextColor={colors.text3}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => { setQuery(''); setActiveChip('ramen') }}>
              <CloseIcon />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CHIPS.map(chip => (
            <TouchableOpacity
              key={chip.query}
              style={[styles.chip, activeChip === chip.query && styles.chipActive]}
              onPress={() => handleChip(chip)}
            >
              <Text style={styles.chipEmoji}>{chip.emoji}</Text>
              <Text style={[styles.chipText, activeChip === chip.query && styles.chipTextActive]}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!query.trim() ? (
          <>
            <Text style={styles.sectionLabel}>TRENDING NOW</Text>
            <View style={styles.trendingList}>
              {TRENDING.map((item, i) => (
                <TouchableOpacity
                  key={item.tag}
                  style={[styles.trendingItem, i === TRENDING.length - 1 && styles.trendingItemLast]}
                  onPress={() => handleTrending(item.tag)}
                >
                  <Text style={[styles.trendingRank, i < 3 && styles.trendingRankHot]}>{i + 1}</Text>
                  <Text style={styles.trendingTag}>{item.tag}</Text>
                  <Text style={styles.trendingCount}>{item.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {results.length > 0 ? (
              <>
                <Text style={styles.resultsLabel}>{results.length} post{results.length !== 1 ? 's' : ''} for "{query}"</Text>
                <View style={styles.grid}>
                  <View style={[styles.col, { width: colWidth }]}>
                    {leftCol.map(post => <PostCard key={post.id} post={post} colWidth={colWidth} />)}
                  </View>
                  <View style={[styles.col, { width: colWidth }]}>
                    {rightCol.map(post => <PostCard key={post.id} post={post} colWidth={colWidth} />)}
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.noResults}>No posts found</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    topBar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
    wordmark: { fontFamily: 'DMSerifDisplay-Regular', fontSize: 22, color: c.text, letterSpacing: -0.5 },
    wordmarkDot: { color: c.accent },
    searchTop: { paddingHorizontal: 16, paddingTop: 10, borderBottomWidth: 0.5, borderBottomColor: c.border, backgroundColor: c.bg },
    searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 12 },
    searchField: { flex: 1, fontSize: 14, color: c.text, padding: 0 },
    clearBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' },
    chips: { gap: 7, paddingBottom: 12 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border },
    chipActive: { backgroundColor: c.text, borderColor: c.text },
    chipEmoji: { fontSize: 12 },
    chipText: { fontSize: 12, color: c.text2 } as any,
    chipTextActive: { color: c.bg },
    scroll: { flex: 1 },
    sectionLabel: { fontSize: 11, fontWeight: '500', color: c.text3, letterSpacing: 0.7, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
    trendingList: { paddingHorizontal: 16 },
    trendingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: c.border },
    trendingItemLast: { borderBottomWidth: 0 },
    trendingRank: { fontSize: 13, fontWeight: '500', color: c.text3, width: 20, textAlign: 'center' },
    trendingRankHot: { color: c.accent },
    trendingTag: { flex: 1, fontSize: 13, color: c.text },
    trendingCount: { fontSize: 11, color: c.text3 },
    resultsLabel: { fontSize: 12, color: c.text2, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 10 },
    grid: { flexDirection: 'row', gap: 6, paddingHorizontal: 8, paddingBottom: 8, alignItems: 'flex-start' },
    col: { gap: 6 },
    noResults: { textAlign: 'center', paddingTop: 40, fontSize: 14, color: c.text3 },
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
