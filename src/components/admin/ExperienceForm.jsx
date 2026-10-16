import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { GalleryUpload, ImageField } from './ui/AssetUpload'
import { EXPERIENCE_TYPES } from './ui/contentLabels'
import { Checkbox, ChoiceGroup, Field, FormSection, Input, Select, Textarea } from './ui/Field'
import { dateToMonthYear, monthYearToDate } from './ui/format'
import { checkMonthYear, cleanList } from './ui/formValues'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { ListInput } from './ui/ListInput'
import { MonthYearSelect } from './ui/MonthYearSelect'
import { DisplaySettings } from './ui/Switch'
import { prepareUploads, useAssetField, useGalleryField } from './ui/useAssetFields'
import { useFormScreen } from './ui/useFormFeedback'

const THIS_YEAR = new Date().getFullYear()

/**
 * ExperienceForm Component
 * Supports both CREATE and UPDATE operations for public.experiences table.
 *
 * @param {Object} props
 * @param {Object|null} [props.experience] - Existing experience object if editing
 * @param {Array<{ id: string|number, title: string }>} [props.projects] - Choices for "Proyek terkait"
 * @param {number} [props.nextSortOrder] - Position of a new experience (end of the list)
 * @param {(savedExp: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function ExperienceForm({ experience = null, projects = [], nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(experience)

  const [formData, setFormData] = useState({
    role: experience?.role || '',
    company: experience?.company || '',
    experience_type: experience?.experience_type || 'Kerja',
    location: experience?.location || '',
    start: dateToMonthYear(experience?.start_date),
    end: dateToMonthYear(experience?.end_date),
    is_current: experience?.is_current ?? false,
    description: experience?.description || '',
    responsibilities: Array.isArray(experience?.responsibilities) ? experience.responsibilities : [],
    skill_tags: Array.isArray(experience?.skill_tags) ? experience.skill_tags : [],
    related_project_id: experience?.related_project_id != null ? String(experience.related_project_id) : '',
    is_visible: experience?.is_visible ?? true,
    is_featured: Boolean(experience?.is_featured),
  })

  // Logo of the company (logos/, 400 px) and up to three photos (gallery/), uploaded when saving
  const logo = useAssetField(experience?.logo_url, { folder: 'logos', imageKind: 'logo' })
  const photos = useGalleryField(experience?.photos, { max: 3 })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: logo.dirty || photos.dirty })
  const { finish } = screen

  // A type from before (e.g. PKL, if the migration has not run) stays selectable until changed
  const typeOptions = [
    ...EXPERIENCE_TYPES,
    ...(experience?.experience_type && !EXPERIENCE_TYPES.includes(experience.experience_type)
      ? [{ value: experience.experience_type, label: `${experience.experience_type} (lama)` }]
      : []),
  ]

  const set = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      // Still running: no end date
      if (name === 'is_current' && value) updated.end = { month: '', year: '' }
      return updated
    })
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError(null)
  }
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    set(name, type === 'checkbox' ? checked : value)
  }

  const validate = () => {
    const errors = {}

    if (!formData.role.trim()) {
      errors.role = 'Posisi wajib diisi.'
    } else if (formData.role.trim().length > 100) {
      errors.role = 'Posisi maksimal 100 karakter.'
    }

    if (!formData.company.trim()) {
      errors.company = 'Nama instansi atau perusahaan wajib diisi.'
    } else if (formData.company.trim().length > 100) {
      errors.company = 'Nama instansi atau perusahaan maksimal 100 karakter.'
    }

    const startProblem = checkMonthYear(formData.start, { required: true, label: 'Bulan dan tahun mulai' })
    if (startProblem) errors.start = startProblem

    if (!formData.is_current) {
      const endProblem = checkMonthYear(formData.end)
      if (endProblem) {
        errors.end = endProblem
      } else if (!startProblem && formData.end.year) {
        const start = monthYearToDate(formData.start)
        const end = monthYearToDate(formData.end)
        if (end < start) errors.end = 'Selesai tidak boleh lebih awal dari mulai.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }
    if (logo.busy || photos.busy) {
      setGeneralError('Tunggu sebentar, gambar yang dipilih masih diproses.')
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    let uploads
    try {
      uploads = await prepareUploads({ logo_url: logo, photos })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
      setIsSubmitting(false)
      return
    }

    const related = projects.find((p) => String(p.id) === formData.related_project_id)
    const payload = {
      role: formData.role.trim(),
      company: formData.company.trim(),
      experience_type: formData.experience_type || 'Kerja',
      location: formData.location.trim() || null,
      start_date: monthYearToDate(formData.start),
      end_date: formData.is_current ? null : monthYearToDate(formData.end),
      is_current: Boolean(formData.is_current),
      description: formData.description.trim() || null,
      responsibilities: cleanList(formData.responsibilities),
      skill_tags: cleanList(formData.skill_tags),
      logo_url: uploads.values.logo_url,
      photos: uploads.values.photos,
      related_project_id: related ? related.id : null,
      is_visible: Boolean(formData.is_visible),
      is_featured: Boolean(formData.is_featured),
    }
    // A new experience goes to the end of the list; the order is changed with Naik/Turun
    if (!isEditMode) payload.sort_order = nextSortOrder

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('experiences')
          .update(payload)
          .eq('id', experience.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui pengalaman di database.')
        }

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('experiences')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan pengalaman baru ke database.')
        }

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      await uploads.rollback()
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem yang tidak terduga saat menyimpan data.'
      )
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || screen.saved
  const input = (name) => ({ name, value: formData[name], onChange: handleChange, disabled: busy })
  // A related project that no longer exists (deleted) is not offered
  const relatedMissing = formData.related_project_id && !projects.some((p) => String(p.id) === formData.related_project_id)

  return (
    <FormPanel
      label={isEditMode ? 'Ubah pengalaman' : 'Pengalaman baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Pengalaman belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan pengalaman'}
    >
      <FormSection title="Peran" columns={2}>
        <div className="adm-span-2">
          <ChoiceGroup
            name="exp-type"
            legend="Jenis pengalaman"
            required
            options={typeOptions}
            value={formData.experience_type}
            onChange={(value) => set('experience_type', value)}
            hint="Pilih Organisasi hanya untuk peran organisasi yang layak masuk linimasa; keanggotaan singkat cukup di halaman Organisasi."
            disabled={busy}
          />
        </div>
        <Field id="exp-role" label="Posisi" required error={fieldErrors.role} hint="Contoh: Teknisi Jaringan, Web Developer Intern.">
          <Input type="text" {...input('role')} />
        </Field>
        <Field id="exp-company" label="Instansi atau perusahaan" required error={fieldErrors.company} hint="Tempat kerja, magang, klien, atau organisasi.">
          <Input type="text" {...input('company')} />
        </Field>
        <Field id="exp-location" label="Kota" optional hint="Misalnya Kediri, atau tulis Remote.">
          <Input type="text" {...input('location')} />
        </Field>
      </FormSection>

      <FormSection title="Periode" columns={2}>
        <MonthYearSelect
          id="exp-start"
          legend="Mulai"
          required
          value={formData.start}
          onChange={(value) => set('start', value)}
          error={fieldErrors.start}
          maxYear={THIS_YEAR}
          disabled={busy}
        />
        <MonthYearSelect
          id="exp-end"
          legend="Selesai"
          optional
          value={formData.end}
          onChange={(value) => set('end', value)}
          error={fieldErrors.end}
          hint={formData.is_current ? 'Tidak perlu diisi karena masih berjalan.' : 'Kosongkan bila belum ada.'}
          maxYear={THIS_YEAR + 1}
          disabled={busy || formData.is_current}
        />
        <div className="adm-span-2">
          <Checkbox
            id="exp-current"
            name="is_current"
            label="Masih berjalan sampai sekarang"
            checked={formData.is_current}
            onChange={handleChange}
            disabled={busy}
          />
        </div>
      </FormSection>

      <FormSection title="Tugas dan keahlian">
        <ListInput
          id="exp-tasks"
          label="Poin tugas"
          optional
          value={formData.responsibilities}
          onChange={(items) => set('responsibilities', items)}
          max={5}
          itemLabel="Poin"
          addLabel="Tambah poin"
          placeholder="Contoh: Memasang dan merawat jaringan kantor"
          maxLength={160}
          hint="Tulis tugas atau pencapaian yang paling mewakili pekerjaan Anda, satu poin per baris."
          disabled={busy}
        />
        <ListInput
          id="exp-tags"
          label="Tag keahlian"
          optional
          value={formData.skill_tags}
          onChange={(items) => set('skill_tags', items)}
          max={12}
          itemLabel="Tag"
          addLabel="Tambah tag"
          placeholder="Contoh: Mikrotik"
          maxLength={40}
          hint="Teknologi atau keahlian yang dipakai."
          disabled={busy}
        />
        <Field id="exp-description" label="Ringkasan" optional hint="Satu atau dua kalimat tentang peran ini.">
          <Textarea rows={3} {...input('description')} />
        </Field>
      </FormSection>

      <FormSection title="Logo dan dokumentasi">
        <ImageField
          id="exp-logo"
          label="Logo instansi"
          field={logo}
          shape="square"
          imageKind="logo"
          disabled={busy}
        />
        <GalleryUpload
          id="exp-photos"
          label="Foto dokumentasi"
          field={photos}
          altName={formData.company.trim()}
          captionPlaceholder="Contoh: Pemasangan jaringan di ruang server"
          hint="Sampai 3 foto kegiatan."
          disabled={busy}
        />
      </FormSection>

      <FormSection title="Proyek terkait">
        <Field
          id="exp-project"
          label="Proyek terkait"
          optional
          hint={relatedMissing ? 'Proyek yang dipilih sebelumnya sudah tidak ada. Pilih proyek lain atau biarkan kosong.' : 'Proyek yang Anda kerjakan selama pengalaman ini.'}
        >
          <Select {...input('related_project_id')}>
            <option value="">Tidak ada</option>
            {relatedMissing && <option value={formData.related_project_id}>(proyek sudah dihapus)</option>}
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.title}
              </option>
            ))}
          </Select>
        </Field>
      </FormSection>

      <DisplaySettings
        idPrefix="exp"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        featured={formData.is_featured}
        onFeaturedChange={(value) => set('is_featured', value)}
        featuredLabel="Pengalaman unggulan"
        featuredDescription="Ditonjolkan di halaman publik. Pilih 2–4 pengalaman yang paling relevan."
        disabled={busy}
      />
    </FormPanel>
  )
}

export default ExperienceForm
