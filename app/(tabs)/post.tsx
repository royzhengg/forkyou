import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { Svg, Path, Circle, Line, Rect, Polyline } from 'react-native-svg'
import { useThemeColors } from '@/lib/ThemeContext'
import { usePosts } from '@/lib/PostsContext'
import { useAuth } from '@/lib/AuthContext'
import { useAuthGate } from '@/lib/AuthGateContext'
import { RESTAURANTS } from '@/lib/data'

function ImageIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.text3} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={3} width={18} height={18} rx={2} />
      <Circle cx={8.5} cy={8.5} r={1.5} />
      <Polyline points="21 15 16 10 5 21" />
    </Svg>
  )
}

function PlusIcon({ size = 18, color }: { size?: number; color?: string }) {
  const colors = useThemeColors()
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? colors.text3} strokeWidth={1.5} strokeLinecap="round">
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  )
}

function CloseIcon({ size = 8, color }: { size?: number; color?: string }) {
  const colors = useThemeColors()
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? colors.bg} strokeWidth={2.5} strokeLinecap="round">
      <Line x1={18} y1={6} x2={6} y2={18} />
      <Line x1={6} y1={6} x2={18} y2={18} />
    </Svg>
  )
}

function PinIcon({ color }: { color?: string }) {
  const colors = useThemeColors()
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color ?? colors.text3} strokeWidth={1.5} strokeLinecap="round">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx={12} cy={10} r={3} />
    </Svg>
  )
}

function SearchIcon() {
  const colors = useThemeColors()
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.text3} strokeWidth={1.5} strokeLinecap="round">
      <Circle cx={11} cy={11} r={8} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </Svg>
  )
}

const IMG_COLORS = ['#EDE4DA', '#DCE8D8', '#D8E2EE', '#EDD8E2', '#E8D8CC', '#D6E2D6']

