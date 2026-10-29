import { useState } from 'react'
import { englishColumnsMissing, optionalColumnMissing } from '../../lib/englishColumns'
import { supabase } from '../../lib/supabaseClient'
import { Alert } from './ui/Alert'
import { GalleryUpload, ImageField } from './ui/AssetUpload'
import { EnglishField, EnglishList, EnglishSection } from './ui/EnglishFields'
import { Checkbox, Field, FormSection, Input, QuickPicks, Select, Textarea } from './ui/Field'
import { englishText } from './ui/formValues'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { DisplaySettings } from './ui/Switch'
import { prepareUploads, useAssetField, useGalleryField } from './ui/useAssetFields'
import { useFormScreen } from './ui/useFormFeedback'

const DEGREE_PRESETS = ['Diploma III (D3)', 'Sarjana (S1)', 'Magister (S2)', 'SMK / SMA']

const THIS_YEAR = new Date().getFullYear()

/** Years from `max` down to 1980 for a select (no scroll-wheel changes like a number field); a stored
 *  year outside that range still shows. */
function yearOptions(max, current) {
  const years = []
  for (let y = max; y >= 1980; y -= 1) years.push(String(y))
  if (current && !years.includes(String(current))) years.push(String(current))
  return years
}

/** '3,62' or '3.62' → 3.62 (0–4, at most two decimals); null when it is not a valid GPA */
function parseGpa(text) {
  const normalized = String(text).trim().replace(',', '.')
  if (!/^\d(\.\d{1,2})?$/.test(normalized)) return null
  const value = Number(normalized)
  return value >= 0 && value <= 4 ? value : null
}

