// Rules of the guestbook shared by the admin hook (useGuestbook) and the public one (usePublicGuestbook).

// Sample entries shown only in development when the guestbook table is unavailable
export const DEV_GUESTBOOK_MOCKS = [
  {
    id: 'mock-gb-1',
    name: 'Duta Fithra Qolby',
    message: 'Keren banget websitenya bang! Desain dan animasinya sangat modern dan rapi 🔥',
    avatar_color: '#38bdf8',
    is_pinned: true,
    admin_reply: 'Makasih banyak sudah mampir dan ninggalin jejak bang! 🙌 Sukses selalu.',
    admin_reply_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'mock-gb-2',
    name: 'Priscilla Leza',
    message: 'Suka banget sama visual card dan detail portofolionya, keliatan niat banget dibuatnya!',
    avatar_color: '#34d399',
    is_pinned: false,
    admin_reply: 'Terima kasih banyak ya! Senang bisa bermanfaat ✨',
    admin_reply_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const AVATAR_COLORS = [
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald
  '#818cf8', // Indigo
  '#f472b6', // Pink
  '#fbbf24', // Amber
  '#a78bfa', // Purple
  '#2dd4bf', // Teal
]

// Must match the CHECK constraints in the guestbook migration
export const MAX_NAME_LENGTH = 100
export const MAX_MESSAGE_LENGTH = 240