export default function PostScreen() {
  const router = useRouter()
  const { addPost } = usePosts()
  const { user } = useAuth()
  const { requireAuth } = useAuthGate()
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])

  useEffect(() => {
    if (!user) requireAuth()
  }, [user])

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [foodRating, setFoodRating] = useState(0)
  const [vibeRating, setVibeRating] = useState(0)
  const [costRating, setCostRating] = useState(0)
  const [location, setLocation] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')

  const postReady = title.trim().length >= 3

  function addPhoto() {
    if (photos.length >= 9) return
    setPhotos(prev => [...prev, IMG_COLORS[prev.length % IMG_COLORS.length]])
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  function handleHashtagKey(key: string) {
    if ((key === ' ' || key === 'Enter') && hashtagInput.trim()) {
      const tag = hashtagInput.trim().replace(/^#/, '').replace(/\s/g, '')
      if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
        setHashtags(prev => [...prev, tag])
      }
      setHashtagInput('')
    }
  }

  function removeHashtag(tag: string) {
    setHashtags(prev => prev.filter(t => t !== tag))
  }

  const filteredRestaurants = locationSearch
    ? RESTAURANTS.filter(r =>
        r.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
        r.suburb.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : RESTAURANTS

  function selectLocation(name: string, suburb: string) {
    setLocation(`${name}, ${suburb.split(',')[0]}`)
    setLocationModalOpen(false)
    setLocationSearch('')
  }

  function handleSubmit() {
    addPost({
      title: title.trim(),
      body: body.trim(),
      imgKey: 'warm',
      tall: Math.random() > 0.5,
      tags: hashtags,
      location: location || 'Unknown location',
      food: foodRating || 3,
      vibe: vibeRating || 3,
      cost: costRating || 2,
    })
    setTitle(''); setBody(''); setFoodRating(0); setVibeRating(0); setCostRating(0)
    setLocation(''); setHashtags([]); setHashtagInput(''); setPhotos([])
    router.replace('/(tabs)/profile')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/feed')} style={styles.cancelBtn}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.text2} strokeWidth={1.5} strokeLinecap="round">
            <Polyline points="15 18 9 12 15 6" />
          </Svg>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>New review</Text>
        <TouchableOpacity
          style={[styles.postBtn, !postReady && styles.postBtnDisabled]}
          onPress={postReady ? handleSubmit : undefined}
          disabled={!postReady}
        >
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {photos.length === 0 ? (
            <TouchableOpacity style={styles.photoUpload} onPress={addPhoto}>
              <ImageIcon />
              <Text style={styles.uploadLabel}>Add photos or video</Text>
              <Text style={styles.uploadSub}>Tap to select from library</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
              {photos.map((color, idx) => (
                <View key={idx} style={[styles.thumb, { backgroundColor: color }]}>
                  <TouchableOpacity style={styles.thumbRemove} onPress={() => removePhoto(idx)}>
                    <CloseIcon />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 9 && (
                <TouchableOpacity style={styles.thumbAdd} onPress={addPhoto}>
                  <PlusIcon />
                </TouchableOpacity>
              )}
            </ScrollView>
          )}

          <View style={styles.section}>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your review a title…"
              placeholderTextColor={colors.text3}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              multiline
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <TextInput
              style={styles.bodyInput}
              placeholder="Share your experience — what did you order, what was the vibe, would you go back?"
              placeholderTextColor={colors.text3}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.ratingsRow}>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingLabel}>FOOD</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setFoodRating(n)}>
                    <Text style={[styles.star, n <= foodRating && styles.starOn]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingLabel}>VIBE</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(n => (
                  <TouchableOpacity key={n} onPress={() => setVibeRating(n)}>
                    <Text style={[styles.star, n <= vibeRating && styles.starOn]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.ratingChip}>
              <Text style={styles.ratingLabel}>COST</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4].map(n => (
                  <TouchableOpacity key={n} onPress={() => setCostRating(n)}>
                    <Text style={[styles.dollar, n <= costRating && styles.dollarOn]}>$</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.locationWrap} onPress={() => setLocationModalOpen(true)}>
            <PinIcon color={location ? colors.accent : colors.text3} />
            <Text style={[styles.locationText, location ? styles.locationFilled : null]} numberOfLines={1}>
              {location || 'Add location (optional)'}
            </Text>
            {location ? (
              <TouchableOpacity onPress={() => setLocation('')}>
                <Text style={styles.locationClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>

          <View style={styles.hashtagWrap}>
            {hashtags.map(tag => (
              <TouchableOpacity key={tag} style={styles.hashtagToken} onPress={() => removeHashtag(tag)}>
                <Text style={styles.hashtagTokenText}>#{tag} ×</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.hashtagField}
              placeholder={hashtags.length === 0 ? 'Add hashtags…' : ''}
              placeholderTextColor={colors.text3}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onKeyPress={({ nativeEvent }) => handleHashtagKey(nativeEvent.key)}
              onSubmitEditing={() => handleHashtagKey('Enter')}
              blurOnSubmit={false}
            />
          </View>
          <Text style={styles.hashtagHint}>Press space or enter to add a tag</Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={locationModalOpen} transparent animationType="slide" onRequestClose={() => setLocationModalOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setLocationModalOpen(false)} />
        <View style={styles.modal}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Tag a restaurant</Text>
          <View style={styles.modalSearch}>
            <SearchIcon />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search restaurants…"
              placeholderTextColor={colors.text3}
              value={locationSearch}
              onChangeText={setLocationSearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredRestaurants}
            keyExtractor={item => item.name}
            style={styles.locationList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.locationResult, index === filteredRestaurants.length - 1 && styles.locationResultLast]}
                onPress={() => selectLocation(item.name, item.suburb)}
              >
                <Text style={styles.locationResultName}>{item.name}</Text>
                <Text style={styles.locationResultSub}>{item.suburb}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: c.border },
    cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, marginLeft: -6 },
    cancelText: { fontSize: 14, color: c.text2 },
    screenTitle: { fontSize: 15, fontWeight: '500', color: c.text },
    postBtn: { backgroundColor: c.text, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
    postBtnDisabled: { opacity: 0.35 },
    postBtnText: { fontSize: 13, fontWeight: '500', color: c.bg },
    scroll: { flex: 1 },
    photoUpload: { margin: 14, marginHorizontal: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.border2, borderRadius: 12, aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.surface },
    uploadLabel: { fontSize: 13, color: c.text2, fontWeight: '500' },
    uploadSub: { fontSize: 11, color: c.text3 },
    photoStrip: { gap: 6, padding: 16, paddingBottom: 14 },
    thumb: { width: 56, height: 56, borderRadius: 8, position: 'relative' },
    thumbRemove: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: c.text, alignItems: 'center', justifyContent: 'center' },
    thumbAdd: { width: 56, height: 56, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.border2, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    section: { paddingHorizontal: 16, paddingTop: 14 },
    titleInput: { fontSize: 16, fontWeight: '500', color: c.text, padding: 0, lineHeight: 22 },
    charCount: { fontSize: 10, color: c.text3, textAlign: 'right', marginTop: 2 },
    divider: { height: 0.5, backgroundColor: c.border, marginHorizontal: 16, marginTop: 14 },
    bodyInput: { fontSize: 13, color: c.text2, padding: 0, lineHeight: 21, minHeight: 80 },
    ratingsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 14, marginBottom: 14 },
    ratingChip: { flex: 1, backgroundColor: c.surface, borderRadius: 8, borderWidth: 0.5, borderColor: c.border, padding: 9, paddingHorizontal: 8, gap: 6 },
    ratingLabel: { fontSize: 9, color: c.text3, letterSpacing: 0.6 },
    starsRow: { flexDirection: 'row', gap: 2 },
    star: { fontSize: 14, color: c.surface2 },
    starOn: { color: '#EF9F27' },
    dollar: { fontSize: 11, fontWeight: '600', color: c.surface2, paddingHorizontal: 1 },
    dollarOn: { color: '#1D9E75' },
    locationWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: c.surface, borderRadius: 8, borderWidth: 0.5, borderColor: c.border, paddingHorizontal: 13, paddingVertical: 10, marginHorizontal: 16, marginBottom: 14 },
    locationText: { flex: 1, fontSize: 13, color: c.text3 },
    locationFilled: { color: c.text2 },
    locationClear: { fontSize: 11, color: c.text3 },
    hashtagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', backgroundColor: c.surface, borderRadius: 8, borderWidth: 0.5, borderColor: c.border, paddingHorizontal: 13, paddingVertical: 8, marginHorizontal: 16, minHeight: 40 },
    hashtagToken: { backgroundColor: c.info, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
    hashtagTokenText: { fontSize: 11, color: '#fff' },
    hashtagField: { flex: 1, minWidth: 80, fontSize: 13, color: c.text, padding: 0 },
    hashtagHint: { fontSize: 11, color: c.text3, paddingHorizontal: 16, paddingTop: 6 },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    modal: { backgroundColor: c.bg, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderTopWidth: 0.5, borderTopColor: c.border, paddingBottom: 20, maxHeight: '70%' },
    modalHandle: { width: 36, height: 4, backgroundColor: c.surface2, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 14 },
    modalTitle: { fontSize: 14, fontWeight: '500', color: c.text, paddingHorizontal: 16, paddingBottom: 10 },
    modalSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 8, marginHorizontal: 16, marginBottom: 10 },
    modalSearchInput: { flex: 1, fontSize: 13, color: c.text, padding: 0 },
    locationList: { paddingHorizontal: 16 },
    locationResult: { paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: c.border },
    locationResultLast: { borderBottomWidth: 0 },
    locationResultName: { fontSize: 13, color: c.text },
    locationResultSub: { fontSize: 11, color: c.text3, marginTop: 2 },
  })
}
