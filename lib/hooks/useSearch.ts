import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../supabase'
import { usePosts } from '../PostsContext'
import { MOCK_USERS, RESTAURANTS } from '../data'
import { haversineKm, distanceBoost } from '../utils/geo'
import type { Post } from '../data'

const PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? ''

export type PersonResult = {
  username: string
  displayName: string
  initials: string
  avatarBg: string
  avatarColor: string
  followers: string
}

export type PlaceResult = {
  id: string
  name: string
  address: string | null
  city: string | null
  cuisine_type: string | null
  google_place_id: string | null
  latitude: number | null
  longitude: number | null
  fromGoogle?: boolean
}

type UserLocation = { lat: number; lng: number } | null

const STOP_WORDS = new Set([
  'food', 'restaurant', 'restaurants', 'place', 'places', 'spot', 'spots',
  'the', 'a', 'an', 'in', 'at', 'for', 'and', 'or', 'near', 'with',
  'best', 'good', 'great', 'nice',
])

// Maps common dish/ingredient queries to their cuisine type.
// Allows "ramen" to surface Japanese restaurants even if "ramen" isn't in the name.
const CUISINE_SYNONYMS: Record<string, string[]> = {
  ramen: ['japanese'], sushi: ['japanese'], tempura: ['japanese'], yakitori: ['japanese'],
  udon: ['japanese'], sashimi: ['japanese'], izakaya: ['japanese'], tonkatsu: ['japanese'],
  dumpling: ['chinese', 'asian'], dumplings: ['chinese', 'asian'], 'dim sum': ['chinese'],
  noodle: ['chinese', 'asian'], noodles: ['chinese', 'asian'], wonton: ['chinese'],
  pizza: ['italian'], pasta: ['italian'], risotto: ['italian'], gelato: ['italian'],
  taco: ['mexican'], tacos: ['mexican'], burrito: ['mexican'], quesadilla: ['mexican'], nachos: ['mexican'],
  curry: ['indian'], biryani: ['indian'], naan: ['indian'], tikka: ['indian'], masala: ['indian'],
  pho: ['vietnamese'], banh: ['vietnamese'], bahn: ['vietnamese'],
  burger: ['american'], burgers: ['american'], bbq: ['american'], wings: ['american'],
  falafel: ['middle eastern', 'lebanese'], hummus: ['middle eastern', 'lebanese'],
  pad: ['thai'], satay: ['thai'], tom: ['thai'],
  croissant: ['french', 'bakery'], crepe: ['french'], baguette: ['french'],
  tapas: ['spanish'], paella: ['spanish'],
  schnitzel: ['german', 'european'], bratwurst: ['german'],
  kebab: ['turkish', 'middle eastern'], shawarma: ['turkish', 'middle eastern'],
  gyros: ['greek'], souvlaki: ['greek'],
  brunch: ['cafe', 'australian'], smashed: ['cafe', 'australian'],
}

function parseWords(query: string): string[] {
  return query.toLowerCase().replace(/#/g, '').split(/\s+/).filter(w => w.length > 0)
}

function scorePost(post: Post, words: string[]): number {
  let total = 0
  let requiredCount = 0
  let matchedCount = 0
  for (const word of words) {
    const isStop = STOP_WORDS.has(word)
    if (!isStop) requiredCount++
    let wordScore = 0
    if (post.title.toLowerCase().includes(word)) wordScore += 3
    if (post.cuisine_type?.toLowerCase().includes(word)) wordScore += 3
    if (post.tags.some(t => t.includes(word))) wordScore += 2
    if (post.location.toLowerCase().includes(word)) wordScore += 2
    if (post.creator.toLowerCase().includes(word)) wordScore += 1.5
    if (post.body.toLowerCase().includes(word)) wordScore += 1
    // Cuisine synonym expansion: "ramen" also scores against Japanese cuisine posts
    if (wordScore === 0) {
      const expansions = CUISINE_SYNONYMS[word] ?? []
      for (const synonym of expansions) {
        if (post.cuisine_type?.toLowerCase().includes(synonym)) { wordScore += 2; break }
      }
    }
    if (!isStop && wordScore > 0) matchedCount++
    total += wordScore
  }
  if (requiredCount > 0 && matchedCount < requiredCount) return 0
  if (requiredCount === 0 && total === 0) return 0
  return total
}

function scorePerson(p: PersonResult, words: string[]): number {
  const username = p.username.toLowerCase()
  const name = p.displayName.toLowerCase()
  let total = 0
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue
    const nameWords = name.split(/\s+/)
    if (username === word || nameWords.some(n => n === word)) total += 4
    else if (username.startsWith(word)) total += 3
    else if (username.includes(word) || name.includes(word)) total += 2
  }
  return total
}

