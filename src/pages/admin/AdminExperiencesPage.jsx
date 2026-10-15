import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useExperiences } from '../../hooks/useExperiences'
import ExperienceForm from '../../components/admin/ExperienceForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { RowActions, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

/**
 * Helper: Formats ISO date (YYYY-MM-DD) into Indonesian Month & Year
 * @param {string|null} dateStr
 * @returns {string}
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * AdminExperiencesPage Component (CRUD)
 * Allows owner/admin to manage professional & academic experiences in public.experiences:
 * - Read experiences with period & active status indicators
 * - Create new experience
 * - Update existing experience
 * - Delete experience with custom confirmation modal
 */
function AdminExperiencesPage() {
  return (
    <AdminRoot>
      <ExperiencesScreen />
    </AdminRoot>
  )
}

function ExperiencesScreen() {
  const { experiences, isLoading, error, refetch } = useExperiences()
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [deletingExp, setDeletingExp] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const activeCount = experiences.filter((e) => e.is_current).length

  const handleFormSuccess = (savedExp) => {
    const isEdit = Boolean(editingExp)
    setIsFormOpen(false)
    setEditingExp(null)
    toast.success(
      isEdit
        ? `Perubahan pengalaman "${savedExp.role}" di ${savedExp.company} disimpan.`
        : `Pengalaman "${savedExp.role}" di ${savedExp.company} ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingExp(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (exp) => {
    setEditingExp(exp)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingExp(null)
  }

  const handleOpenDeleteModal = (exp) => {
    setReturnToHeading(false)
    setDeletingExp(exp)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingExp(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingExp) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', deletingExp.id)

      if (dbDeleteError) {
        throw new Error(
          dbDeleteError.message || 'Gagal menghapus pengalaman dari database.'
        )
      }

      if (editingExp?.id === deletingExp.id) {
        setEditingExp(null)
        setIsFormOpen(false)
      }

      const deletedTitle = `${deletingExp.role} di ${deletingExp.company}`
      setDeletingExp(null)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Pengalaman "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus pengalaman.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <SectionScreen
      title="Pengalaman"
      description="Riwayat kerja, magang, dan PKL yang tampil di halaman publik."
      addLabel="Tambah pengalaman"
      onAdd={handleOpenCreateForm}
      count={experiences.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Pengalaman belum bisa dimuat."
      emptyTitle="Belum ada pengalaman"
      emptyText="Pengalaman kerja, magang, atau PKL yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah pengalaman pertama"
      summary={`${experiences.length} pengalaman · ${activeCount} masih berjalan`}
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingExp ? 'Ubah pengalaman' : 'Tambah pengalaman',
        description: editingExp
          ? `Perbarui pengalaman "${editingExp.role}" di ${editingExp.company}, lalu simpan.`
          : 'Isi data pengalaman, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <ExperienceForm
            key={editingExp?.id || 'new-experience'}
            experience={editingExp}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingExp),
        title: 'Hapus pengalaman?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Pengalaman belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Pengalaman <strong>"{deletingExp?.role} di {deletingExp?.company}"</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <DataList label="Daftar pengalaman" aria-busy={isLoading || undefined}>
        {experiences.map((exp) => {
          const periodText = exp.is_current
            ? `${formatDateDisplay(exp.start_date)} — Sekarang`
            : `${formatDateDisplay(exp.start_date)} — ${formatDateDisplay(exp.end_date) || 'Selesai'}`

          return (
            <DataListItem
              key={exp.id}
              highlight={exp.is_current}
              title={exp.role}
              badges={
                <>
                  <Badge>{exp.experience_type || 'Kerja'}</Badge>
                  {exp.is_current && (
                    <Badge tone="success" dot>
                      Masih berjalan
                    </Badge>
                  )}
                </>
              }
              subtitle={[exp.company, exp.location].filter(Boolean).join(' · ')}
              meta={
                <>
                  <span>{periodText}</span>
                  <span>Urutan {exp.sort_order ?? 0}</span>
                </>
              }
              actions={
                <RowActions
                  name={`pengalaman "${exp.role} di ${exp.company}"`}
                  onEdit={() => handleOpenEditForm(exp)}
                  onDelete={() => handleOpenDeleteModal(exp)}
                />
              }
            >
              {exp.description && <p className="adm-list-desc">{exp.description}</p>}
            </DataListItem>
          )
        })}
      </DataList>
    </SectionScreen>
  )
}

export default AdminExperiencesPage
