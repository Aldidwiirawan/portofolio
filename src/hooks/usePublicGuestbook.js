import { useEffect, useState } from 'react'
import { afterFirstPaint } from '../lib/afterFirstPaint'
import { restInsert, restSelect } from '../lib/publicApi'
import { AVATAR_COLORS, DEV_GUESTBOOK_MOCKS, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from './guestbookRules'

/**
 * The guestbook of the public pages (stage 3C): the same reading order and the same new-entry rules as
 * the admin's useGuestbook, through lib/publicApi.js (no supabase-js). Only reading and adding; replies
 * and deleting stay in the admin.
 * @returns {{ entries: Array<Object>, totalCount: number, loading: boolean, error: string | null,
 *   addEntry: ({ name, message }) => Promise<Object> }} addEntry throws an Error with a user-facing message
 */
export function usePublicGuestbook() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    // Requested right after the first paint, like the rest of the public data
    const cancel = afterFirstPaint(() =>
      restSelect('guestbooks', { columns: '*', order: [['is_pinned', { ascending: false }], ['created_at', { ascending: false }]] }).then(
        ({ data, error: fetchErr }) => {
          if (!isMounted) return
          if (fetchErr) {
            if (import.meta.env.DEV) {
              console.warn('Guestbook unavailable, using dev mock data:', fetchErr.message)
              setEntries(DEV_GUESTBOOK_MOCKS)
            }
            setError('Gagal memuat buku tamu.')
          } else {
            setEntries(data ?? [])
          }
          setLoading(false)
        }
      )
    )
    return () => {
      isMounted = false
      cancel()
    }
  }, [])

  const addEntry = async ({ name, message }) => {
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()
    if (!trimmedName || !trimmedMessage) throw new Error('Nama dan pesan wajib diisi.')
    if (trimmedName.length > MAX_NAME_LENGTH) throw new Error(`Nama maksimal ${MAX_NAME_LENGTH} karakter.`)
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) throw new Error(`Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.`)

    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    // admin_reply, is_pinned and created_at are left to database defaults (enforced by RLS)
    const { data, error: insertErr } = await restInsert(
      'guestbooks',
      { name: trimmedName, message: trimmedMessage, avatar_color: avatarColor },
      { returnRow: true }
    )
    if (insertErr || !data) {
      if (import.meta.env.DEV) console.error('Guestbook insert failed:', insertErr?.message)
      throw new Error('Gagal mengirim pesan. Silakan coba lagi nanti.')
    }
    setEntries((prev) => [data, ...prev])
    return data
  }

  return { entries, totalCount: entries.length, loading, error, addEntry }
}
