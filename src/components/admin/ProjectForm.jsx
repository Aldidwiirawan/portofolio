import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { GalleryUpload, ImageField } from './ui/AssetUpload'
import { PROJECT_STATUSES, PROJECT_TYPES } from './ui/contentLabels'
import { Checkbox, Field, FormSection, Input, Select, Textarea } from './ui/Field'
import { cleanList } from './ui/formValues'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { ListInput } from './ui/ListInput'
import { DisplaySettings } from './ui/Switch'
import { prepareUploads, useAssetField, useGalleryField } from './ui/useAssetFields'
import { useFormScreen } from './ui/useFormFeedback'

// Columns returned after saving (same as the admin list reads)
const PROJECT_COLUMNS =
  'id, title, slug, description, content, thumbnail_url, demo_url, github_url, tech_stack, is_featured, sort_order, created_at, updated_at, gallery, status, year, project_type, client_name, my_role, problem, solution, outcome, is_repo_private, is_visible'

const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: THIS_YEAR + 1 - 2010 + 1 }, (_, i) => String(THIS_YEAR + 1 - i))

/**
 * Helper: Converts text into a clean URL-friendly slug
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse spaces and underscores to hyphens
    .replace(/^-+|-+$/g, '') // trim leading and trailing hyphens
}

/**
 * Helper: Checks if a string is a valid web URL
 * @param {string} string
 * @returns {boolean}
 */
