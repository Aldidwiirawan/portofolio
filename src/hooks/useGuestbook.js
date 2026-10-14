import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// Sample entries shown only in development when the guestbook table is unavailable
const DEV_GUESTBOOK_MOCKS = [
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

const AVATAR_COLORS = [
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald
  '#818cf8', // Indigo
  '#f472b6', // Pink
  '#fbbf24', // Amber
  '#a78bfa', // Purple
  '#2dd4bf', // Teal
]

// Must match the CHECK constraints in the guestbook migration
const MAX_NAME_LENGTH = 100
const MAX_MESSAGE_LENGTH = 240

/**
 * Hook for managing public guestbook entries.
 * addEntry, replyEntry and deleteEntry only touch local state after Supabase succeeds,
 * and throw an Error with a user-facing message when it fails.
 */
export function useGuestbook() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadEntries() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('guestbooks')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (fetchErr) {
          throw new Error(fetchErr.message)
        }

        setEntries(data ?? [])
      } catch (err) {
        if (!isMounted) return
        if (import.meta.env.DEV) {
          console.warn('Guestbook unavailable, using dev mock data:', err.message)
          setEntries(DEV_GUESTBOOK_MOCKS)
        } else {
          setEntries([])
        }
        setError('Gagal memuat buku tamu.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEntries()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  /**
   * Public submission of a new guestbook note
   */
  const addEntry = async ({ name, message }) => {
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      throw new Error('Nama dan pesan wajib diisi.')
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw new Error(`Nama maksimal ${MAX_NAME_LENGTH} karakter.`)
    }
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.`)
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    // admin_reply, is_pinned and created_at are left to database defaults (enforced by RLS)
    const { data, error: insertErr } = await supabase
      .from('guestbooks')
      .insert([{ name: trimmedName, message: trimmedMessage, avatar_color: randomColor }])
      .select()
      .single()

    if (insertErr) {
      console.error('Guestbook insert failed:', insertErr.message)
      throw new Error('Gagal mengirim pesan. Silakan coba lagi nanti.')
    }

    setEntries((prev) => [data, ...prev])
    return data
  }

  /**
   * Admin reply to an entry
   */
  const replyEntry = async (id, replyText) => {
    const { data, error: updateErr } = await supabase
      .from('guestbooks')
      .update({
        admin_reply: replyText,
        admin_reply_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      console.error('Guestbook reply failed:', updateErr.message)
      throw new Error(`Gagal menyimpan balasan: ${updateErr.message}`)
    }

    setEntries((prev) => prev.map((e) => (e.id === id ? data : e)))
    return data
  }

  /**
   * Admin delete an entry
   */
  const deleteEntry = async (id) => {
    // select() returns the deleted rows, so an RLS-blocked delete (0 rows) is detected too
    const { data, error: delErr } = await supabase
      .from('guestbooks')
      .delete()
      .eq('id', id)
      .select('id')

    if (delErr) {
      console.error('Guestbook delete failed:', delErr.message)
      throw new Error(`Gagal menghapus catatan: ${delErr.message}`)
    }
    if (!data || data.length === 0) {
      throw new Error('Gagal menghapus catatan: data tidak ditemukan atau akses ditolak.')
    }

    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return {
    entries,
    totalCount: entries.length,
    loading,
    error,
    addEntry,
    replyEntry,
    deleteEntry,
    refresh,
  }
}
