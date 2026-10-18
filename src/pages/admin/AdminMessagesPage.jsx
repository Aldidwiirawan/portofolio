import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useMessages } from '../../hooks/useMessages'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useAdminShell } from '../../components/admin/ui/adminContexts'
import { Alert } from '../../components/admin/ui/Alert'
import { Button, ButtonLink } from '../../components/admin/ui/Button'
import { Badge } from '../../components/admin/ui/Card'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { ConfirmDialog, Dialog } from '../../components/admin/ui/Dialog'
import { EmptyState, Skeleton } from '../../components/admin/ui/Feedback'
import { QuickPicks } from '../../components/admin/ui/Field'
import { formatDateTime, formatRelativeDate } from '../../components/admin/ui/format'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconEye, IconMail, IconMailOpen, IconRefresh, IconReply, IconTrash } from '../../components/admin/ui/icons'
import { NoMatches } from '../../components/admin/ui/SectionScreen'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'
import './AdminMessagesPage.css'

/**
 * Helper: Formats timestamp into readable Indonesian DateTime
 * @param {string|null} dateStr
 * @returns {string}
 */
function formatMessageDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('id-ID', {
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
 * AdminMessagesPage Component (READ, UPDATE is_read, DELETE)
 * Allows owner/admin to manage messages submitted from contact form:
 * - View messages list with unread counter
 * - Filter by status (Semua, Belum Dibaca, Sudah Dibaca)
 * - Read detailed message in modal (auto-marks is_read = true)
 * - Toggle read/unread status
 * - Quick reply via email (mailto link)
 * - Delete message with confirmation modal
 * Screen: admin layout; detail and delete use dialogs (Escape is handled by them); the sidebar
 * badge is refreshed after a message is opened, marked or deleted.
 */
function AdminMessagesPage() {
  return (
    <AdminRoot>
      <MessagesScreen />
    </AdminRoot>
  )
}

function MessagesScreen() {
  const { messages, unreadCount, isLoading, error, refetch } = useMessages()
  // Screen only: toasts, focus after a delete, the sidebar's unread badge
  const { toast, headingRef, returnToHeading, setReturnToHeading } = useSectionScreen()
  const { refreshUnread } = useAdminShell()
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'unread' | 'read'
  const [viewingMessage, setViewingMessage] = useState(null)
  const [deletingMessage, setDeletingMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // Filtered messages
  const filteredMessages = useMemo(() => {
    if (filterStatus === 'unread') return messages.filter((m) => !m.is_read)
    if (filterStatus === 'read') return messages.filter((m) => m.is_read)
    return messages
  }, [messages, filterStatus])

  const handleOpenDetail = async (msg) => {
    setViewingMessage(msg)

    // Automatically mark as read if currently unread
    if (!msg.is_read) {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', msg.id)
        refetch()
        refreshUnread()
      } catch (ex) {
        console.warn('Gagal menandai pesan sebagai dibaca:', ex)
      }
    }
  }

  const handleToggleReadStatus = async (msg, e) => {
    e.stopPropagation()
    try {
      const nextRead = !msg.is_read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: nextRead })
        .eq('id', msg.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      toast.success(
        nextRead
          ? `Pesan dari "${msg.name}" ditandai sudah dibaca.`
          : `Pesan dari "${msg.name}" ditandai belum dibaca.`
      )
      refetch()
      refreshUnread()
    } catch (err) {
      console.warn('Gagal mengubah status baca:', err)
      toast.error('Status pesan belum bisa diubah. Periksa koneksi internet, lalu coba lagi.')
    }
  }

  const handleOpenDeleteModal = (msg, e) => {
    e.stopPropagation()
    setReturnToHeading(false)
    setDeletingMessage(msg)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingMessage(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingMessage) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', deletingMessage.id)

      if (dbDeleteError) {
        throw new Error(dbDeleteError.message || 'Gagal menghapus pesan.')
      }

      if (viewingMessage?.id === deletingMessage.id) {
        setViewingMessage(null)
      }

      const senderName = deletingMessage.name
      setDeletingMessage(null)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Pesan dari "${senderName}" dihapus.`)
      refetch()
      refreshUnread()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus pesan.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const readCount = messages.length - unreadCount
  const showSkeleton = isLoading && messages.length === 0
  const replyHref = (msg) =>
    `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || 'Pesan dari situs portofolio'}`)}`
  const openDetail = (msg) => {
    setReturnToHeading(false)
    handleOpenDetail(msg)
  }

  return (
    <AdminLayout
      title="Pesan"
      description="Pesan dari formulir kontak di halaman publik. Pesan yang Anda buka otomatis ditandai sudah dibaca."
      headingRef={headingRef}
      actions={
        <Button variant="secondary" icon={<IconRefresh size={18} />} onClick={refetch} loading={isLoading} loadingText="Memuat...">
          Muat ulang
        </Button>
      }
    >
      {showSkeleton && <Skeleton rows={3} label="Memuat pesan..." />}

      {!isLoading && error && (
        <Alert
          tone="danger"
          title="Pesan belum bisa dimuat."
          action={
            <Button size="sm" variant="secondary" icon={<IconRefresh size={16} />} onClick={refetch}>
              Coba lagi
            </Button>
          }
        >
          {toFriendlyError(error, 'Periksa koneksi internet, lalu coba lagi.')}
        </Alert>
      )}

      {!isLoading && !error && messages.length === 0 && (
        <EmptyState title="Belum ada pesan">Pesan dari formulir kontak di halaman publik akan muncul di sini.</EmptyState>
      )}

      {!showSkeleton && !error && messages.length > 0 && (
        <>
          <p className="adm-list-summary" aria-live="polite">
            {messages.length} pesan · {unreadCount} belum dibaca
          </p>
          <div className="adm-list-toolbar">
            <QuickPicks
              label="Tampilkan pesan"
              options={[
                { value: 'all', label: `Semua (${messages.length})` },
                { value: 'unread', label: `Belum dibaca (${unreadCount})` },
                { value: 'read', label: `Sudah dibaca (${readCount})` },
              ]}
              value={filterStatus}
              onPick={setFilterStatus}
            />
          </div>

          {filteredMessages.length === 0 ? (
            <NoMatches>{filterStatus === 'unread' ? 'Semua pesan sudah dibaca.' : 'Belum ada pesan yang sudah dibaca.'}</NoMatches>
          ) : (
            <DataList label="Daftar pesan" aria-busy={isLoading || undefined}>
              {filteredMessages.map((msg) => (
                <DataListItem
                  key={msg.id}
                  highlight={!msg.is_read}
                  title={msg.name}
                  badges={
                    (!msg.is_read || msg.topic) && (
                      <>
                        {!msg.is_read && (
                          <Badge tone="accent" dot>
                            Baru
                          </Badge>
                        )}
                        {msg.topic && (
                          <Badge>
                            <span className="adm-sr-only">Topik: </span>
                            {msg.topic}
                          </Badge>
                        )}
                      </>
                    )
                  }
                  subtitle={msg.subject || undefined}
                  meta={
                    <>
                      <span>{msg.email}</span>
                      <time dateTime={msg.created_at} title={formatDateTime(msg.created_at)}>
                        {formatRelativeDate(msg.created_at)}
                      </time>
                    </>
                  }
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<IconEye size={16} />}
                        onClick={() => openDetail(msg)}
                        aria-label={`Buka pesan dari ${msg.name}`}
                      >
                        Buka
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={msg.is_read ? <IconMail size={16} /> : <IconMailOpen size={16} />}
                        onClick={(e) => handleToggleReadStatus(msg, e)}
                        aria-label={`${msg.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}: pesan dari ${msg.name}`}
                      >
                        {msg.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="adm-btn--danger-text"
                        icon={<IconTrash size={16} />}
                        onClick={(e) => handleOpenDeleteModal(msg, e)}
                        aria-label={`Hapus pesan dari ${msg.name}`}
                      >
                        Hapus
                      </Button>
                    </>
                  }
                >
                  <p className="adm-list-desc adm-msg-snippet">{msg.message}</p>
                </DataListItem>
              ))}
            </DataList>
          )}
        </>
      )}

      <Dialog
        open={Boolean(viewingMessage)}
        onClose={() => setViewingMessage(null)}
        size="md"
        title={viewingMessage?.subject || (viewingMessage ? `Pesan dari ${viewingMessage.name}` : '')}
        description={viewingMessage?.subject ? `Dari ${viewingMessage.name}` : ''}
        returnFocusRef={returnToHeading ? headingRef : undefined}
        footer={
          viewingMessage && (
            <>
              <Button
                variant="ghost"
                className="adm-btn--danger-text adm-msg-delete"
                icon={<IconTrash size={18} />}
                onClick={(e) => handleOpenDeleteModal(viewingMessage, e)}
              >
                Hapus
              </Button>
              <Button variant="secondary" onClick={() => setViewingMessage(null)}>
                Tutup
              </Button>
              <ButtonLink href={replyHref(viewingMessage)} variant="primary" icon={<IconReply size={18} />}>
                Balas lewat email
              </ButtonLink>
            </>
          )
        }
      >
        {viewingMessage && (
          <>
            <dl className="adm-msg-meta">
              <div>
                <dt>Pengirim</dt>
                <dd>{viewingMessage.name}</dd>
              </div>
              {viewingMessage.topic && (
                <div>
                  <dt>Topik</dt>
                  <dd>{viewingMessage.topic}</dd>
                </div>
              )}
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${viewingMessage.email}`}>{viewingMessage.email}</a>
                </dd>
              </div>
              <div>
                <dt>Diterima</dt>
                <dd>{formatMessageDate(viewingMessage.created_at)}</dd>
              </div>
            </dl>
            <p className="adm-msg-body">{viewingMessage.message}</p>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingMessage)}
        title="Hapus pesan?"
        busy={isDeleting}
        error={deleteError ? toFriendlyError(deleteError, 'Pesan belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null}
        returnFocusRef={returnToHeading ? headingRef : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      >
        <p>
          Pesan dari <strong>"{deletingMessage?.name}"</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
        </p>
      </ConfirmDialog>
    </AdminLayout>
  )
}

export default AdminMessagesPage
