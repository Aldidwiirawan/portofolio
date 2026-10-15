import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAchievements } from '../../hooks/useAchievements'
import AchievementForm from '../../components/admin/AchievementForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { NoMatches, RowActions, SearchBox, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

/**
 * AdminAchievementsPage Component (CRUD)
 * Allows owner/admin to manage achievements stored in public.achievements
 */
function AdminAchievementsPage() {
  return (
    <AdminRoot>
      <AchievementsScreen />
    </AdminRoot>
  )
}

function AchievementsScreen() {
  const { achievements, isLoading, error, refetch } = useAchievements()
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAchieve, setEditingAchieve] = useState(null)
  const [deletingAchieve, setDeletingAchieve] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return achievements
    const query = searchQuery.toLowerCase()
    return achievements.filter(
      (a) =>
        a.title?.toLowerCase().includes(query) ||
        a.event_name?.toLowerCase().includes(query) ||
        String(a.year).includes(query)
    )
  }, [achievements, searchQuery])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingAchieve)
    setIsFormOpen(false)
    setEditingAchieve(null)
    toast.success(
      isEdit
        ? `Perubahan prestasi "${saved.title}" disimpan.`
        : `Prestasi "${saved.title}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingAchieve(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setEditingAchieve(item)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingAchieve(null)
  }

  const handleOpenDeleteModal = (item) => {
    setReturnToHeading(false)
    setDeletingAchieve(item)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingAchieve(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingAchieve) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('achievements')
        .delete()
        .eq('id', deletingAchieve.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus pencapaian dari database.')
      }

      if (editingAchieve?.id === deletingAchieve.id) {
        setIsFormOpen(false)
        setEditingAchieve(null)
      }

      const deletedTitle = deletingAchieve.title
      setDeletingAchieve(null)
      setIsDeleting(false)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Prestasi "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus pencapaian.'
      )
      setIsDeleting(false)
    }
  }

  return (
    <SectionScreen
      title="Prestasi"
      description="Juara lomba dan penghargaan yang tampil di halaman publik."
      addLabel="Tambah prestasi"
      onAdd={handleOpenCreateForm}
      count={achievements.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Prestasi belum bisa dimuat."
      emptyTitle="Belum ada prestasi"
      emptyText="Juara lomba atau penghargaan yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah prestasi pertama"
      summary={`${achievements.length} prestasi`}
      toolbar={<SearchBox id="achieve-search" label="Cari prestasi" hint="Ketik judul, nama acara, atau tahun." value={searchQuery} onChange={setSearchQuery} />}
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingAchieve ? 'Ubah prestasi' : 'Tambah prestasi',
        description: editingAchieve ? `Perbarui prestasi "${editingAchieve.title}", lalu simpan.` : 'Isi data prestasi, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <AchievementForm
            key={editingAchieve?.id || 'new-achieve'}
            achievement={editingAchieve}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingAchieve),
        title: 'Hapus prestasi?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Prestasi belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Prestasi <strong>"{deletingAchieve?.title}"</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      {filteredItems.length === 0 ? (
        <NoMatches>Tidak ada prestasi yang cocok dengan "{searchQuery}".</NoMatches>
      ) : (
        <DataList label="Daftar prestasi" aria-busy={isLoading || undefined}>
          {filteredItems.map((item) => (
            <DataListItem
              key={item.id}
              title={item.title}
              badges={<Badge>{item.year}</Badge>}
              subtitle={item.event_name}
              actions={
                <RowActions
                  name={`prestasi "${item.title}"`}
                  onEdit={() => handleOpenEditForm(item)}
                  onDelete={() => handleOpenDeleteModal(item)}
                />
              }
            >
              {item.description && <p className="adm-list-desc">{item.description}</p>}
            </DataListItem>
          ))}
        </DataList>
      )}
    </SectionScreen>
  )
}

export default AdminAchievementsPage
