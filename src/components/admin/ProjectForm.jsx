import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { extractStoragePath } from '../../lib/storageUtils'
import { useUnsavedChanges } from './ui/adminContexts'
import { Alert } from './ui/Alert'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Checkbox, Field, FormSection, Input, Textarea } from './ui/Field'
import { ImageUpload } from './ui/ImageUpload'
import { toFriendlyError } from './ui/friendlyError'
import { useFormFeedback } from './ui/useFormFeedback'

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
 * Helper: Formats file size in readable bytes, KB, or MB
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * ProjectForm Component
 * Handles input validation, storage image upload, and explicit INSERT or UPDATE into public.projects table.
 * Supports both CREATE and UPDATE modes seamlessly.
 * Screen: admin form panel (sections, visible labels, errors under each field, unsaved-changes
 * guard, "Menyimpan..." and a short success state on the save button).
 *
 * @param {Object} props
 * @param {Object|null} [props.project] - Existing project data if editing, or null if creating
 * @param {(savedProject: Object) => void} props.onSuccess - Callback on successful insert or update
 * @param {() => void} props.onCancel - Callback on cancel button click
 */
function ProjectForm({ project = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(project?.id)

  const [title, setTitle] = useState(project?.title || '')
  const [slug, setSlug] = useState(project?.slug || '')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditMode)
  const [description, setDescription] = useState(project?.description || '')
  const [content, setContent] = useState(project?.content || '')
  const [demoUrl, setDemoUrl] = useState(project?.demo_url || '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '')
  const [techStackInput, setTechStackInput] = useState(
    Array.isArray(project?.tech_stack) ? project.tech_stack.join(', ') : ''
  )
  const [isFeatured, setIsFeatured] = useState(Boolean(project?.is_featured))
  const [sortOrder, setSortOrder] = useState(String(project?.sort_order ?? 0))

  // Existing thumbnail URL from database (if in edit mode)
  const existingThumbnailUrl = project?.thumbnail_url || null

  // New thumbnail file and preview state
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Screen only: values when the form opened (to detect unsaved changes), feedback helpers
  const [initial] = useState(() => ({ title, slug, description, content, demoUrl, githubUrl, techStackInput, isFeatured, sortOrder }))
  const formRef = useRef(null)
  const alertRef = useRef(null)
  const { noteSubmit, saved, finish } = useFormFeedback(formRef, { generalError, alertRef })
  const isDirty =
    Boolean(thumbnailFile) ||
    title !== initial.title ||
    slug !== initial.slug ||
    description !== initial.description ||
    content !== initial.content ||
    demoUrl !== initial.demoUrl ||
    githubUrl !== initial.githubUrl ||
    techStackInput !== initial.techStackInput ||
    isFeatured !== initial.isFeatured ||
    sortOrder !== initial.sortOrder
  const confirmLeave = useUnsavedChanges(isDirty && !saved)

  const handleCancel = async () => {
    if (await confirmLeave()) onCancel()
  }

  // Revoke preview object URL when component unmounts or preview changes to prevent memory leak
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview)
      }
    }
  }, [thumbnailPreview])

  // Handle title change and auto-generate slug if not manually customized
  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val))
    }
    if (fieldErrors.title) {
      setFieldErrors((prev) => ({ ...prev, title: null }))
    }
  }

  // Handle manual slug input
  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true)
    const val = e.target.value.toLowerCase().replace(/\s+/g, '-')
    setSlug(val)
    if (fieldErrors.slug) {
      setFieldErrors((prev) => ({ ...prev, slug: null }))
    }
  }

  // Handle thumbnail image selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({
        ...prev,
        thumbnail: 'File ini bukan gambar. Pilih file PNG, JPG, atau WebP.',
      }))
      return
    }

    // Validate file size limit: 2 MB = 2097152 bytes
    if (file.size > 2097152) {
      setFieldErrors((prev) => ({
        ...prev,
        thumbnail: 'Gambar ini lebih dari 2 MB. Pilih gambar yang lebih kecil.',
      }))
      return
    }

    // Clear previous error
    setFieldErrors((prev) => ({ ...prev, thumbnail: null }))

    // Clean up previous object URL if any
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }

    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  // Remove selected new thumbnail image (reverts to existing thumbnail in edit mode)
  const handleRemoveThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFieldErrors((prev) => ({ ...prev, thumbnail: null }))
  }

  // Validate form inputs before submission
  const validateForm = () => {
    const errors = {}

    // Title validation
    if (!title.trim()) {
      errors.title = 'Judul proyek wajib diisi.'
    }

    // Slug validation
    const trimmedSlug = slug.trim()
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!trimmedSlug) {
      errors.slug = 'Alamat singkat wajib diisi.'
    } else if (!slugRegex.test(trimmedSlug)) {
      errors.slug = 'Alamat singkat hanya boleh berisi huruf kecil, angka, dan tanda hubung (-), tanpa spasi.'
    }

    // Description validation
    if (!description.trim()) {
      errors.description = 'Deskripsi singkat wajib diisi.'
    }

    // URL validations
    if (demoUrl.trim() && !isValidUrl(demoUrl)) {
      errors.demoUrl = 'Tautan demo harus diawali http:// atau https://.'
    }
    if (githubUrl.trim() && !isValidUrl(githubUrl)) {
      errors.githubUrl = 'Tautan kode harus diawali http:// atau https://.'
    }

    // Thumbnail size re-check if selected
    if (thumbnailFile && thumbnailFile.size > 2097152) {
      errors.thumbnail = 'Gambar ini lebih dari 2 MB. Pilih gambar yang lebih kecil.'
    }

    // Sort order validation
    const parsedSortOrder = parseInt(sortOrder, 10)
    if (isNaN(parsedSortOrder) || parsedSortOrder < 0) {
      errors.sortOrder = 'Urutan tampil harus berupa angka 0 atau lebih.'
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

    setIsSubmitting(true)

    let uploadedFilePath = null
    let finalThumbnailUrl = isEditMode ? existingThumbnailUrl : null

    // 1. Upload thumbnail to Supabase Storage if user chose a new file
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split('.').pop().toLowerCase() || 'png'
      const filePath = `projects/${crypto.randomUUID()}.${fileExt}`
      uploadedFilePath = filePath

      try {
        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(uploadedFilePath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          setGeneralError(
            uploadError.message || 'Gagal mengunggah thumbnail ke storage.'
          )
          setIsSubmitting(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(uploadedFilePath)

        finalThumbnailUrl = urlData?.publicUrl || null
      } catch (err) {
        setGeneralError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengunggah thumbnail.'
        )
        setIsSubmitting(false)
        return
      }
    }

    // 2. Parse tech_stack from comma-separated string into clean array TEXT[]
    const techStackArray = techStackInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    // 3. Prepare controlled and explicit payload (no id, no timestamps)
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      content: content.trim() ? content.trim() : null,
      thumbnail_url: finalThumbnailUrl,
      demo_url: demoUrl.trim() ? demoUrl.trim() : null,
      github_url: githubUrl.trim() ? githubUrl.trim() : null,
      tech_stack: techStackArray,
      is_featured: Boolean(isFeatured),
      sort_order: parseInt(sortOrder, 10) || 0,
    }

    // 4. Execute database mutation (UPDATE or INSERT)
    try {
      const query = isEditMode
        ? supabase.from('projects').update(payload).eq('id', project.id)
        : supabase.from('projects').insert(payload)

      const { data, error: dbError } = await query
        .select(
          'id, title, slug, description, content, thumbnail_url, demo_url, github_url, tech_stack, is_featured, sort_order, created_at, updated_at'
        )
        .single()

      if (dbError) {
        // Orphan file cleanup: remove newly uploaded file if DB operation fails
        let cleanupWarning = ''
        if (uploadedFilePath) {
          try {
            const { error: cleanupError } = await supabase.storage
              .from('portfolio-assets')
              .remove([uploadedFilePath])

            if (cleanupError) {
              console.warn(
                `[Storage Cleanup Warning] Gagal membersihkan file orphan '${uploadedFilePath}':`,
                cleanupError.message
              )
              cleanupWarning = ` (Peringatan: File thumbnail '${uploadedFilePath}' tidak dapat dibersihkan otomatis: ${cleanupError.message})`
            }
          } catch (cleanupEx) {
            console.warn(
              `[Storage Cleanup Exception] Gagal saat menghapus file orphan '${uploadedFilePath}':`,
              cleanupEx
            )
            cleanupWarning = ` (Peringatan: Terjadi error saat membersihkan file thumbnail '${uploadedFilePath}')`
          }
        }

        // Handle unique constraint duplicate slug error (PostgreSQL error code 23505)
        if (
          dbError.code === '23505' ||
          dbError.message?.toLowerCase().includes('slug') ||
          dbError.message?.toLowerCase().includes('duplicate')
        ) {
          setGeneralError(
            `Alamat singkat ini sudah dipakai proyek lain. Ganti dengan alamat lain.${cleanupWarning}`
          )
          setFieldErrors((prev) => ({
            ...prev,
            slug: 'Alamat singkat ini sudah dipakai proyek lain.',
          }))
        } else {
          setGeneralError(
            `${dbError.message || (isEditMode ? 'Gagal memperbarui project.' : 'Gagal menyimpan project ke database.')}${cleanupWarning}`
          )
        }
        setIsSubmitting(false)
        return
      }

      // 5. Best-effort cleanup of old thumbnail if replaced in edit mode
      if (isEditMode && uploadedFilePath && existingThumbnailUrl) {
        const oldFilePath = extractStoragePath(existingThumbnailUrl)
        if (oldFilePath && oldFilePath !== uploadedFilePath) {
          try {
            const { error: oldRemoveError } = await supabase.storage
              .from('portfolio-assets')
              .remove([oldFilePath])

            if (oldRemoveError) {
              console.warn(
                `[Storage Cleanup] Gagal menghapus thumbnail lama '${oldFilePath}':`,
                oldRemoveError.message
              )
            }
          } catch (ex) {
            console.warn(
              `[Storage Cleanup] Exception saat menghapus thumbnail lama:`,
              ex
            )
          }
        }
      }

      // Success
      setIsSubmitting(false)
      finish(() => onSuccess(data))
    } catch (err) {
      // Orphan file cleanup on unexpected exceptions
      let cleanupWarning = ''
      if (uploadedFilePath) {
        try {
          const { error: cleanupError } = await supabase.storage
            .from('portfolio-assets')
            .remove([uploadedFilePath])

          if (cleanupError) {
            console.warn(
              `[Storage Cleanup Warning] Gagal membersihkan file orphan '${uploadedFilePath}':`,
              cleanupError.message
            )
            cleanupWarning = ` (Peringatan: File thumbnail '${uploadedFilePath}' tidak dapat dibersihkan otomatis: ${cleanupError.message})`
          }
        } catch (cleanupEx) {
          console.warn(
            `[Storage Cleanup Exception] Gagal saat menghapus file orphan '${uploadedFilePath}':`,
            cleanupEx
          )
          cleanupWarning = ` (Peringatan: Terjadi error saat membersihkan file thumbnail '${uploadedFilePath}')`
        }
      }

      setGeneralError(
        `${
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan sistem yang tidak terduga saat menyimpan data.'
        }${cleanupWarning}`
      )
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
  const busy = isSubmitting || saved

  return (
    <Card as="div" label={isEditMode ? 'Ubah proyek' : 'Proyek baru'} corners className="adm-form-card">
      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          // Already saved: the form is about to close, never submit twice
          if (saved) {
            e.preventDefault()
            return
          }
          noteSubmit()
          handleSubmit(e)
        }}
      >
        {saveError && (
          <div ref={alertRef} className="adm-form-alert">
            <Alert tone="danger">{saveError}</Alert>
          </div>
        )}
        <p className="adm-required-note">
          Kolom bertanda <span aria-hidden="true">*</span>
          <span className="adm-sr-only">bintang</span> wajib diisi.
        </p>

        <FormSection title="Informasi utama">
          <Field id="project-title" label="Judul proyek" required error={fieldErrors.title}>
            <Input
              type="text"
              placeholder="Contoh: Aplikasi Kasir UMKM"
              value={title}
              onChange={handleTitleChange}
              disabled={busy}
            />
          </Field>
          <Field
            id="project-slug"
            label="Alamat singkat"
            required
            error={fieldErrors.slug}
            hint={
              <>
                Dipakai di alamat halaman proyek: <span className="adm-code">/projects/{slug || 'alamat-singkat'}</span>.
                {isEditMode ? ' Hanya huruf kecil, angka, dan tanda hubung.' : ' Dibuat otomatis dari judul; boleh diubah.'}
              </>
            }
          >
            <Input type="text" autoComplete="off" spellCheck={false} value={slug} onChange={handleSlugChange} disabled={busy} />
          </Field>
          <Field id="project-desc" label="Deskripsi singkat" required error={fieldErrors.description} hint="Satu atau dua kalimat yang tampil di kartu proyek.">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({ ...prev, description: null }))
                }
              }}
              disabled={busy}
            />
          </Field>
          <Field id="project-content" label="Penjelasan lengkap" optional hint="Latar belakang, fitur, atau cara kerja proyek.">
            <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} disabled={busy} />
          </Field>
        </FormSection>

        <FormSection title="Teknologi dan tautan" columns={2}>
          <Field
            id="project-tech"
            label="Teknologi yang dipakai"
            optional
            className="adm-span-2"
            hint="Pisahkan dengan koma, misalnya: React, Supabase, CSS."
          >
            <Input type="text" value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)} disabled={busy} />
          </Field>
          <Field id="project-demo" label="Tautan demo" optional error={fieldErrors.demoUrl}>
            <Input
              type="url"
              inputMode="url"
              placeholder="https://"
              value={demoUrl}
              onChange={(e) => {
                setDemoUrl(e.target.value)
                if (fieldErrors.demoUrl) {
                  setFieldErrors((prev) => ({ ...prev, demoUrl: null }))
                }
              }}
              disabled={busy}
            />
          </Field>
          <Field id="project-github" label="Tautan kode" optional error={fieldErrors.githubUrl} hint="Misalnya halaman GitHub proyek.">
            <Input
              type="url"
              inputMode="url"
              placeholder="https://github.com/"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value)
                if (fieldErrors.githubUrl) {
                  setFieldErrors((prev) => ({ ...prev, githubUrl: null }))
                }
              }}
              disabled={busy}
            />
          </Field>
        </FormSection>

        <FormSection title="Gambar sampul">
          <ImageUpload
            id="project-thumb-upload"
            label="Gambar sampul"
            optional
            hint={
              isEditMode && existingThumbnailUrl
                ? 'Gambar baru menggantikan gambar saat ini setelah Anda menyimpan. PNG, JPG, atau WebP, maksimal 2 MB.'
                : 'PNG, JPG, atau WebP. Maksimal 2 MB.'
            }
            error={fieldErrors.thumbnail}
            previewUrl={thumbnailPreview}
            currentUrl={isEditMode ? existingThumbnailUrl : null}
            fileName={thumbnailFile?.name}
            fileSize={thumbnailFile ? formatFileSize(thumbnailFile.size) : null}
            inputRef={fileInputRef}
            onChange={handleThumbnailChange}
            onRemove={handleRemoveThumbnail}
            disabled={busy}
          />
        </FormSection>

        <FormSection title="Tampilan" columns={2}>
          <Field id="project-sort" label="Urutan tampil" error={fieldErrors.sortOrder} hint="Angka kecil tampil lebih dulu. 0 paling awal.">
            <Input
              type="number"
              min="0"
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value)
                if (fieldErrors.sortOrder) {
                  setFieldErrors((prev) => ({ ...prev, sortOrder: null }))
                }
              }}
              disabled={busy}
            />
          </Field>
          <Checkbox
            id="project-featured"
            label="Jadikan proyek unggulan"
            description="Proyek unggulan tampil paling atas di halaman publik."
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            disabled={busy}
          />
        </FormSection>

        <div className="adm-form-actions">
          {isDirty && !saved && <p className="adm-form-actions-note">Ada perubahan yang belum disimpan</p>}
          <Button variant="secondary" onClick={handleCancel} disabled={busy}>
            Batal
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Menyimpan..."
            status={saved ? 'success' : undefined}
            successText="Tersimpan"
            aria-disabled={busy || undefined}
          >
            {isEditMode ? 'Simpan perubahan' : 'Simpan proyek'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ProjectForm
