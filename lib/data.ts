export interface Post {
  id: number
  dbId: string
  title: string
  body: string
  creator: string
  initials: string
  avatarBg: string
  avatarColor: string
  likes: string
  imgKey: string
  tall: boolean
  tags: string[]
  location: string
  food: number
  vibe: number
  cost: number
}

export interface Restaurant {
  name: string
  suburb: string
}

export const POSTS: Post[] = [
  {
    id: 1,
    dbId: '11000000-0000-0000-0000-000000000001',
    title: 'Best tonkotsu ramen in Sydney — thick broth, melt-in-mouth chashu',
    creator: 'sarahleats',
    initials: 'SL',
    avatarBg: '#E6F1FB',
    avatarColor: '#185FA5',
    likes: '2.4k',
    imgKey: 'warm',
    tall: false,
    tags: ['ramen', 'sydneyfood', 'japanesefood', 'surryhills'],
    body: 'The broth here is next level — you can tell it\'s been simmered for hours. Chashu is tender, soft boiled egg is perfectly jammy. Portions are generous and the vibe is low-key and unpretentious.',
    location: 'Gaku Robata, Surry Hills',
    food: 5,
    vibe: 4,
    cost: 3,
  },
  {
    id: 2,
    dbId: '11000000-0000-0000-0000-000000000002',
    title: 'Hidden gem dumpling spot in Haymarket — $12 for 20 pieces',
    creator: 'melfoods',
    initials: 'MF',
    avatarBg: '#FBEAF0',
    avatarColor: '#993556',
    likes: '891',
    imgKey: 'green',
    tall: true,
    tags: ['dumplings', 'haymarket', 'sydneyfood', 'cheapeat'],
    body: 'Tucked away on a side street most people walk past. Hand-folded dumplings, pork and chive is the move. The chilli oil is dangerously good.',
    location: 'Lucky House, Haymarket',
    food: 5,
    vibe: 3,
    cost: 1,
  },
  {
    id: 3,
    dbId: '11000000-0000-0000-0000-000000000003',
    title: 'Date night done right — Surry Hills Italian that won\'t break the bank',
    creator: 'jkitchen',
    initials: 'JK',
    avatarBg: '#E1F5EE',
    avatarColor: '#0F6E56',
    likes: '1.1k',
    imgKey: 'clay',
    tall: true,
    tags: ['datenight', 'italian', 'surryhills', 'sydneyfood'],
    body: 'Perfect for impressing someone without spending $200 each. The pasta is made fresh daily. Get the cacio e pepe and thank me later.',
    location: 'Pasta Emilia, Surry Hills',
    food: 4,
    vibe: 5,
    cost: 3,
  },
  {
    id: 4,
    dbId: '11000000-0000-0000-0000-000000000004',
    title: 'Smash burger that actually slaps — Newtown\'s best kept secret',
    creator: 'tomreview',
    initials: 'TR',
    avatarBg: '#FAEEDA',
    avatarColor: '#854F0B',
    likes: '3.2k',
    imgKey: 'blue',
    tall: false,
    tags: ['burger', 'newtown', 'sydneyfood', 'hiddengem'],
    body: 'Double smash, american cheese, pickles, special sauce on a brioche bun. Simple done perfectly.',
    location: 'Patty Smith, Newtown',
    food: 5,
    vibe: 4,
    cost: 2,
  },
  {
    id: 5,
    dbId: '11000000-0000-0000-0000-000000000005',
    title: 'Melbourne\'s best omakase for under $100 — book months ahead',
    creator: 'foodwithfinn',
    initials: 'FF',
    avatarBg: '#F1EEFE',
    avatarColor: '#534AB7',
    likes: '5.7k',
    imgKey: 'pink',
    tall: false,
    tags: ['omakase', 'japanese', 'melbournefood', 'sushi'],
    body: '12 courses of absolute precision. Chef sources fish directly from Tsukiji twice a week.',
    location: 'Sushi Den, Melbourne CBD',
    food: 5,
    vibe: 5,
    cost: 4,
  },
  {
    id: 6,
    dbId: '11000000-0000-0000-0000-000000000006',
    title: 'Sydney brunch spot with zero wait — and the eggs benny are elite',
    creator: 'sarahleats',
    initials: 'SL',
    avatarBg: '#E6F1FB',
    avatarColor: '#185FA5',
    likes: '2.1k',
    imgKey: 'sage',
    tall: true,
    tags: ['brunch', 'sydneybrunch', 'eggs', 'redfern'],
    body: 'Most brunch spots in Surry Hills have 45-min waits. This one somehow doesn\'t and the food is better than most.',
    location: 'Brunch Club, Redfern',
    food: 4,
    vibe: 4,
    cost: 2,
  },
]

export const RESTAURANTS: Restaurant[] = [
  { name: 'Gaku Robata', suburb: 'Surry Hills, NSW' },
  { name: 'Lucky House Dumplings', suburb: 'Haymarket, NSW' },
  { name: 'Pasta Emilia', suburb: 'Surry Hills, NSW' },
  { name: 'Patty Smith Burgers', suburb: 'Newtown, NSW' },
  { name: 'Sushi Den', suburb: 'Melbourne CBD, VIC' },
  { name: 'Brunch Club', suburb: 'Redfern, NSW' },
  { name: 'Chin Chin', suburb: 'Sydney CBD, NSW' },
  { name: 'Hubert', suburb: 'Sydney CBD, NSW' },
  { name: 'Lune Croissanterie', suburb: 'Fitzroy, VIC' },
  { name: 'Tipo 00', suburb: 'Melbourne CBD, VIC' },
]

export const MY_CREATOR = 'sarahleats'
export const MY_INITIALS = 'SL'
export const MY_AVATAR_BG = '#E6F1FB'
export const MY_AVATAR_COLOR = '#185FA5'

export const IMG_KEYS = ['warm', 'green', 'blue', 'pink', 'clay', 'sage']
