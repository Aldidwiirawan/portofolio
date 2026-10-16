import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useToast } from './adminContexts'
import { toFriendlyError } from './friendlyError'

/**
 * Display order of a content table, changed one step at a time with ReorderButtons.
 * The moved list shows at once (arrange()) and stays that way while the rows whose position
 * changed get their new sort_order (0..n-1 within the list) and `onSaved` reloads the data. If
 * saving fails the list falls back to the stored order. Focus stays on the pressed button and the
 * new position is announced (render <ReorderStatus>).
 * - locked: e.g. while a search filters the list (positions would be ambiguous)
 */
export function useReorder({ table, onSaved, locked = false }) {
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const focusAfter = useRef(null)

  useLayoutEffect(() => {
    if (!focusAfter.current) return
    document.getElementById(focusAfter.current)?.focus()
    focusAfter.current = null
  }, [order])

  const move = useCallback(
    async (list, index, delta, name) => {
      const to = index + delta
      if (saving || locked || to < 0 || to >= list.length) return
      const next = [...list]
      const [item] = next.splice(index, 1)
      next.splice(to, 0, item)
      focusAfter.current = `reorder-${item.id}-${delta < 0 ? 'up' : 'down'}`
      setOrder(next.map((x) => x.id))
      setSaving(true)
      setStatus(`${name} dipindah ke posisi ${to + 1} dari ${next.length}.`)

      const changes = next
        .map((x, position) => ({ id: x.id, before: Number(x.sort_order), sort_order: position }))
        .filter((x) => x.before !== x.sort_order)
      try {
        const results = await Promise.all(
          changes.map((x) => supabase.from(table).update({ sort_order: x.sort_order }).eq('id', x.id))
        )
        const failed = results.find((r) => r.error)
        if (failed) throw new Error(failed.error.message || 'Gagal menyimpan urutan.')
      } catch (err) {
        setOrder(null)
        setStatus('')
        toast.error(toFriendlyError(err, 'Urutan belum tersimpan. Periksa koneksi internet, lalu coba lagi.'))
      } finally {
        setSaving(false)
        onSaved?.()
      }
    },
    [saving, locked, table, onSaved, toast]
  )

  /** The list in the order chosen last (unchanged for another scope or after a failed save). */
  const arrange = useCallback(
    (list) => {
      if (!order) return list
      const position = new Map(order.map((id, i) => [id, i]))
      if (!list.every((x) => position.has(x.id))) return list
      return [...list].sort((a, b) => position.get(a.id) - position.get(b.id))
    },
    [order]
  )

  return { move, arrange, status, busy: saving, locked }
}
