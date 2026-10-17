import { useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { removeAssets } from '../../lib/storageUtils'
import { useProjects } from '../../hooks/useProjects'
import ProjectForm from '../../components/admin/ProjectForm'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useLeaveGuard, useToast } from '../../components/admin/ui/adminContexts'
import { Alert } from '../../components/admin/ui/Alert'
import { Button } from '../../components/admin/ui/Button'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus, Thumb } from '../../components/admin/ui/ContentList'
import { PROJECT_STATUSES, PROJECT_TYPES, bySortOrder, labelOf, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { ConfirmDialog } from '../../components/admin/ui/Dialog'
import { EmptyState, Skeleton } from '../../components/admin/ui/Feedback'
import { formatDateTime } from '../../components/admin/ui/format'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconPencil, IconPlus, IconRefresh, IconTrash } from '../../components/admin/ui/icons'
import { assetUrlsOf, normalizeGallery } from '../../components/admin/ui/useAssetFields'
import { useReorder } from '../../components/admin/ui/useReorder'

// Status badges: finished work in green, work in progress in blue, ideas neutral
const STATUS_TONE = { production: 'success', completed: 'success', final_project: 'accent', in_development: 'accent', concept: 'neutral' }

/**
 * AdminProjectsPage Component (READ, CREATE, UPDATE, DELETE)
 * Provides comprehensive portfolio project management for owner/admin:
 * 1. Fetches projects from public.projects via Supabase client.
 * 2. Allows inserting and updating projects via controlled ProjectForm with validation.
 * 3. Supports safe deletion of projects with custom confirmation modal and thumbnail cleanup.
 * Screen: admin layout; the form replaces the list as a full panel ("Proyek / Tambah proyek").
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

  // Screen only: toasts, unsaved-changes guard for the breadcrumb, focus target after a delete
  // (Escape on the delete dialog is handled by ConfirmDialog)
  const toast = useToast()
  const { confirmLeave } = useLeaveGuard()
  const headingRef = useRef(null)
  const [returnToHeading, setReturnToHeading] = useState(false)

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

  const backToList = async () => {
    if (await confirmLeave()) handleCancelForm()
  }

  if (isFormOpen) {
    const isEdit = Boolean(editingProject)
    return (
      <AdminLayout
        title={isEdit ? 'Ubah proyek' : 'Tambah proyek'}
        description={
          isEdit
            ? `Perbarui isi proyek "${editingProject.title}", lalu simpan.`
            : 'Isi data proyek, lalu simpan.'
        }
        breadcrumb={[{ label: 'Proyek', onClick: backToList }]}
        headingRef={headingRef}
      >
        <ProjectForm
          key={editingProject?.id || 'new-project'}
          project={editingProject}
          nextSortOrder={nextSortOrder(projects)}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      </AdminLayout>
    )
  }

  // While reloading after a save or delete, keep the list on screen instead of the skeleton
  const showSkeleton = isLoading && projects.length === 0

  return (
    <AdminLayout
      title="Proyek"
      description="Proyek untuk halaman publik. Pilih 3–4 proyek unggulan sebagai studi kasus, lalu atur urutannya dengan Naik dan Turun."
      headingRef={headingRef}
      actions={
        <>
          <Button variant="secondary" icon={<IconRefresh size={18} />} onClick={refetch} loading={isLoading} loadingText="Memuat...">
            Muat ulang
          </Button>
          <Button icon={<IconPlus size={18} />} onClick={handleOpenCreateForm}>
            Tambah proyek
          </Button>
        </>
      }
    >
      {showSkeleton && <Skeleton rows={3} label="Memuat daftar proyek..." />}

      {!isLoading && error && (
        <Alert
          tone="danger"
          title="Proyek belum bisa dimuat."
          action={
            <Button size="sm" variant="secondary" icon={<IconRefresh size={16} />} onClick={refetch}>
              Coba lagi
            </Button>
          }
        >
          {toFriendlyError(error, 'Periksa koneksi internet, lalu coba lagi.')}
        </Alert>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <EmptyState
          title="Belum ada proyek"
          action={
            <Button icon={<IconPlus size={18} />} onClick={handleOpenCreateForm}>
              Tambah proyek pertama
            </Button>
          }
        >
          Proyek yang Anda tambahkan akan tampil di halaman publik.
        </EmptyState>
      )}

      {!showSkeleton && !error && projects.length > 0 && (
        <>
          <p className="adm-list-summary" aria-live="polite">
            {projects.length} proyek · {featuredCount} unggulan
            {hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}
          </p>
          <ReorderStatus reorder={reorder} />
          <DataList label="Daftar proyek" aria-busy={isLoading || undefined}>
            {ordered.map((project, index) => {
              const techList = Array.isArray(project.tech_stack) ? project.tech_stack : []
              const shots = normalizeGallery(project.gallery).length
              const status = labelOf(PROJECT_STATUSES, project.status)

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
                      <ReorderButtons reorder={reorder} list={ordered} index={index} name={`proyek "${project.title}"`} />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<IconPencil size={16} />}
                        onClick={() => handleOpenEditForm(project)}
                        aria-label={`Ubah proyek "${project.title}"`}
                      >
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="adm-btn--danger-text"
                        icon={<IconTrash size={16} />}
                        onClick={() => handleOpenDeleteModal(project)}
                        aria-label={`Hapus proyek "${project.title}"`}
                      >
                        Hapus
                      </Button>
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
        </>
      )}

      <ConfirmDialog
        open={Boolean(deletingProject)}
        title="Hapus proyek?"
        busy={isDeleting}
        error={deleteError ? toFriendlyError(deleteError, 'Proyek belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null}
        returnFocusRef={returnToHeading ? headingRef : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      >
        <p>
          Proyek <strong>"{deletingProject?.title}"</strong> akan dihapus permanen
          {deletingProject && assetUrlsOf(deletingProject, ['thumbnail_url'], ['gallery']).length > 0
            ? ' beserta gambar sampul dan screenshot-nya'
            : ''}
          . Tindakan ini tidak bisa dibatalkan.
        </p>
      </ConfirmDialog>
    </AdminLayout>
  )
}

export default AdminProjectsPage
