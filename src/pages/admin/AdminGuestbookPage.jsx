import { useState } from 'react'
import { useGuestbook } from '../../hooks/useGuestbook'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useUnsavedChanges } from '../../components/admin/ui/adminContexts'
import { Alert } from '../../components/admin/ui/Alert'
import { Button } from '../../components/admin/ui/Button'
import { Badge } from '../../components/admin/ui/Card'
import { ConfirmDialog } from '../../components/admin/ui/Dialog'
import { EmptyState, Skeleton } from '../../components/admin/ui/Feedback'
import { Field, QuickPicks, Textarea } from '../../components/admin/ui/Field'
import { formatRelativeDate } from '../../components/admin/ui/format'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconRefresh, IconTrash } from '../../components/admin/ui/icons'
import { NoMatches } from '../../components/admin/ui/SectionScreen'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'
import './AdminGuestbookPage.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * AdminGuestbookPage Component
 * Manages public guestbook comments and replies
 * Screen: admin layout, shared toasts, delete through a dialog (was window.confirm), unsaved reply
 * text guarded when leaving.
 */
function AdminGuestbookPage() {
  return (
    <AdminRoot>
      <GuestbookScreen />
    </AdminRoot>
  )
}

function GuestbookScreen() {
  const { entries, totalCount, loading, error: loadError, replyEntry, deleteEntry, refresh } = useGuestbook()
  const [replyTexts, setReplyTexts] = useState({})
  const [savingId, setSavingId] = useState(null)

  // Screen only: shared toasts, focus after a delete, delete dialog, filter
  const { toast, headingRef, returnToHeading, setReturnToHeading } = useSectionScreen()
  const [deletingEntry, setDeletingEntry] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [filter, setFilter] = useState('all')

  const showToast = (type, msg) => {
    if (type === 'error') toast.error(toFriendlyError(msg, 'Belum bisa disimpan. Periksa koneksi internet, lalu coba lagi.'))
    else toast.success(msg)
  }

  // Typed replies that are not saved yet count as unsaved changes
  const replyDirty = Object.entries(replyTexts).some(
    ([id, text]) => text !== (entries.find((e) => e.id === id)?.admin_reply || '')
  )
  useUnsavedChanges(replyDirty)

  const handleReplyChange = (id, val) => {
    setReplyTexts((prev) => ({ ...prev, [id]: val }))
  }

  const handleSaveReply = async (id) => {
    const text = replyTexts[id] ?? entries.find((e) => e.id === id)?.admin_reply ?? ''
    if (!text.trim()) return

    setSavingId(id)
    try {
      await replyEntry(id, text.trim())
      showToast('success', 'Balasan disimpan dan tampil di buku tamu.')
    } catch (err) {
      showToast('error', err.message || 'Gagal menyimpan balasan.')
    } finally {
      setSavingId(null)
    }
  }

  // Runs after "Ya, hapus" in the dialog below (replaces window.confirm)
  const handleDelete = async (id) => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteEntry(id)
      // The entry and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      setDeletingEntry(null)
      showToast('success', 'Entri buku tamu dihapus.')
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus catatan.')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDelete = (entry) => {
    setReturnToHeading(false)
    setDeleteError(null)
    setDeletingEntry(entry)
  }

  const closeDelete = () => {
    if (isDeleting) return
    setDeletingEntry(null)
    setDeleteError(null)
  }

  const unreplied = entries.filter((e) => !e.admin_reply).length
  const shown =
    filter === 'unreplied' ? entries.filter((e) => !e.admin_reply) : filter === 'replied' ? entries.filter((e) => e.admin_reply) : entries
  const showSkeleton = loading && entries.length === 0

  return (
    <AdminLayout
      title="Buku tamu"
      description="Pesan publik dari pengunjung. Balasan Anda langsung tampil di halaman publik dengan tanda pemilik situs."
      headingRef={headingRef}
      actions={
        <Button variant="secondary" icon={<IconRefresh size={18} />} onClick={refresh} loading={loading} loadingText="Memuat...">
          Muat ulang
        </Button>
      }
    >
      {showSkeleton && <Skeleton rows={3} label="Memuat buku tamu..." />}

      {!loading && loadError && (
        <Alert
          tone="danger"
          title="Buku tamu belum bisa dimuat."
          action={
            <Button size="sm" variant="secondary" icon={<IconRefresh size={16} />} onClick={refresh}>
              Coba lagi
            </Button>
          }
        >
          {toFriendlyError(loadError, 'Periksa koneksi internet, lalu coba lagi.')}
        </Alert>
      )}

      {!loading && !loadError && entries.length === 0 && (
        <EmptyState title="Belum ada entri buku tamu">Entri dari pengunjung halaman publik akan muncul di sini.</EmptyState>
      )}

      {!showSkeleton && entries.length > 0 && (
        <>
          <p className="adm-list-summary" aria-live="polite">
            {totalCount} entri · {unreplied} belum dibalas
          </p>
          <div className="adm-list-toolbar">
            <QuickPicks
              label="Tampilkan entri"
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'unreplied', label: `Belum dibalas (${unreplied})` },
                { value: 'replied', label: `Sudah dibalas (${entries.length - unreplied})` },
              ]}
              value={filter}
              onPick={setFilter}
            />
          </div>

          {shown.length === 0 ? (
            <NoMatches>{filter === 'unreplied' ? 'Semua entri sudah dibalas.' : 'Belum ada entri yang dibalas.'}</NoMatches>
          ) : (
            <ul className="adm-gb-list" aria-label="Daftar entri buku tamu">
              {shown.map((entry) => {
                const initial = entry.name ? entry.name.charAt(0).toUpperCase() : '?'
                const currentReplyVal =
                  replyTexts[entry.id] !== undefined
                    ? replyTexts[entry.id]
                    : entry.admin_reply || ''
                const isSaving = savingId === entry.id

                return (
                  <li key={entry.id} className={`adm-gb-item${entry.admin_reply ? '' : ' is-unreplied'}`}>
                    <div className="adm-gb-head">
                      <span className="adm-gb-avatar" style={{ backgroundColor: entry.avatar_color || '#38bdf8' }} aria-hidden="true">
                        {initial}
                      </span>
                      <div className="adm-gb-who">
                        <h3 className="adm-gb-name">{entry.name}</h3>
                        <p className="adm-gb-meta">
                          <time dateTime={entry.created_at} title={formatDate(entry.created_at)}>
                            {formatRelativeDate(entry.created_at)}
                          </time>
                        </p>
                      </div>
                      <div className="adm-gb-badges">
                        {entry.is_pinned && <Badge tone="accent">Disematkan</Badge>}
                        {entry.admin_reply ? (
                          <Badge tone="success" dot>
                            Sudah dibalas
                          </Badge>
                        ) : (
                          <Badge>Belum dibalas</Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="adm-btn--danger-text adm-gb-delete"
                        icon={<IconTrash size={16} />}
                        onClick={() => openDelete(entry)}
                        aria-label={`Hapus entri dari ${entry.name}`}
                      >
                        Hapus
                      </Button>
                    </div>

                    <p className="adm-gb-message">{entry.message}</p>

                    <div className="adm-gb-reply">
                      <Field
                        id={`gb-reply-${entry.id}`}
                        label="Balasan Anda"
                        hint={
                          entry.admin_reply
                            ? `Dibalas ${formatRelativeDate(entry.admin_reply_at)}. Ubah teksnya lalu simpan untuk memperbarui.`
                            : 'Belum dibalas. Balasan tampil di bawah pesan ini di halaman publik.'
                        }
                      >
                        <Textarea
                          rows={2}
                          value={currentReplyVal}
                          onChange={(e) => handleReplyChange(entry.id, e.target.value)}
                          disabled={isSaving}
                        />
                      </Field>
                      <div className="adm-gb-reply-actions">
                        <Button
                          size="sm"
                          onClick={() => handleSaveReply(entry.id)}
                          loading={isSaving}
                          loadingText="Menyimpan..."
                          disabled={!currentReplyVal.trim() || currentReplyVal === (entry.admin_reply || '')}
                          aria-label={`${entry.admin_reply ? 'Perbarui' : 'Simpan'} balasan untuk ${entry.name}`}
                        >
                          {entry.admin_reply ? 'Perbarui balasan' : 'Simpan balasan'}
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(deletingEntry)}
        title="Hapus entri buku tamu?"
        busy={isDeleting}
        error={deleteError ? toFriendlyError(deleteError, 'Entri belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null}
        returnFocusRef={returnToHeading ? headingRef : undefined}
        onConfirm={() => handleDelete(deletingEntry.id)}
        onCancel={closeDelete}
      >
        <p>
          Entri dari <strong>"{deletingEntry?.name}"</strong> akan dihapus permanen dari halaman publik. Tindakan ini tidak bisa
          dibatalkan.
        </p>
      </ConfirmDialog>
    </AdminLayout>
  )
}

export default AdminGuestbookPage
