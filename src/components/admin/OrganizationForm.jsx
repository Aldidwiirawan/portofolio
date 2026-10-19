import { useState } from 'react'
import { englishColumnsMissing } from '../../lib/englishColumns'
import { supabase } from '../../lib/supabaseClient'
import { ImageField } from './ui/AssetUpload'
import { EnglishField, EnglishSection } from './ui/EnglishFields'
import { Field, FormSection, Input, Textarea } from './ui/Field'
import { dateToMonthYear, monthYearToDate } from './ui/format'
import { checkMonthYear, englishText } from './ui/formValues'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { MonthYearSelect } from './ui/MonthYearSelect'
import { DisplaySettings } from './ui/Switch'
import { prepareUploads, useAssetField } from './ui/useAssetFields'
import { useFormScreen } from './ui/useFormFeedback'

const THIS_YEAR = new Date().getFullYear()

/**
 * OrganizationForm Component
 * Supports CREATE and UPDATE for public.organizations table.
 *
 * @param {Object} props
 * @param {Object|null} [props.organization] - Existing organization object
 * @param {number} [props.nextSortOrder] - Position of a new organization (end of the list)
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function OrganizationForm({ organization = null, nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(organization)

  const [formData, setFormData] = useState({
    name: organization?.name || '',
    role: organization?.role || '',
    start: dateToMonthYear(organization?.start_date),
    end: dateToMonthYear(organization?.end_date),
    description: organization?.description || '',
    is_visible: organization?.is_visible ?? true,
    // Versi Inggris (stage 3C)
    role_en: organization?.role_en || '',
    description_en: organization?.description_en || '',
  })

  // Logo or a small photo (logos/, 400 px), uploaded when saving
  const logo = useAssetField(organization?.logo_url, { folder: 'logos', imageKind: 'logo' })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: logo.dirty })
  const { finish } = screen

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError(null)
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Nama organisasi wajib diisi.'
    }

    if (!formData.role.trim()) {
      errors.role = 'Jabatan wajib diisi.'
    }

    const startProblem = checkMonthYear(formData.start)
    if (startProblem) errors.start = startProblem
    const endProblem = checkMonthYear(formData.end)
    if (endProblem) {
      errors.end = endProblem
    } else if (!startProblem && formData.start.year && formData.end.year) {
      if (monthYearToDate(formData.end) < monthYearToDate(formData.start)) {
        errors.end = 'Selesai tidak boleh lebih awal dari mulai.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return
    if (logo.busy) {
      setGeneralError('Tunggu sebentar, gambar yang dipilih masih diproses.')
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    let uploads
    try {
      uploads = await prepareUploads({ logo_url: logo })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
      setIsSubmitting(false)
      return
    }

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      start_date: monthYearToDate(formData.start),
      end_date: monthYearToDate(formData.end),
      description: formData.description.trim() || null,
      logo_url: uploads.values.logo_url,
      is_visible: Boolean(formData.is_visible),
    }
    if (!englishColumnsMissing()) {
      Object.assign(payload, {
        role_en: englishText(formData.role_en),
        description_en: englishText(formData.description_en),
      })
    }
    // A new organization goes to the end of the list; the order is changed with Naik/Turun
    if (!isEditMode) payload.sort_order = nextSortOrder

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('organizations')
          .update(payload)
          .eq('id', organization.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data organisasi.')
        }

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('organizations')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan organisasi baru.')
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
          : 'Terjadi kesalahan sistem saat menyimpan data organisasi.'
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
      label={isEditMode ? 'Ubah organisasi' : 'Organisasi baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Organisasi belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan organisasi'}
    >
      <FormSection title="Organisasi" columns={2}>
        <Field id="org-name" label="Nama organisasi" required error={fieldErrors.name} hint="Organisasi, komunitas, atau kepanitiaan.">
          <Input name="name" type="text" value={formData.name} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="org-role" label="Jabatan" required error={fieldErrors.role} hint="Contoh: Ketua Divisi Acara.">
          <Input name="role" type="text" value={formData.role} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>

      <FormSection title="Periode" columns={2}>
        <MonthYearSelect
          id="org-start"
          legend="Mulai"
          optional
          value={formData.start}
          onChange={(value) => set('start', value)}
          error={fieldErrors.start}
          maxYear={THIS_YEAR}
          disabled={busy}
        />
        <MonthYearSelect
          id="org-end"
          legend="Selesai"
          optional
          value={formData.end}
          onChange={(value) => set('end', value)}
          error={fieldErrors.end}
          hint="Kosongkan bila masih aktif."
          maxYear={THIS_YEAR + 1}
          disabled={busy}
        />
      </FormSection>

      <FormSection title="Keterangan">
        <Field id="org-desc" label="Tanggung jawab dan kontribusi" optional hint="Ceritakan apa yang Anda kerjakan di sana.">
          <Textarea name="description" rows={4} value={formData.description} onChange={handleChange} disabled={busy} />
        </Field>
        <ImageField
          id="org-logo"
          label="Logo atau foto"
          field={logo}
          shape="square"
          imageKind="logo"
          hint="Logo organisasi atau foto kecil kegiatan. PNG, JPG, atau WebP; otomatis dikecilkan menjadi 400 px."
          disabled={busy}
        />
      </FormSection>

      <EnglishSection values={[formData.role_en, formData.description_en]}>
        <EnglishField id="org-role-en" label="Jabatan" original={formData.role} {...english('role_en')} />
        <EnglishField
          id="org-description-en"
          label="Tanggung jawab dan kontribusi"
          original={formData.description}
          multiline
          {...english('description_en')}
        />
      </EnglishSection>

      <DisplaySettings
        idPrefix="org"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        disabled={busy}
      />
    </FormPanel>
  )
}

export default OrganizationForm