// Returns a score based on how well a search word matches tokens in a text field.
// Strong match (word covers ≥80% of token): full score — "indian" → "indian"/"indians"
// Weak match (word covers 40-79% of token): reduced score — "indian" → "indianapolis"
// This keeps loosely-relevant results visible but ranked well below direct matches.
function fieldScore(text: string, word: string, strong: number): number {
  const tokens = text.split(/[\s,\-()\[\]/]+/).filter(Boolean)
  for (const t of tokens) {
    if (!t.startsWith(word)) continue
    const coverage = word.length / t.length
    if (coverage >= 0.8) return strong
    if (coverage >= 0.4) return strong * 0.33
  }
  return 0
}

function scorePlace(p: PlaceResult, words: string[]): number {
  const name = p.name.toLowerCase()
  const cuisine = (p.cuisine_type ?? '').toLowerCase()
  const city = (p.city ?? '').toLowerCase()
  const address = (p.address ?? '').toLowerCase()
  let total = 0
  let requiredCount = 0
  let matchedCount = 0
  for (const word of words) {
    const isStop = STOP_WORDS.has(word)
    if (!isStop) requiredCount++
    let wordScore = 0
    wordScore += fieldScore(name, word, 3)
    if (cuisine.includes(word)) wordScore += 2
    wordScore += fieldScore(city, word, 1)
    wordScore += fieldScore(address, word, 1)
    // Cuisine synonym expansion: "ramen" also scores against Japanese cuisine places
    if (wordScore === 0) {
      const expansions = CUISINE_SYNONYMS[word] ?? []
      for (const synonym of expansions) {
        if (cuisine.includes(synonym)) { wordScore += 2; break }
      }
    }
    if (!isStop && wordScore > 0) matchedCount++
    total += wordScore
  }
  if (requiredCount > 0 && matchedCount < requiredCount) return 0
  return total
}

type AutocompletePrediction = {
  place_id: string
  structured_formatting: { main_text: string; secondary_text: string }
}

