import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useLanguages } from '../../hooks/useLanguages'
import LanguageForm from '../../components/admin/LanguageForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus } from '../../components/admin/ui/ContentList'
import { bySortOrder, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { NoMatches, RowActions, SearchBox, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { useReorder } from '../../components/admin/ui/useReorder'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

/**
 * AdminLanguagesPage Component (CRUD)
 * Allows owner/admin to manage language proficiencies stored in public.languages
 */
function AdminLanguagesPage() {
  return (
    <AdminRoot>
      <LanguagesScreen />
    </AdminRoot>
  )
}

function LanguagesScreen() {
  const { languages, isLoading, error, refetch } = useLanguages({ includeAdminFields: true })
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLang, setEditingLang] = useState(null)
  const [deletingLang, setDeletingLang] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Display order: sort_order (Naik/Turun; not while searching), oldest first among equals
  const searching = Boolean(searchQuery.trim())
  const reorder = useReorder({ table: 'languages', onSaved: refetch, locked: searching })
  const sorted = useMemo(
    () => bySortOrder(languages, (a, b) => String(a.created_at || '').localeCompare(String(b.created_at || ''))),
    [languages]
  )
  const ordered = reorder.arrange(sorted)
  const hiddenCount = languages.filter((l) => l.is_visible === false).length

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return ordered
    const query = searchQuery.toLowerCase()
    return ordered.filter(
      (l) =>
        l.language_name?.toLowerCase().includes(query) ||
        l.proficiency_level?.toLowerCase().includes(query)
    )
  }, [ordered, searchQuery])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingLang)
    setIsFormOpen(false)
    setEditingLang(null)
    toast.success(
      isEdit
        ? `Perubahan bahasa "${saved.language_name}" disimpan.`
        : `Bahasa "${saved.language_name}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingLang(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setEditingLang(item)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingLang(null)
  }

  const handleOpenDeleteModal = (item) => {
    setReturnToHeading(false)
    setDeletingLang(item)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingLang(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingLang) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('languages')
        .delete()
        .eq('id', deletingLang.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus bahasa dari database.')
      }

      if (editingLang?.id === deletingLang.id) {
        setIsFormOpen(false)
        setEditingLang(null)
      }

      const deletedTitle = deletingLang.language_name
      setDeletingLang(null)
      setIsDeleting(false)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Bahasa "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus bahasa.'
      )
      setIsDeleting(false)
    }
  }

  // Badge tone per level (screen only)
  const proficiencyTone = (level) => {
    switch (String(level).trim().toLowerCase()) {
      case 'penutur asli':
        return 'success'
      case 'aktif':
      case 'mahir':
      case 'menengah':
        return 'accent'
      default:
        return 'neutral'
    }
  }

  return (
    <SectionScreen
      title="Bahasa"
      description="Bahasa yang Anda kuasai beserta tingkatnya, tampil di halaman publik."
      addLabel="Tambah bahasa"
      onAdd={handleOpenCreateForm}
      count={languages.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Bahasa belum bisa dimuat."
      emptyTitle="Belum ada bahasa"
      emptyText="Bahasa yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah bahasa pertama"
      summary={`${languages.length} bahasa${hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}`}
      toolbar={
        <SearchBox
          id="lang-search"
          label="Cari bahasa"
          hint={searching ? 'Kosongkan pencarian untuk mengatur urutan.' : 'Ketik nama bahasa atau tingkatnya.'}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      }
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingLang ? 'Ubah bahasa' : 'Tambah bahasa',
        description: editingLang ? `Perbarui bahasa "${editingLang.language_name}", lalu simpan.` : 'Isi data bahasa, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <LanguageForm
            key={editingLang?.id || 'new-lang'}
            language={editingLang}
            nextSortOrder={nextSortOrder(languages)}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingLang),
        title: 'Hapus bahasa?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Bahasa belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Bahasa <strong>"{deletingLang?.language_name}"</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <ReorderStatus reorder={reorder} />
      {filteredLanguages.length === 0 ? (
        <NoMatches>Tidak ada bahasa yang cocok dengan "{searchQuery}".</NoMatches>
      ) : (
        <DataList label="Daftar bahasa" aria-busy={isLoading || undefined}>
          {filteredLanguages.map((item, index) => (
            <DataListItem
              key={item.id}
              title={item.language_name}
              badges={
                <>
                  {item.proficiency_level && <Badge tone={proficiencyTone(item.proficiency_level)}>{item.proficiency_level}</Badge>}
                  <DisplayBadges item={item} />
                </>
              }
              actions={
                <>
                  <ReorderButtons reorder={reorder} list={filteredLanguages} index={index} name={`bahasa "${item.language_name}"`} />
                  <RowActions
                    name={`bahasa "${item.language_name}"`}
                    onEdit={() => handleOpenEditForm(item)}
                    onDelete={() => handleOpenDeleteModal(item)}
                  />
                </>
              }
            />
          ))}
        </DataList>
      )}
    </SectionScreen>
  )
}

export default AdminLanguagesPage