function isValidUrl(string) {
  if (!string || string.trim() === '') return true
  try {
    const url = new URL(string.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * ProjectForm Component
 * Input validation, cover image and gallery uploads, and explicit INSERT or UPDATE into
 * public.projects. Supports both CREATE and UPDATE modes.
 * Screen: admin form panel (sections, visible labels, errors under each field, unsaved-changes
 * guard, "Menyimpan..." and a short success state on the save button).
 *
 * @param {Object} props
 * @param {Object|null} [props.project] - Existing project data if editing, or null if creating
 * @param {number} [props.nextSortOrder] - Position of a new project (end of the list)
 * @param {(savedProject: Object) => void} props.onSuccess - Callback on successful insert or update
 * @param {() => void} props.onCancel - Callback on cancel button click
 */
function ProjectForm({ project = null, nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(project?.id)

  const [formData, setFormData] = useState(() => ({
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    content: project?.content || '',
    status: project?.status || '',
    project_type: project?.project_type || '',
    year: project?.year ? String(project.year) : '',
    client_name: project?.client_name || '',
    my_role: project?.my_role || '',
    problem: project?.problem || '',
    solution: project?.solution || '',
    outcome: project?.outcome || '',
    tech_stack: Array.isArray(project?.tech_stack) ? project.tech_stack : [],
    demo_url: project?.demo_url || '',
    github_url: project?.github_url || '',
    is_repo_private: Boolean(project?.is_repo_private),
    is_visible: project?.is_visible ?? true,
    is_featured: Boolean(project?.is_featured),
  }))
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditMode)

  // Cover image (projects/) and gallery screenshots (gallery/), uploaded when saving
  const cover = useAssetField(project?.thumbnail_url, { folder: 'projects' })
  const gallery = useGalleryField(project?.gallery, { max: 5 })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: cover.dirty || gallery.dirty })
  const { finish } = screen

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError('')
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  // Handle title change and auto-generate slug if not manually customized
  const handleTitleChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({ ...prev, title: val, slug: isSlugManuallyEdited ? prev.slug : slugify(val) }))
    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: null }))
  }

  // Handle manual slug input
  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true)
    set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
  }

  // Validate form inputs before submission
  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Judul proyek wajib diisi.'
    }

    const trimmedSlug = formData.slug.trim()
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!trimmedSlug) {
      errors.slug = 'Alamat singkat wajib diisi.'
    } else if (!slugRegex.test(trimmedSlug)) {
      errors.slug = 'Alamat singkat hanya boleh berisi huruf kecil, angka, dan tanda hubung (-), tanpa spasi.'
    }

    if (!formData.description.trim()) {
      errors.description = 'Deskripsi singkat wajib diisi.'
    }

    if (formData.demo_url.trim() && !isValidUrl(formData.demo_url)) {
      errors.demo_url = 'Tautan demo harus diawali http:// atau https://.'
    }
    if (formData.github_url.trim() && !isValidUrl(formData.github_url)) {
      errors.github_url = 'Tautan kode harus diawali http:// atau https://.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }
    if (cover.busy || gallery.busy) {
      setGeneralError('Tunggu sebentar, gambar yang dipilih masih diproses.')
      return
    }

    setIsSubmitting(true)

    // 1. Upload the new cover and screenshots (removed again if anything below fails)
    let uploads
    try {
      uploads = await prepareUploads({ thumbnail_url: cover, gallery })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah gambar.')
      setIsSubmitting(false)
      return
    }

    // 2. Prepare controlled and explicit payload (no id, no timestamps)
    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      content: formData.content.trim() ? formData.content.trim() : null,
      thumbnail_url: uploads.values.thumbnail_url,
      demo_url: formData.demo_url.trim() ? formData.demo_url.trim() : null,
      github_url: formData.github_url.trim() ? formData.github_url.trim() : null,
      tech_stack: cleanList(formData.tech_stack),
      is_featured: Boolean(formData.is_featured),
      gallery: uploads.values.gallery,
      status: formData.status || null,
      year: formData.year ? Number(formData.year) : null,
      project_type: formData.project_type || null,
      client_name: formData.client_name.trim() || null,
      my_role: formData.my_role.trim() || null,
      problem: formData.problem.trim() || null,
      solution: formData.solution.trim() || null,
      outcome: formData.outcome.trim() || null,
      is_repo_private: Boolean(formData.is_repo_private),
      is_visible: Boolean(formData.is_visible),
    }
    // A new project goes to the end of the list; the order is changed with Naik/Turun in the list
    if (!isEditMode) payload.sort_order = nextSortOrder

    // 3. Execute database mutation (UPDATE or INSERT)
    try {
      const query = isEditMode
        ? supabase.from('projects').update(payload).eq('id', project.id)
        : supabase.from('projects').insert(payload)

      const { data, error: dbError } = await query.select(PROJECT_COLUMNS).single()

      if (dbError) {
        // Orphan file cleanup: remove the newly uploaded files if the DB operation fails
        await uploads.rollback()

        // Handle unique constraint duplicate slug error (PostgreSQL error code 23505)
        if (
          dbError.code === '23505' ||
          dbError.message?.toLowerCase().includes('slug') ||
          dbError.message?.toLowerCase().includes('duplicate')
        ) {
          setGeneralError('Alamat singkat ini sudah dipakai proyek lain. Ganti dengan alamat lain.')
          setFieldErrors((prev) => ({
            ...prev,
            slug: 'Alamat singkat ini sudah dipakai proyek lain.',
          }))
        } else {
          setGeneralError(dbError.message || (isEditMode ? 'Gagal memperbarui project.' : 'Gagal menyimpan project ke database.'))
        }
        setIsSubmitting(false)
        return
      }

      // 4. Best-effort cleanup of replaced or removed images
      await uploads.cleanup()

      setIsSubmitting(false)
      finish(() => onSuccess(data))
    } catch (err) {
      await uploads.rollback()
      setGeneralError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem yang tidak terduga saat menyimpan data.')
      setIsSubmitting(false)
    }
  }

  const saveError = generalError
    ? toFriendlyError(
        generalError,
        isEditMode
          ? 'Perubahan belum tersimpan. Periksa koneksi internet, lalu coba lagi.'
          : 'Proyek belum tersimpan. Periksa koneksi internet, lalu coba lagi.'
      )
    : ''
  const busy = isSubmitting || screen.saved
  const input = (name) => ({ name, value: formData[name], onChange: handleChange, disabled: busy })

  return (
    <FormPanel
      label={isEditMode ? 'Ubah proyek' : 'Proyek baru'}
      screen={screen}
      error={saveError}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan proyek'}
    >
      <FormSection title="Informasi utama">
        <Field id="project-title" label="Judul proyek" required error={fieldErrors.title}>
          <Input type="text" placeholder="Contoh: Aplikasi Kasir UMKM" name="title" value={formData.title} onChange={handleTitleChange} disabled={busy} />
        </Field>
        <Field
          id="project-slug"
          label="Alamat singkat"
          required
          error={fieldErrors.slug}
          hint={
            <>
              Dipakai di alamat halaman proyek: <span className="adm-code">/projects/{formData.slug || 'alamat-singkat'}</span>.
              {isEditMode ? ' Hanya huruf kecil, angka, dan tanda hubung.' : ' Dibuat otomatis dari judul; boleh diubah.'}
            </>
          }
        >
          <Input type="text" autoComplete="off" spellCheck={false} name="slug" value={formData.slug} onChange={handleSlugChange} disabled={busy} />
        </Field>
        <Field id="project-desc" label="Deskripsi singkat" required error={fieldErrors.description} hint="Satu atau dua kalimat yang tampil di kartu proyek.">
          <Textarea rows={3} {...input('description')} />
        </Field>
        <Field id="project-content" label="Penjelasan lengkap" optional hint="Latar belakang, fitur, atau cara kerja proyek.">
          <Textarea rows={6} {...input('content')} />
        </Field>
      </FormSection>

      <FormSection title="Detail proyek" columns={2}>
        <Field id="project-status" label="Status" optional hint="Kondisi proyek saat ini.">
          <Select {...input('status')}>
            <option value="">Belum dipilih</option>
            {PROJECT_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="project-type" label="Jenis" optional>
          <Select {...input('project_type')}>
            <option value="">Belum dipilih</option>
            {PROJECT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="project-year" label="Tahun" optional hint="Tahun proyek selesai atau terakhir dikerjakan.">
          <Select {...input('year')}>
            <option value="">Belum dipilih</option>
            {(formData.year && !YEARS.includes(formData.year) ? [formData.year, ...YEARS] : YEARS).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="project-client" label="Klien atau instansi" optional hint="Untuk siapa proyek ini dibuat, misalnya Toko Makmur.">
          <Input type="text" {...input('client_name')} />
        </Field>
        <Field
          id="project-role"
          label="Peran saya"
          optional
          className="adm-span-2"
          hint="Bagian yang Anda kerjakan, misalnya Full-stack developer: merancang database dan membuat API."
        >
          <Input type="text" {...input('my_role')} />
        </Field>
      </FormSection>

      <FormSection title="Studi kasus" description="Opsional. Ringkas saja; isi hanya yang benar-benar Anda ketahui.">
        <Field id="project-problem" label="Masalah" optional hint="Masalah apa yang diselesaikan? Contoh: pencatatan penjualan masih manual di buku.">
          <Textarea rows={3} {...input('problem')} />
        </Field>
        <Field id="project-solution" label="Solusi" optional hint="Apa yang Anda bangun dan bagaimana caranya.">
          <Textarea rows={3} {...input('solution')} />
        </Field>
        <Field id="project-outcome" label="Hasil" optional hint="Dampak yang terlihat. Tulis angka hanya kalau memang ada datanya.">
          <Textarea rows={3} {...input('outcome')} />
        </Field>
      </FormSection>

      <FormSection title="Teknologi dan tautan" columns={2}>
        <div className="adm-span-2">
          <ListInput
            id="project-tech"
            label="Teknologi yang dipakai"
            optional
            value={formData.tech_stack}
            onChange={(items) => set('tech_stack', items)}
            max={15}
            itemLabel="Teknologi"
            addLabel="Tambah teknologi"
            placeholder="Contoh: Laravel"
            maxLength={40}
            hint="Urutkan dari yang paling utama."
            disabled={busy}
          />
        </div>
        <Field id="project-demo" label="Tautan demo" optional error={fieldErrors.demo_url}>
          <Input type="url" inputMode="url" placeholder="https://" {...input('demo_url')} />
        </Field>
        <Field id="project-github" label="Tautan kode" optional error={fieldErrors.github_url} hint="Misalnya halaman GitHub proyek.">
          <Input type="url" inputMode="url" placeholder="https://github.com/" {...input('github_url')} />
        </Field>
        <Checkbox
          id="project-private"
          className="adm-span-2"
          label="Repo privat"
          description="Kodenya tidak bisa dibuka publik. Halaman publik menampilkan keterangan “Repo privat”, bukan tombol kode."
          checked={formData.is_repo_private}
          onChange={(e) => set('is_repo_private', e.target.checked)}
          disabled={busy}
        />
      </FormSection>

      <FormSection title="Gambar">
        <ImageField
          id="project-thumb-upload"
          label="Gambar sampul"
          field={cover}
          hint="Tampil di kartu proyek. PNG, JPG, atau WebP sampai 10 MB; otomatis dikecilkan sebelum diunggah."
          disabled={busy}
        />
        <GalleryUpload
          id="project-gallery"
          label="Galeri screenshot"
          field={gallery}
          altName={formData.title.trim()}
          captionPlaceholder="Contoh: Halaman kasir"
          hint="Sampai 5 gambar. Urutan di sini menjadi urutan tampil."
          disabled={busy}
        />
      </FormSection>

      <DisplaySettings
        idPrefix="project"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        featured={formData.is_featured}
        onFeaturedChange={(value) => set('is_featured', value)}
        featuredLabel="Proyek unggulan"
        featuredDescription="Tampil sebagai studi kasus di halaman publik. Pilih 3–4 proyek terbaik."
        disabled={busy}
      />
    </FormPanel>
  )
}

export default ProjectForm