export function useSearch(query: string, userLocation: UserLocation = null) {
  const { posts } = usePosts()
  const [dbUsers, setDbUsers] = useState<Array<{ id: string; username: string; full_name: string | null }>>([])
  const [dbPlaces, setDbPlaces] = useState<PlaceResult[]>([])
  const [googlePredictions, setGooglePredictions] = useState<AutocompletePrediction[]>([])

  const words = useMemo(() => parseWords(query), [query])
  const wordsKey = words.join(',')

  useEffect(() => {
    if (words.length === 0) {
      setDbUsers([]); setDbPlaces([]); setGooglePredictions([])
      return
    }
    const q = words.join(' ')
    const locationParam = userLocation
      ? `&location=${userLocation.lat},${userLocation.lng}&radius=10000`
      : ''
    const timer = setTimeout(async () => {
      const [usersRes, placesRes, googleRes] = await Promise.all([
        (supabase.from('users') as any)
          .select('id, username, full_name')
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
          .limit(10),
        (supabase.from('restaurants') as any)
          .select('id, name, address, city, cuisine_type, google_place_id, latitude, longitude')
          .or(`name.ilike.%${q}%,city.ilike.%${q}%,cuisine_type.ilike.%${q}%`)
          .limit(10),
        PLACES_KEY
          ? fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}${locationParam}&types=establishment&key=${PLACES_KEY}`)
              .then(r => r.json())
              .catch(() => ({ predictions: [] }))
          : Promise.resolve({ predictions: [] }),
      ])
      setDbUsers(usersRes.data ?? [])
      setDbPlaces(placesRes.data ?? [])
      setGooglePredictions(googleRes.predictions ?? [])
    }, 300)
    return () => clearTimeout(timer)
  }, [wordsKey, userLocation?.lat, userLocation?.lng])

  const postResults = useMemo<Post[]>(() => {
    if (words.length === 0) return []
    return posts
      .map(p => {
        let score = scorePost(p, words)
        if (score > 0) {
          // Quality boost: higher food ratings float above equal-scored posts
          if (p.food >= 4.5) score += 1.5
          else if (p.food >= 4.0) score += 0.5
          // Distance boost
          if (userLocation && p.lat != null && p.lng != null) {
            score += distanceBoost(haversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng))
          }
        }
        return { post: p, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.post)
  }, [posts, wordsKey, userLocation?.lat, userLocation?.lng])

  const peopleResults = useMemo<PersonResult[]>(() => {
    if (words.length === 0) return []
    const mockMatches = Object.entries(MOCK_USERS)
      .map(([username, u]) => {
        const p: PersonResult = { username, displayName: u.displayName, initials: u.initials, avatarBg: u.avatarBg, avatarColor: u.avatarColor, followers: u.followers }
        return { person: p, score: scorePerson(p, words) }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.person)
    const mockUsernames = new Set(mockMatches.map(p => p.username))
    const dbExtras: PersonResult[] = dbUsers
      .filter(u => !mockUsernames.has(u.username))
      .map(u => {
        const initials = (u.full_name ?? u.username).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        return { username: u.username, displayName: u.full_name ?? u.username, initials, avatarBg: '#E8E8E4', avatarColor: '#6B6B66', followers: '—' }
      })
    return [...mockMatches, ...dbExtras]
  }, [wordsKey, dbUsers])

  const { placeResults, placeDistances } = useMemo<{
    placeResults: PlaceResult[]
    placeDistances: Map<string, number>
  }>(() => {
    if (words.length === 0) return { placeResults: [], placeDistances: new Map() }

    // Popularity signal: count forkyou posts per restaurant
    const postCountByRestaurant = new Map<string, number>()
    for (const post of posts) {
      if (post.restaurantId) {
        postCountByRestaurant.set(post.restaurantId, (postCountByRestaurant.get(post.restaurantId) ?? 0) + 1)
      }
    }

    const localPlaces: PlaceResult[] = RESTAURANTS.map(r => ({
      id: r.name,
      name: r.name,
      address: r.address ?? null,
      city: r.suburb ?? null,
      cuisine_type: null,
      google_place_id: r.placeId ?? null,
      latitude: r.lat ?? null,
      longitude: r.lng ?? null,
    }))

    const dbNames = new Set(dbPlaces.map(p => p.name.toLowerCase()))
    const combined = [...dbPlaces, ...localPlaces.filter(p => !dbNames.has(p.name.toLowerCase()))]

    const distances = new Map<string, number>()

    const scored = combined
      .map(p => {
        let score = scorePlace(p, words)
        // Popularity boost: places with more forkyou posts rank higher
        const postCount = postCountByRestaurant.get(p.id) ?? 0
        if (postCount >= 5) score += 1.5
        else if (postCount >= 2) score += 0.75
        else if (postCount >= 1) score += 0.25
        // Distance boost
        if (userLocation && p.latitude != null && p.longitude != null) {
          const km = haversineKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
          distances.set(p.id, km)
          score += distanceBoost(km)
        }
        return { place: p, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.place)

    const knownIds = new Set(scored.map(p => p.google_place_id).filter(Boolean))
    const knownNames = new Set(scored.map(p => p.name.toLowerCase()))
    const googleExtras: PlaceResult[] = googlePredictions
      .filter(p => !knownIds.has(p.place_id) && !knownNames.has(p.structured_formatting.main_text.toLowerCase()))
      .map(p => ({
        id: p.place_id,
        name: p.structured_formatting.main_text,
        address: p.structured_formatting.secondary_text,
        city: null,
        cuisine_type: null,
        google_place_id: p.place_id,
        latitude: null,
        longitude: null,
        fromGoogle: true,
      }))

    return { placeResults: [...scored, ...googleExtras], placeDistances: distances }
  }, [posts, wordsKey, dbPlaces, googlePredictions, userLocation?.lat, userLocation?.lng])

  return { postResults, peopleResults, placeResults, placeDistances, hasQuery: words.length > 0 }
}
