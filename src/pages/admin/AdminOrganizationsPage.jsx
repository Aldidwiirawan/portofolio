import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { removeAssets } from '../../lib/storageUtils'
import { useOrganizations } from '../../hooks/useOrganizations'
import OrganizationForm from '../../components/admin/OrganizationForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus, Thumb } from '../../components/admin/ui/ContentList'
import { bySortOrder, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { NoMatches, RowActions, SearchBox, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { IconUsers } from '../../components/admin/ui/icons'
import { useReorder } from '../../components/admin/ui/useReorder'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

/**
 * AdminOrganizationsPage Component (CRUD)
 * Allows owner/admin to manage organizations stored in public.organizations
 */
function AdminOrganizationsPage() {
  return (
    <AdminRoot>
      <OrganizationsScreen />
    </AdminRoot>
  )
}

function OrganizationsScreen() {
  const { organizations, isLoading, error, refetch } = useOrganizations({ includeAdminFields: true })
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [deletingOrg, setDeletingOrg] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Display order: sort_order (Naik/Turun; not while searching), latest start first among equals
  const searching = Boolean(searchQuery.trim())
  const reorder = useReorder({ table: 'organizations', onSaved: refetch, locked: searching })
  const sorted = useMemo(
    () => bySortOrder(organizations, (a, b) => String(b.start_date || '').localeCompare(String(a.start_date || ''))),
    [organizations]
  )
  const ordered = reorder.arrange(sorted)
  const hiddenCount = organizations.filter((o) => o.is_visible === false).length

  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return ordered
    const query = searchQuery.toLowerCase()
    return ordered.filter(
      (o) =>
        o.name?.toLowerCase().includes(query) ||
        o.role?.toLowerCase().includes(query)
    )
  }, [ordered, searchQuery])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingOrg)
    setIsFormOpen(false)
    setEditingOrg(null)
    toast.success(
      isEdit
        ? `Perubahan organisasi "${saved.name}" disimpan.`
        : `Organisasi "${saved.name}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingOrg(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (item) => {
    setEditingOrg(item)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingOrg(null)
  }

  const handleOpenDeleteModal = (item) => {
    setReturnToHeading(false)
    setDeletingOrg(item)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingOrg(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingOrg) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', deletingOrg.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus organisasi dari database.')
      }

      // Best-effort removal of the logo or photo
      await removeAssets([deletingOrg.logo_url])

      if (editingOrg?.id === deletingOrg.id) {
        setIsFormOpen(false)
        setEditingOrg(null)
      }

      const deletedTitle = deletingOrg.name
      setDeletingOrg(null)
      setIsDeleting(false)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Organisasi "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus organisasi.'
      )
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <SectionScreen
      title="Organisasi"
      description="Organisasi, komunitas, dan kepanitiaan yang tampil di halaman publik."
      addLabel="Tambah organisasi"
      onAdd={handleOpenCreateForm}
      count={organizations.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Organisasi belum bisa dimuat."
      emptyTitle="Belum ada organisasi"
      emptyText="Organisasi atau kepanitiaan yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah organisasi pertama"
      summary={`${organizations.length} organisasi${hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}`}
      toolbar={
        <SearchBox
          id="org-search"
          label="Cari organisasi"
          hint={searching ? 'Kosongkan pencarian untuk mengatur urutan.' : 'Ketik nama organisasi atau jabatan.'}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      }
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingOrg ? 'Ubah organisasi' : 'Tambah organisasi',
        description: editingOrg ? `Perbarui organisasi "${editingOrg.name}", lalu simpan.` : 'Isi data organisasi, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <OrganizationForm
            key={editingOrg?.id || 'new-org'}
            organization={editingOrg}
            nextSortOrder={nextSortOrder(organizations)}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingOrg),
        title: 'Hapus organisasi?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Organisasi belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Organisasi <strong>"{deletingOrg?.name}"</strong> akan dihapus permanen
            {deletingOrg?.logo_url ? ' beserta logonya' : ''}. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <ReorderStatus reorder={reorder} />
      {filteredOrgs.length === 0 ? (
        <NoMatches>Tidak ada organisasi yang cocok dengan "{searchQuery}".</NoMatches>
      ) : (
        <DataList label="Daftar organisasi" aria-busy={isLoading || undefined}>
          {filteredOrgs.map((item, index) => {
            const startText = formatDate(item.start_date)
            const endText = item.end_date ? formatDate(item.end_date) : 'Sekarang'
            const ongoing = Boolean(item.start_date) && !item.end_date

            return (
              <DataListItem
                key={item.id}
                highlight={ongoing}
                media={<Thumb url={item.logo_url} icon={IconUsers} contain />}
                title={item.name}
                badges={
                  <>
                    {ongoing && (
                      <Badge tone="success" dot>
                        Masih aktif
                      </Badge>
                    )}
                    <DisplayBadges item={item} />
                  </>
                }
                subtitle={item.role}
                meta={startText ? <span>{startText} — {endText}</span> : null}
                actions={
                  <>
                    <ReorderButtons reorder={reorder} list={filteredOrgs} index={index} name={`organisasi "${item.name}"`} />
                    <RowActions
                      name={`organisasi "${item.name}"`}
                      onEdit={() => handleOpenEditForm(item)}
                      onDelete={() => handleOpenDeleteModal(item)}
                    />
                  </>
                }
              >
                {item.description && <p className="adm-list-desc">{item.description}</p>}
              </DataListItem>
            )
          })}
        </DataList>
      )}
    </SectionScreen>
  )
}

export default AdminOrganizationsPage