/**
 * EducationForm Component
 * Supports both CREATE and UPDATE operations for public.educations table.
 *
 * @param {Object} props
 * @param {Object|null} [props.education] - Existing education object if editing
 * @param {number} [props.nextSortOrder] - Position of a new entry (end of the list)
 * @param {(savedEdu: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function EducationForm({ education = null, nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(education)

  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || 'Diploma III (D3)',
    field_of_study: education?.field_of_study || '',
    start_year: education?.start_year ?? new Date().getFullYear() - 3,
    end_year: education?.end_year ?? new Date().getFullYear(),
    is_current: education?.is_current ?? false,
    description: education?.description || '',
    gpa: education?.gpa != null ? String(education.gpa).replace('.', ',') : '',
    thesis_title: education?.thesis_title || '',
    is_visible: education?.is_visible ?? true,
    // Versi Inggris (stage 3C)
    degree_en: education?.degree_en || '',
    field_of_study_en: education?.field_of_study_en || '',
    thesis_title_en: education?.thesis_title_en || '',
  })

  // Campus or school logo (logos/, 400 px) and up to three photos (gallery/, the folder of the public
  // journey timeline), uploaded when saving. Photos need migration 20261030000000 (educations.photos);
  // until it has run the form says so and leaves them out.
  const logo = useAssetField(education?.logo_url, { folder: 'logos', imageKind: 'logo' })
  const photos = useGalleryField(education?.photos, { max: 3 })
  const photosAvailable = !optionalColumnMissing('educations', 'photos')

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: logo.dirty || photos.dirty })
  const { finish } = screen

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? checked : value

    setFormData((prev) => {
      const updated = { ...prev, [name]: nextVal }
      if (name === 'is_current' && checked) {
        updated.end_year = ''
      }
      return updated
    })

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleSelectDegreePreset = (preset) => {
    setFormData((prev) => ({ ...prev, degree: preset }))
    if (fieldErrors.degree) {
      setFieldErrors((prev) => ({ ...prev, degree: null }))
    }
  }

  const validate = () => {
    const errors = {}

    if (!formData.institution.trim()) {
      errors.institution = 'Nama sekolah atau kampus wajib diisi.'
    } else if (formData.institution.trim().length > 150) {
      errors.institution = 'Nama sekolah atau kampus maksimal 150 karakter.'
    }

    if (!formData.degree.trim()) {
      errors.degree = 'Jenjang pendidikan wajib diisi.'
    }

    if (!formData.field_of_study.trim()) {
      errors.field_of_study = 'Jurusan wajib diisi.'
    }

    const startYearNum = Number(formData.start_year)
    if (isNaN(startYearNum) || startYearNum < 1950 || startYearNum > 2100) {
      errors.start_year = 'Tahun masuk harus antara tahun 1950 dan 2100.'
    }

    if (!formData.is_current && formData.end_year) {
      const endYearNum = Number(formData.end_year)
      if (isNaN(endYearNum) || endYearNum < 1950 || endYearNum > 2100) {
        errors.end_year = 'Tahun lulus harus antara tahun 1950 dan 2100.'
      } else if (endYearNum < startYearNum) {
        errors.end_year = 'Tahun lulus tidak boleh lebih awal dari tahun masuk.'
      }
    }

    if (formData.gpa.trim() && parseGpa(formData.gpa) === null) {
      errors.gpa = 'Tulis IPK sebagai angka 0 sampai 4, misalnya 3,62.'
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

    // prepareUploads removes what it already uploaded when one upload fails, so there is nothing to
    // roll back here
    let uploads
    try {
      uploads = await prepareUploads(photosAvailable ? { logo_url: logo, photos } : { logo_url: logo })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
      setIsSubmitting(false)
      return
    }

    const payload = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field_of_study: formData.field_of_study.trim(),
      start_year: parseInt(formData.start_year, 10),
      end_year: formData.is_current ? null : formData.end_year ? parseInt(formData.end_year, 10) : null,
      is_current: Boolean(formData.is_current),
      description: formData.description.trim() || null,
      logo_url: uploads.values.logo_url,
      gpa: formData.gpa.trim() ? parseGpa(formData.gpa) : null,
      thesis_title: formData.thesis_title.trim() || null,
      is_visible: Boolean(formData.is_visible),
    }
    if (photosAvailable) payload.photos = uploads.values.photos
    if (!englishColumnsMissing()) {
      Object.assign(payload, {
        degree_en: englishText(formData.degree_en),
        field_of_study_en: englishText(formData.field_of_study_en),
        thesis_title_en: englishText(formData.thesis_title_en),
      })
    }
    // A new entry goes to the end of the list; the order is changed with Naik/Turun
    if (!isEditMode) payload.sort_order = nextSortOrder

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('educations')
          .update(payload)
          .eq('id', education.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data pendidikan di database.')
        }

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('educations')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan riwayat pendidikan baru ke database.')
        }

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      // The new files are removed again when the save fails
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
  // Versi Inggris (stage 3C)
  const english = (name) => ({
    name,
    value: formData[name],
    onChange: (e) => setFormData((prev) => ({ ...prev, [name]: e.target.value })),
    disabled: busy,
  })

  return (
    <FormPanel
      label={isEditMode ? 'Ubah pendidikan' : 'Pendidikan baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Data pendidikan belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan pendidikan'}
    >
      <FormSection title="Sekolah atau kampus" columns={2}>
        <Field
          id="edu-institution"
          label="Nama sekolah atau kampus"
          required
          className="adm-span-2"
          error={fieldErrors.institution}
          hint="Contoh: Politeknik Negeri Malang, SMK Negeri 1 Kediri."
        >
          <Input name="institution" type="text" value={formData.institution} onChange={handleChange} disabled={busy} />
        </Field>
        <div>
          <Field id="edu-degree" label="Jenjang" required error={fieldErrors.degree} hint="Pilih salah satu, atau ketik sendiri.">
            <Input name="degree" type="text" value={formData.degree} onChange={handleChange} disabled={busy} />
          </Field>
          <QuickPicks
            label="Pilihan jenjang"
            options={DEGREE_PRESETS}
            value={formData.degree}
            onPick={handleSelectDegreePreset}
            disabled={busy}
          />
        </div>
        <Field id="edu-field-of-study" label="Jurusan" required error={fieldErrors.field_of_study} hint="Contoh: Teknik Informatika.">
          <Input name="field_of_study" type="text" value={formData.field_of_study} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>

      <FormSection title="Waktu" columns={2}>
        <Field id="edu-start-year" label="Tahun masuk" required error={fieldErrors.start_year}>
          <Select name="start_year" value={formData.start_year} onChange={handleChange} disabled={busy}>
            <option value="">Pilih tahun</option>
            {yearOptions(THIS_YEAR + 1, formData.start_year).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="edu-end-year"
          label="Tahun lulus"
          optional
          error={fieldErrors.end_year}
          hint={formData.is_current ? 'Tidak perlu diisi karena masih belajar di sini.' : 'Pilih "Belum lulus" bila belum selesai.'}
        >
          <Select name="end_year" value={formData.end_year} onChange={handleChange} disabled={busy || formData.is_current}>
            <option value="">Belum lulus</option>
            {yearOptions(THIS_YEAR + 6, formData.end_year).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </Field>
        <div className="adm-span-2">
          <Checkbox
            id="edu-current"
            name="is_current"
            label="Masih belajar di sini"
            checked={formData.is_current}
            onChange={handleChange}
            disabled={busy}
          />
        </div>
      </FormSection>

      <FormSection title="Nilai dan tugas akhir" columns={2}>
        <Field id="edu-gpa" label="IPK" optional error={fieldErrors.gpa} hint="Skala 4, misalnya 3,62 atau 3.62. Kosongkan bila tidak ingin ditampilkan.">
          <Input name="gpa" type="text" inputMode="decimal" autoComplete="off" value={formData.gpa} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="edu-thesis" label="Judul tugas akhir" optional hint="Judul skripsi atau tugas akhir.">
          <Input name="thesis_title" type="text" value={formData.thesis_title} onChange={handleChange} disabled={busy} />
        </Field>
        <Field
          id="edu-description"
          label="Keterangan"
          optional
          className="adm-span-2"
          hint="Misalnya fokus belajar atau prestasi selama kuliah."
        >
          <Textarea name="description" rows={4} value={formData.description} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>

      <FormSection title="Logo dan foto">
        <ImageField id="edu-logo" label="Logo kampus atau sekolah" field={logo} shape="square" imageKind="logo" disabled={busy} />
        {photosAvailable ? (
          <GalleryUpload
            id="edu-photos"
            label="Foto dokumentasi"
            field={photos}
            altName={formData.institution.trim()}
            captionPlaceholder="Contoh: Sidang tugas akhir"
            hint="Sampai 3 foto. Tampil di folder arsip pada Perjalanan di halaman publik; keterangan dibaca sebagai teks alternatif."
            disabled={busy}
          />
        ) : (
          <Alert tone="info" title="Foto pendidikan belum tersedia">
            Pembaruan database untuk foto pendidikan (migrasi 20261030000000_redesign_monokrom.sql) belum dijalankan.
          </Alert>
        )}
      </FormSection>

      <EnglishSection
        values={[
          formData.degree_en,
          formData.field_of_study_en,
          formData.thesis_title_en,
          ...(photosAvailable ? photos.items.map((item) => item.caption_en) : []),
        ]}
      >
        <EnglishField id="edu-degree-en" label="Jenjang" original={formData.degree} {...english('degree_en')} />
        <EnglishField
          id="edu-field-of-study-en"
          label="Jurusan"
          original={formData.field_of_study}
          {...english('field_of_study_en')}
        />
        <EnglishField
          id="edu-thesis-title-en"
          label="Judul tugas akhir"
          original={formData.thesis_title}
          {...english('thesis_title_en')}
        />
        {photosAvailable && (
          <EnglishList
            id="edu-photos-en"
            label="Keterangan foto"
            itemLabel="Keterangan foto"
            originals={photos.items.map((item) => item.caption)}
            values={photos.items.map((item) => item.caption_en)}
            onItemChange={(index, text) => photos.setCaptionEn(photos.items[index].key, text)}
            maxLength={120}
            emptyHint="Belum ada foto dokumentasi."
            disabled={busy}
          />
        )}
      </EnglishSection>

      <DisplaySettings
        idPrefix="edu"
        visible={formData.is_visible}
        onVisibleChange={(value) => setFormData((prev) => ({ ...prev, is_visible: value }))}
        disabled={busy}
      />
    </FormPanel>
  )
}

export default EducationForm
