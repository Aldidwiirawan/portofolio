import { useState } from 'react'
import { englishColumnsMissing } from '../../lib/englishColumns'
import { supabase } from '../../lib/supabaseClient'
import { ImageField, PdfUpload } from './ui/AssetUpload'
import { EnglishField, EnglishSection } from './ui/EnglishFields'
import { Field, FormSection, Input, Textarea } from './ui/Field'
import { checkMonthYear, englishText } from './ui/formValues'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { MonthYearSelect } from './ui/MonthYearSelect'
import { DisplaySettings } from './ui/Switch'
import { prepareUploads, useAssetField } from './ui/useAssetFields'
import { useFormScreen } from './ui/useFormFeedback'

const THIS_YEAR = new Date().getFullYear()

/**
 * AchievementForm Component
 * Supports CREATE and UPDATE for public.achievements table.
 *
 * @param {Object} props
 * @param {Object|null} [props.achievement] - Existing achievement object
 * @param {number} [props.nextSortOrder] - Position of a new achievement (end of the list)
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function AchievementForm({ achievement = null, nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(achievement)

  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    event_name: achievement?.event_name || '',
    when: {
      month: achievement?.month ? String(achievement.month) : '',
      year: String(achievement?.year ?? THIS_YEAR),
    },
    description: achievement?.description || '',
    is_visible: achievement?.is_visible ?? true,
    // Versi Inggris (stage 3C)
    title_en: achievement?.title_en || '',
    event_name_en: achievement?.event_name_en || '',
    description_en: achievement?.description_en || '',
    is_featured: Boolean(achievement?.is_featured),
  })

  // Supporting document (documents/, PDF) and a photo (gallery/), uploaded when saving
  const docFile = useAssetField(achievement?.document_url, { folder: 'documents', type: 'pdf' })
  const photo = useAssetField(achievement?.photo_url, { folder: 'gallery' })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: docFile.dirty || photo.dirty })
  const { finish } = screen

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError(null)
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const validate = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Nama pencapaian wajib diisi.'
    }

    if (!formData.event_name.trim()) {
      errors.event_name = 'Penerbit atau penyelenggara wajib diisi.'
    }

    const whenProblem = checkMonthYear(formData.when, { required: true, monthOptional: true, label: 'Tahun' })
    if (whenProblem) errors.when = whenProblem

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return
    if (docFile.busy || photo.busy) {
      setGeneralError('Tunggu sebentar, file yang dipilih masih diproses.')
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    let uploads
    try {
      uploads = await prepareUploads({ document_url: docFile, photo_url: photo })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah file.')
      setIsSubmitting(false)
      return
    }

    const payload = {
      title: formData.title.trim(),
      event_name: formData.event_name.trim(),
      year: parseInt(formData.when.year, 10),
      description: formData.description.trim() || null,
      month: formData.when.month ? Number(formData.when.month) : null,
      document_url: uploads.values.document_url,
      photo_url: uploads.values.photo_url,
      is_visible: Boolean(formData.is_visible),
      is_featured: Boolean(formData.is_featured),
    }
    if (!englishColumnsMissing()) {
      Object.assign(payload, {
        title_en: englishText(formData.title_en),
        event_name_en: englishText(formData.event_name_en),
        description_en: englishText(formData.description_en),
      })
    }
    // A new achievement goes to the end of the list; the order is changed with Naik/Turun
    if (!isEditMode) payload.sort_order = nextSortOrder

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('achievements')
          .update(payload)
          .eq('id', achievement.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data pencapaian.')
        }

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('achievements')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan pencapaian baru.')
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
          : 'Terjadi kesalahan sistem saat menyimpan data pencapaian.'
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
      label={isEditMode ? 'Ubah prestasi' : 'Prestasi baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Prestasi belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan prestasi'}
    >
      <FormSection title="Prestasi" columns={2}>
        <Field
          id="achieve-title"
          label="Nama pencapaian"
          required
          className="adm-span-2"
          error={fieldErrors.title}
          hint="Tulis pencapaian yang paling mewakili usaha atau prestasimu. Contoh: Juara 2 LKS Web Technologies."
        >
          <Input name="title" type="text" value={formData.title} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="achieve-event" label="Penerbit atau penyelenggara" required error={fieldErrors.event_name} hint="Lembaga yang memberi penghargaan atau mengadakan lomba.">
          <Input name="event_name" type="text" value={formData.event_name} onChange={handleChange} disabled={busy} />
        </Field>
        <MonthYearSelect
          id="achieve-when"
          legend="Bulan dan tahun"
          required
          monthOptional
          value={formData.when}
          onChange={(value) => set('when', value)}
          error={fieldErrors.when}
          hint="Bulan boleh dikosongkan bila tidak ingat."
          minYear={2005}
          maxYear={THIS_YEAR}
          disabled={busy}
        />
        <Field id="achieve-desc" label="Keterangan" optional className="adm-span-2" hint="Misalnya apa yang Anda buat atau kerjakan.">
          <Textarea name="description" rows={4} value={formData.description} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>

      <FormSection title="Bukti" columns={2}>
        <PdfUpload id="achieve-document" label="Dokumen (PDF)" field={docFile} hint="Piagam atau surat keterangan. PDF sampai 5 MB." disabled={busy} />
        <ImageField id="achieve-photo" label="Foto" field={photo} hint="Foto saat menerima penghargaan atau karya yang dilombakan." disabled={busy} />
      </FormSection>

      <EnglishSection values={[formData.title_en, formData.event_name_en, formData.description_en]}>
        <EnglishField id="achieve-title-en" label="Nama pencapaian" original={formData.title} {...english('title_en')} />
        <EnglishField
          id="achieve-event-name-en"
          label="Penerbit atau penyelenggara"
          original={formData.event_name}
          {...english('event_name_en')}
        />
        <EnglishField
          id="achieve-description-en"
          label="Keterangan"
          original={formData.description}
          multiline
          {...english('description_en')}
        />
      </EnglishSection>

      <DisplaySettings
        idPrefix="achieve"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        featured={formData.is_featured}
        onFeaturedChange={(value) => set('is_featured', value)}
        featuredLabel="Prestasi unggulan"
        featuredDescription="Ditonjolkan di halaman publik."
        disabled={busy}
      />
    </FormPanel>
  )
}

export default AchievementForm
