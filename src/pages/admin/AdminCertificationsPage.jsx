import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useCertifications } from '../../hooks/useCertifications'
import CertificationForm from '../../components/admin/CertificationForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { NoMatches, RowActions, SearchBox, SectionScreen } from '../../components/admin/ui/SectionScreen'
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
  const { certifications, isLoading, error, refetch } = useCertifications()
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCert, setEditingCert] = useState(null)
  const [deletingCert, setDeletingCert] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered certifications
  const filteredCerts = useMemo(() => {
    if (!searchQuery.trim()) return certifications
    const query = searchQuery.toLowerCase()
    return certifications.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.issuer?.toLowerCase().includes(query)
    )
  }, [certifications, searchQuery])

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const withLink = certifications.filter((c) => Boolean(c.credential_url)).length

  return (
    <SectionScreen
      title="Sertifikat"
      description="Sertifikat, pelatihan, dan kursus yang tampil di halaman publik."
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
      summary={`${certifications.length} sertifikat · ${withLink} punya tautan`}
      toolbar={<SearchBox id="cert-search" label="Cari sertifikat" hint="Ketik nama sertifikat atau penerbitnya." value={searchQuery} onChange={setSearchQuery} />}
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
            Sertifikat <strong>"{deletingCert?.name}"</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      {filteredCerts.length === 0 ? (
        <NoMatches>Tidak ada sertifikat yang cocok dengan "{searchQuery}".</NoMatches>
      ) : (
        <DataList label="Daftar sertifikat" aria-busy={isLoading || undefined}>
          {filteredCerts.map((cert) => (
            <DataListItem
              key={cert.id}
              title={cert.name}
              subtitle={cert.issuer}
              meta={
                cert.issue_date || cert.credential_url ? (
                  <>
                    {cert.issue_date && <span>Terbit {formatDate(cert.issue_date)}</span>}
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                        Lihat sertifikat<span className="adm-sr-only"> (tab baru)</span>
                      </a>
                    )}
                  </>
                ) : null
              }
              actions={
                <RowActions
                  name={`sertifikat "${cert.name}"`}
                  onEdit={() => handleOpenEditForm(cert)}
                  onDelete={() => handleOpenDeleteModal(cert)}
                />
              }
            />
          ))}
        </DataList>
      )}
    </SectionScreen>
  )
}

export default AdminCertificationsPage
