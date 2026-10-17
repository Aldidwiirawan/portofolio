import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { removeAssets } from '../../lib/storageUtils'
import { useProjects } from '../../hooks/useProjects'
import ProjectForm from '../../components/admin/ProjectForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus, Thumb } from '../../components/admin/ui/ContentList'
import { PROJECT_STATUSES, PROJECT_TYPES, bySortOrder, labelOf, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { formatDateTime } from '../../components/admin/ui/format'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { RowActions, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { assetUrlsOf, normalizeGallery } from '../../components/admin/ui/useAssetFields'
import { useReorder } from '../../components/admin/ui/useReorder'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

// Status badges: finished work in green, work in progress in blue, ideas neutral
const STATUS_TONE = { production: 'success', completed: 'success', final_project: 'accent', in_development: 'accent', concept: 'neutral' }

/**
 * AdminProjectsPage Component (READ, CREATE, UPDATE, DELETE)
 * Provides comprehensive portfolio project management for owner/admin:
 * 1. Fetches projects from public.projects via Supabase client.
 * 2. Allows inserting and updating projects via controlled ProjectForm with validation.
 * 3. Supports safe deletion of projects with custom confirmation modal and thumbnail cleanup.
 * Screen: SectionScreen; the form replaces the list as a full panel ("Proyek / Tambah proyek").
 */
function AdminProjectsPage() {
  return (
    <AdminRoot>
      <ProjectsScreen />
    </AdminRoot>
  )
}

function ProjectsScreen() {
  const { projects, isLoading, error, refetch } = useProjects({ includeAdminFields: true })
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const featuredCount = projects.filter((p) => p.is_featured).length
  const hiddenCount = projects.filter((p) => p.is_visible === false).length

  // Display order of the admin list: sort_order (Naik/Turun), newest first among equals
  const reorder = useReorder({ table: 'projects', onSaved: refetch })
  const sorted = useMemo(
    () => bySortOrder(projects, (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))),
    [projects]
  )
  const ordered = reorder.arrange(sorted)

  const handleFormSuccess = (savedProject) => {
    const isEdit = Boolean(editingProject)
    setIsFormOpen(false)
    setEditingProject(null)
    toast.success(
      isEdit
        ? `Perubahan proyek "${savedProject.title}" disimpan.`
        : `Proyek "${savedProject.title}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingProject(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingProject(null)
  }

  const handleOpenDeleteModal = (project) => {
    setReturnToHeading(false)
    setDeletingProject(project)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingProject(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingProject) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      // 1. Delete project from public.projects
      const { error: dbDeleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', deletingProject.id)

      if (dbDeleteError) {
        throw new Error(dbDeleteError.message || 'Gagal menghapus project dari database.')
      }

      // 2. Best-effort storage cleanup of the cover image and the gallery screenshots
      await removeAssets(assetUrlsOf(deletingProject, ['thumbnail_url'], ['gallery']))

      // 3. Close edit form if current deleted project was being edited
      if (editingProject?.id === deletingProject.id) {
        setEditingProject(null)
        setIsFormOpen(false)
      }

      const deletedTitle = deletingProject.title
      setDeletingProject(null)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Proyek "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus project.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <SectionScreen
      title="Proyek"
      description="Proyek untuk halaman publik. Pilih 3–4 proyek unggulan sebagai studi kasus, lalu atur urutannya dengan Naik dan Turun."
      addLabel="Tambah proyek"
      onAdd={handleOpenCreateForm}
      count={projects.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Proyek belum bisa dimuat."
      emptyTitle="Belum ada proyek"
      emptyText="Proyek yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah proyek pertama"
      summary={`${projects.length} proyek · ${featuredCount} unggulan${hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}`}
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingProject ? 'Ubah proyek' : 'Tambah proyek',
        description: editingProject ? `Perbarui isi proyek "${editingProject.title}", lalu simpan.` : 'Isi data proyek, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <ProjectForm
            key={editingProject?.id || 'new-project'}
            project={editingProject}
            nextSortOrder={nextSortOrder(projects)}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingProject),
        title: 'Hapus proyek?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Proyek belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Proyek <strong>"{deletingProject?.title}"</strong> akan dihapus permanen
            {deletingProject && assetUrlsOf(deletingProject, ['thumbnail_url'], ['gallery']).length > 0
              ? ' beserta gambar sampul dan screenshot-nya'
              : ''}
            . Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <ReorderStatus reorder={reorder} />
      <DataList label="Daftar proyek" aria-busy={isLoading || undefined}>
        {ordered.map((project, index) => {
          const techList = Array.isArray(project.tech_stack) ? project.tech_stack : []
          const shots = normalizeGallery(project.gallery).length
          const status = labelOf(PROJECT_STATUSES, project.status)
          const name = `proyek "${project.title}"`

          return (
            <DataListItem
              key={project.id}
              highlight={project.is_featured}
              media={<Thumb url={project.thumbnail_url} />}
              title={project.title}
              badges={
                <>
                  {status && <Badge tone={STATUS_TONE[project.status]}>{status}</Badge>}
                  <DisplayBadges item={project} />
                </>
              }
              subtitle={project.description || 'Belum ada deskripsi singkat.'}
              meta={
                <>
                  {project.year && <span>{project.year}</span>}
                  {project.project_type && <span>{labelOf(PROJECT_TYPES, project.project_type)}</span>}
                  {project.client_name && <span>{project.client_name}</span>}
                  {shots > 0 && <span>{shots} screenshot</span>}
                  {project.slug && <span>/projects/{project.slug}</span>}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      Demo<span className="adm-sr-only"> (tab baru)</span>
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      Kode<span className="adm-sr-only"> (tab baru)</span>
                    </a>
                  )}
                  {project.is_repo_private && <span>Repo privat</span>}
                  {project.created_at && (
                    <time dateTime={project.created_at} title={formatDateTime(project.created_at)}>
                      Ditambahkan{' '}
                      {new Date(project.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                </>
              }
              actions={
                <>
                  <ReorderButtons reorder={reorder} list={ordered} index={index} name={name} />
                  <RowActions name={name} onEdit={() => handleOpenEditForm(project)} onDelete={() => handleOpenDeleteModal(project)} />
                </>
              }
            >
              {techList.length > 0 && (
                <ul className="adm-tags" aria-label="Teknologi">
                  {techList.map((tech) => (
                    <li key={tech} className="adm-tag">
                      {tech}
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

export default AdminProjectsPage
