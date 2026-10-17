import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { removeAssets } from '../../lib/storageUtils'
import { useExperiences } from '../../hooks/useExperiences'
import { useProjects } from '../../hooks/useProjects'
import ExperienceForm from '../../components/admin/ExperienceForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus, Thumb } from '../../components/admin/ui/ContentList'
import { bySortOrder, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { formatPeriod } from '../../components/admin/ui/format'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconBriefcase } from '../../components/admin/ui/icons'
import { RowActions, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { assetUrlsOf, normalizeGallery } from '../../components/admin/ui/useAssetFields'
import { useReorder } from '../../components/admin/ui/useReorder'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

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
  const { experiences, isLoading, error, refetch } = useExperiences({ includeAdminFields: true })
  // Project titles for "Proyek terkait" (same public query as the projects list)
  const { projects } = useProjects()
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExp, setEditingExp] = useState(null)
  const [deletingExp, setDeletingExp] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const activeCount = experiences.filter((e) => e.is_current).length
  const featuredCount = experiences.filter((e) => e.is_featured).length
  const hiddenCount = experiences.filter((e) => e.is_visible === false).length

  // Display order: sort_order (Naik/Turun), most recent start first among equals
  const reorder = useReorder({ table: 'experiences', onSaved: refetch })
  const sorted = useMemo(
    () => bySortOrder(experiences, (a, b) => String(b.start_date || '').localeCompare(String(a.start_date || ''))),
    [experiences]
  )
  const ordered = reorder.arrange(sorted)
  const projectTitle = (id) => projects.find((p) => p.id === id)?.title

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

      // Best-effort removal of the logo and the photos
      await removeAssets(assetUrlsOf(deletingExp, ['logo_url'], ['photos']))

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
      description="Riwayat magang, kerja, freelance, dan organisasi. Pilih 2–4 pengalaman unggulan untuk halaman publik."
      addLabel="Tambah pengalaman"
      onAdd={handleOpenCreateForm}
      count={experiences.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Pengalaman belum bisa dimuat."
      emptyTitle="Belum ada pengalaman"
      emptyText="Pengalaman magang, kerja, freelance, atau organisasi yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah pengalaman pertama"
      summary={`${experiences.length} pengalaman · ${activeCount} masih berjalan · ${featuredCount} unggulan${hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}`}
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
            projects={projects}
            nextSortOrder={nextSortOrder(experiences)}
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
            Pengalaman <strong>"{deletingExp?.role} di {deletingExp?.company}"</strong> akan dihapus permanen
            {deletingExp && assetUrlsOf(deletingExp, ['logo_url'], ['photos']).length > 0 ? ' beserta logo dan fotonya' : ''}. Tindakan ini tidak
            bisa dibatalkan.
          </p>
        ),
      }}
    >
      <ReorderStatus reorder={reorder} />
      <DataList label="Daftar pengalaman" aria-busy={isLoading || undefined}>
        {ordered.map((exp, index) => {
          const name = `pengalaman "${exp.role} di ${exp.company}"`
          const tasks = Array.isArray(exp.responsibilities) ? exp.responsibilities.length : 0
          const photoCount = normalizeGallery(exp.photos).length
          const tags = Array.isArray(exp.skill_tags) ? exp.skill_tags : []
          const project = exp.related_project_id ? projectTitle(exp.related_project_id) : null

          return (
            <DataListItem
              key={exp.id}
              highlight={exp.is_featured}
              media={<Thumb url={exp.logo_url} icon={IconBriefcase} contain />}
              title={exp.role}
              badges={
                <>
                  <Badge>{exp.experience_type || 'Kerja'}</Badge>
                  {exp.is_current && (
                    <Badge tone="success" dot>
                      Masih berjalan
                    </Badge>
                  )}
                  <DisplayBadges item={exp} />
                </>
              }
              subtitle={[exp.company, exp.location].filter(Boolean).join(' · ')}
              meta={
                <>
                  <span>{formatPeriod(exp.start_date, exp.end_date, exp.is_current)}</span>
                  <span>{tasks > 0 ? `${tasks} poin tugas` : 'Belum ada poin tugas'}</span>
                  {photoCount > 0 && <span>{photoCount} foto</span>}
                  {project && <span>Proyek: {project}</span>}
                </>
              }
              actions={
                <>
                  <ReorderButtons reorder={reorder} list={ordered} index={index} name={name} />
                  <RowActions name={name} onEdit={() => handleOpenEditForm(exp)} onDelete={() => handleOpenDeleteModal(exp)} />
                </>
              }
            >
              {exp.description && <p className="adm-list-desc">{exp.description}</p>}
              {tags.length > 0 && (
                <ul className="adm-tags" aria-label="Tag keahlian">
                  {tags.map((tag) => (
                    <li key={tag} className="adm-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </DataListItem>
          )
        })}
      </DataList>
    </SectionScreen>
  )
}

export default AdminExperiencesPage
