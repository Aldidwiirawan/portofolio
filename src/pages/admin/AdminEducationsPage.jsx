import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { removeAssets } from '../../lib/storageUtils'
import { useEducations } from '../../hooks/useEducations'
import EducationForm from '../../components/admin/EducationForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus, Thumb } from '../../components/admin/ui/ContentList'
import { bySortOrder, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconCap } from '../../components/admin/ui/icons'
import { RowActions, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { useReorder } from '../../components/admin/ui/useReorder'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'
import { assetUrlsOf } from '../../components/admin/ui/useAssetFields'

/**
 * AdminEducationsPage Component (CRUD)
 * Allows owner/admin to manage academic credentials in public.educations:
 * - Read educations with period & active study status
 * - Create new education record
 * - Update existing education
 * - Delete education with custom confirmation modal
 */
function AdminEducationsPage() {
  return (
    <AdminRoot>
      <EducationsScreen />
    </AdminRoot>
  )
}

function EducationsScreen() {
  const { educations, isLoading, error, refetch } = useEducations({ includeAdminFields: true })

  // Display order: sort_order (Naik/Turun), latest start year first among equals
  const reorder = useReorder({ table: 'educations', onSaved: refetch })
  const sorted = useMemo(() => bySortOrder(educations, (a, b) => (b.start_year || 0) - (a.start_year || 0)), [educations])
  const ordered = reorder.arrange(sorted)
  const hiddenCount = educations.filter((e) => e.is_visible === false).length
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEdu, setEditingEdu] = useState(null)
  const [deletingEdu, setDeletingEdu] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const activeCount = educations.filter((e) => e.is_current).length

  const handleFormSuccess = (savedEdu) => {
    const isEdit = Boolean(editingEdu)
    setIsFormOpen(false)
    setEditingEdu(null)
    toast.success(
      isEdit
        ? `Perubahan pendidikan "${savedEdu.degree} — ${savedEdu.field_of_study}" disimpan.`
        : `Pendidikan "${savedEdu.degree} — ${savedEdu.field_of_study}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingEdu(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (edu) => {
    setEditingEdu(edu)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingEdu(null)
  }

  const handleOpenDeleteModal = (edu) => {
    setReturnToHeading(false)
    setDeletingEdu(edu)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingEdu(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingEdu) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('educations')
        .delete()
        .eq('id', deletingEdu.id)

      if (dbDeleteError) {
        throw new Error(
          dbDeleteError.message || 'Gagal menghapus data pendidikan dari database.'
        )
      }

      // Best-effort removal of the logo and the photos
      await removeAssets(assetUrlsOf(deletingEdu, ['logo_url'], ['photos']))

      if (editingEdu?.id === deletingEdu.id) {
        setEditingEdu(null)
        setIsFormOpen(false)
      }

      const deletedTitle = `${deletingEdu.degree} - ${deletingEdu.field_of_study} (${deletingEdu.institution})`
      setDeletingEdu(null)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Pendidikan "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus data pendidikan.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <SectionScreen
      title="Pendidikan"
      description="Riwayat sekolah dan kuliah. Halaman publik cukup menampilkan perguruan tinggi; sembunyikan yang lain."
      addLabel="Tambah pendidikan"
      onAdd={handleOpenCreateForm}
      count={educations.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Data pendidikan belum bisa dimuat."
      emptyTitle="Belum ada riwayat pendidikan"
      emptyText="Sekolah atau kampus yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah pendidikan pertama"
      summary={`${educations.length} riwayat pendidikan · ${activeCount} masih berjalan${hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}`}
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingEdu ? 'Ubah pendidikan' : 'Tambah pendidikan',
        description: editingEdu
          ? `Perbarui pendidikan "${editingEdu.degree} — ${editingEdu.field_of_study}", lalu simpan.`
          : 'Isi data pendidikan, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <EducationForm
            key={editingEdu?.id || 'new-education'}
            education={editingEdu}
            nextSortOrder={nextSortOrder(educations)}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingEdu),
        title: 'Hapus riwayat pendidikan?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Data pendidikan belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Pendidikan <strong>"{deletingEdu?.degree} — {deletingEdu?.field_of_study}"</strong> di {deletingEdu?.institution} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <ReorderStatus reorder={reorder} />
      <DataList label="Daftar riwayat pendidikan" aria-busy={isLoading || undefined}>
        {ordered.map((edu, index) => {
          const periodText = edu.is_current
            ? `${edu.start_year} — Sekarang`
            : edu.end_year
              ? `${edu.start_year} — ${edu.end_year}`
              : `${edu.start_year}`
          const name = `pendidikan "${edu.degree} — ${edu.field_of_study}"`

          return (
            <DataListItem
              key={edu.id}
              highlight={edu.is_current}
              media={<Thumb url={edu.logo_url} icon={IconCap} contain />}
              title={`${edu.degree} — ${edu.field_of_study}`}
              badges={
                <>
                  {edu.is_current && (
                    <Badge tone="success" dot>
                      Masih belajar
                    </Badge>
                  )}
                  <DisplayBadges item={edu} />
                </>
              }
              subtitle={edu.institution}
              meta={
                <>
                  <span>{periodText}</span>
                  {edu.gpa != null && <span>IPK {String(edu.gpa).replace('.', ',')}</span>}
                  {edu.thesis_title && <span>Tugas akhir: {edu.thesis_title}</span>}
                </>
              }
              actions={
                <>
                  <ReorderButtons reorder={reorder} list={ordered} index={index} name={name} />
                  <RowActions name={name} onEdit={() => handleOpenEditForm(edu)} onDelete={() => handleOpenDeleteModal(edu)} />
                </>
              }
            >
              {edu.description && <p className="adm-list-desc">{edu.description}</p>}
            </DataListItem>
          )
        })}
      </DataList>
    </SectionScreen>
  )
}

export default AdminEducationsPage
