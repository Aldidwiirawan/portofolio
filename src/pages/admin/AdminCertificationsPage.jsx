import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { removeAssets } from '../../lib/storageUtils'
import { useCertifications } from '../../hooks/useCertifications'
import CertificationForm from '../../components/admin/CertificationForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DisplayBadges, ReorderButtons, ReorderStatus, Thumb } from '../../components/admin/ui/ContentList'
import { bySortOrder, CERTIFICATE_CATEGORIES, certificateValidity, labelOf, nextSortOrder } from '../../components/admin/ui/contentLabels'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconAward } from '../../components/admin/ui/icons'
import { NoMatches, RowActions, SearchBox, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { useReorder } from '../../components/admin/ui/useReorder'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

/**
 * AdminCertificationsPage Component (CRUD)
 * Allows owner/admin to manage certifications stored in public.certifications
 */
function AdminCertificationsPage() {
  return (
    <AdminRoot>
      <CertificationsScreen />
    </AdminRoot>
  )
}

function CertificationsScreen() {
  const { certifications, isLoading, error, refetch } = useCertifications({ includeAdminFields: true })
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCert, setEditingCert] = useState(null)
  const [deletingCert, setDeletingCert] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered certifications
  // Display order: sort_order (Naik/Turun; not while searching), newest first among equals
  const searching = Boolean(searchQuery.trim())
  const reorder = useReorder({ table: 'certifications', onSaved: refetch, locked: searching })
  const sorted = useMemo(
    () => bySortOrder(certifications, (a, b) => String(b.issue_date || '').localeCompare(String(a.issue_date || ''))),
    [certifications]
  )
  const ordered = reorder.arrange(sorted)

  const filteredCerts = useMemo(() => {
    if (!searchQuery.trim()) return ordered
    const query = searchQuery.toLowerCase()
    return ordered.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.issuer?.toLowerCase().includes(query)
    )
  }, [ordered, searchQuery])

  const handleFormSuccess = (saved) => {
    const isEdit = Boolean(editingCert)
    setIsFormOpen(false)
    setEditingCert(null)
    toast.success(
      isEdit
        ? `Perubahan sertifikat "${saved.name}" disimpan.`
        : `Sertifikat "${saved.name}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingCert(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (cert) => {
    setEditingCert(cert)
    setIsFormOpen(true)
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingCert(null)
  }

  const handleOpenDeleteModal = (cert) => {
    setReturnToHeading(false)
    setDeletingCert(cert)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingCert(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCert) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbError } = await supabase
        .from('certifications')
        .delete()
        .eq('id', deletingCert.id)

      if (dbError) {
        throw new Error(dbError.message || 'Gagal menghapus sertifikasi dari database.')
      }

      // Best-effort removal of the certificate image and PDF
      await removeAssets([deletingCert.image_url, deletingCert.pdf_url])

      if (editingCert?.id === deletingCert.id) {
        setIsFormOpen(false)
        setEditingCert(null)
      }

      const deletedTitle = deletingCert.name
      setDeletingCert(null)
      setIsDeleting(false)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Sertifikat "${deletedTitle}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus sertifikasi.'
      )
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const featuredCount = certifications.filter((c) => c.is_featured).length
  const hiddenCount = certifications.filter((c) => c.is_visible === false).length
  const withoutImage = certifications.filter((c) => !c.image_url).length

  return (
    <SectionScreen
      title="Sertifikat"
      description="Sertifikat, pelatihan, dan kursus. Pilih 3–6 sertifikat unggulan untuk halaman publik; sisanya cukup di LinkedIn."
      addLabel="Tambah sertifikat"
      onAdd={handleOpenCreateForm}
      count={certifications.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Sertifikat belum bisa dimuat."
      emptyTitle="Belum ada sertifikat"
      emptyText="Sertifikat, pelatihan, atau kursus yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah sertifikat pertama"
      summary={`${certifications.length} sertifikat · ${featuredCount} unggulan${withoutImage > 0 ? ` · ${withoutImage} belum punya gambar` : ''}${hiddenCount > 0 ? ` · ${hiddenCount} disembunyikan` : ''}`}
      toolbar={
        <SearchBox
          id="cert-search"
          label="Cari sertifikat"
          hint={searching ? 'Kosongkan pencarian untuk mengatur urutan.' : 'Ketik nama sertifikat atau penerbitnya.'}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      }
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingCert ? 'Ubah sertifikat' : 'Tambah sertifikat',
        description: editingCert ? `Perbarui sertifikat "${editingCert.name}", lalu simpan.` : 'Isi data sertifikat, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <CertificationForm
            key={editingCert?.id || 'new-cert'}
            certification={editingCert}
            nextSortOrder={nextSortOrder(certifications)}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingCert),
        title: 'Hapus sertifikat?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Sertifikat belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Sertifikat <strong>"{deletingCert?.name}"</strong> akan dihapus permanen
            {deletingCert?.image_url || deletingCert?.pdf_url ? ' beserta gambar dan PDF-nya' : ''}. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <ReorderStatus reorder={reorder} />
      {filteredCerts.length === 0 ? (
        <NoMatches>Tidak ada sertifikat yang cocok dengan "{searchQuery}".</NoMatches>
      ) : (
        <DataList label="Daftar sertifikat" aria-busy={isLoading || undefined}>
          {filteredCerts.map((cert, index) => {
            const validity = certificateValidity(cert)
            const category = labelOf(CERTIFICATE_CATEGORIES, cert.category)
            const name = `sertifikat "${cert.name}"`
            return (
              <DataListItem
                key={cert.id}
                highlight={cert.is_featured}
                media={<Thumb url={cert.image_url} icon={IconAward} />}
                title={cert.name}
                badges={
                  <>
                    {category && <Badge>{category}</Badge>}
                    {validity.label && <Badge tone={validity.tone}>{validity.label}</Badge>}
                    <DisplayBadges item={cert} />
                  </>
                }
                subtitle={cert.issuer}
                meta={
                  <>
                    {cert.issue_date && <span>Terbit {formatDate(cert.issue_date)}</span>}
                    {cert.score && <span>Skor {cert.score}</span>}
                    {cert.credential_id && <span>No. {cert.credential_id}</span>}
                    {cert.pdf_url && (
                      <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                        PDF<span className="adm-sr-only"> {cert.name} (tab baru)</span>
                      </a>
                    )}
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                        Verifikasi<span className="adm-sr-only"> {cert.name} (tab baru)</span>
                      </a>
                    )}
                  </>
                }
                actions={
                  <>
                    <ReorderButtons reorder={reorder} list={filteredCerts} index={index} name={name} />
                    <RowActions name={name} onEdit={() => handleOpenEditForm(cert)} onDelete={() => handleOpenDeleteModal(cert)} />
                  </>
                }
              />
            )
          })}
        </DataList>
      )}
    </SectionScreen>
  )
}

export default AdminCertificationsPage
