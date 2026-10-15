import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useSkills } from '../../hooks/useSkills'
import SkillForm from '../../components/admin/SkillForm'
import { AdminRoot } from '../../components/admin/ui/AdminLayout'
import { Badge } from '../../components/admin/ui/Card'
import { DataList, DataListItem } from '../../components/admin/ui/DataList'
import { QuickPicks } from '../../components/admin/ui/Field'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { RowActions, SectionScreen } from '../../components/admin/ui/SectionScreen'
import { useSectionScreen } from '../../components/admin/ui/useSectionScreen'

/**
 * AdminSkillsPage Component (CRUD)
 * Allows owner/admin to manage technical skills stored in public.skills:
 * - Read skills with category grouping & filtering
 * - Create new skill
 * - Update existing skill
 * - Delete skill with confirmation modal
 */
function AdminSkillsPage() {
  return (
    <AdminRoot>
      <SkillsScreen />
    </AdminRoot>
  )
}

function SkillsScreen() {
  const { skills, isLoading, error, refetch } = useSkills()
  // Screen only: toasts, focus after a delete, guarded breadcrumb (Escape is handled by ConfirmDialog)
  const { toast, headingRef, returnToHeading, setReturnToHeading, guarded } = useSectionScreen()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [deletingSkill, setDeletingSkill] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Categories list for filter tabs
  const categories = useMemo(() => {
    const unique = new Set(skills.map((s) => s.category).filter(Boolean))
    return ['All', ...Array.from(unique)]
  }, [skills])

  // Filtered skills list
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return skills
    return skills.filter(
      (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [skills, selectedCategory])

  const handleFormSuccess = (savedSkill) => {
    const isEdit = Boolean(editingSkill)
    setIsFormOpen(false)
    setEditingSkill(null)
    toast.success(
      isEdit
        ? `Perubahan keahlian "${savedSkill.name}" disimpan.`
        : `Keahlian "${savedSkill.name}" ditambahkan.`
    )
    refetch()
  }

  const handleOpenCreateForm = () => {
    setEditingSkill(null)
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (skill) => {
    setEditingSkill(skill)
    setIsFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingSkill(null)
  }

  const handleOpenDeleteModal = (skill) => {
    setReturnToHeading(false)
    setDeletingSkill(skill)
    setDeleteError(null)
  }

  const handleCloseDeleteModal = () => {
    if (isDeleting) return
    setDeletingSkill(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSkill) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error: dbDeleteError } = await supabase
        .from('skills')
        .delete()
        .eq('id', deletingSkill.id)

      if (dbDeleteError) {
        throw new Error(dbDeleteError.message || 'Gagal menghapus skill dari database.')
      }

      if (editingSkill?.id === deletingSkill.id) {
        setEditingSkill(null)
        setIsFormOpen(false)
      }

      const deletedName = deletingSkill.name
      setDeletingSkill(null)
      // The row and its "Hapus" button disappear, so focus goes to the page heading
      setReturnToHeading(true)
      toast.success(`Keahlian "${deletedName}" dihapus.`)
      refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus skill.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // A category can disappear (its last skill deleted): then show all again
  const categoryShown = categories.includes(selectedCategory) ? selectedCategory : 'All'
  const shownSkills = categoryShown === selectedCategory ? filteredSkills : skills

  return (
    <SectionScreen
      title="Keahlian"
      description="Teknologi dan alat kerja yang tampil di halaman publik, dikelompokkan per kategori."
      addLabel="Tambah keahlian"
      onAdd={handleOpenCreateForm}
      count={skills.length}
      isLoading={isLoading}
      error={error}
      onReload={refetch}
      loadErrorTitle="Keahlian belum bisa dimuat."
      emptyTitle="Belum ada keahlian"
      emptyText="Keahlian yang Anda tambahkan akan tampil di halaman publik."
      emptyActionLabel="Tambah keahlian pertama"
      summary={`${skills.length} keahlian · ${Math.max(0, categories.length - 1)} kategori`}
      toolbar={
        <div className="adm-list-toolbar">
          <QuickPicks
            label="Tampilkan kategori"
            options={categories.map((cat) => ({ value: cat, label: cat === 'All' ? 'Semua' : cat }))}
            value={categoryShown}
            onPick={setSelectedCategory}
          />
        </div>
      }
      headingRef={headingRef}
      form={{
        open: isFormOpen,
        title: editingSkill ? 'Ubah keahlian' : 'Tambah keahlian',
        description: editingSkill ? `Perbarui keahlian "${editingSkill.name}", lalu simpan.` : 'Isi data keahlian, lalu simpan.',
        onBack: guarded(handleCancelForm),
        children: (
          <SkillForm
            key={editingSkill?.id || 'new-skill'}
            skill={editingSkill}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ),
      }}
      deleteDialog={{
        open: Boolean(deletingSkill),
        title: 'Hapus keahlian?',
        busy: isDeleting,
        error: deleteError ? toFriendlyError(deleteError, 'Keahlian belum bisa dihapus. Periksa koneksi internet, lalu coba lagi.') : null,
        returnFocusRef: returnToHeading ? headingRef : undefined,
        onConfirm: handleConfirmDelete,
        onCancel: handleCloseDeleteModal,
        children: (
          <p>
            Keahlian <strong>"{deletingSkill?.name}"</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        ),
      }}
    >
      <DataList
        label={categoryShown === 'All' ? 'Daftar keahlian' : `Keahlian kategori ${categoryShown}`}
        aria-busy={isLoading || undefined}
      >
        {shownSkills.map((skill) => (
          <DataListItem
            key={skill.id}
            title={skill.name}
            badges={
              <>
                <Badge>{skill.category}</Badge>
                {skill.proficiency && <Badge tone="accent">{skill.proficiency}</Badge>}
              </>
            }
            meta={<span>Urutan {skill.sort_order ?? 0}</span>}
            actions={
              <RowActions
                name={`keahlian "${skill.name}"`}
                onEdit={() => handleOpenEditForm(skill)}
                onDelete={() => handleOpenDeleteModal(skill)}
              />
            }
          />
        ))}
      </DataList>
    </SectionScreen>
  )
}

export default AdminSkillsPage
