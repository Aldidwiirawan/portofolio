import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AVATAR_COLORS, DEV_GUESTBOOK_MOCKS, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from './guestbookRules'

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
