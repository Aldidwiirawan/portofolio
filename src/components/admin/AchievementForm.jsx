import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Field, FormSection, Input, Textarea } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { useFormScreen } from './ui/useFormFeedback'

/**
 * AchievementForm Component
 * Supports CREATE and UPDATE for public.achievements table.
 *
 * @param {Object} props
 * @param {Object|null} [props.achievement] - Existing achievement object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function AchievementForm({ achievement = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(achievement)

  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    event_name: achievement?.event_name || '',
    year: achievement?.year ?? new Date().getFullYear(),
    description: achievement?.description || '',
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel })
  const { finish } = screen

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (generalError) {
      setGeneralError(null)
    }
  }

  const validate = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Judul prestasi wajib diisi.'
    }

    if (!formData.event_name.trim()) {
      errors.event_name = 'Nama acara atau lomba wajib diisi.'
    }

    const yearVal = Number(formData.year)
    if (!formData.year || isNaN(yearVal) || yearVal < 1990 || yearVal > 2100) {
      errors.year = 'Tahun harus 4 angka, misalnya 2025.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setGeneralError(null)

    const payload = {
      title: formData.title.trim(),
      event_name: formData.event_name.trim(),
      year: parseInt(formData.year, 10),
      description: formData.description.trim() || null,
    }

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

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data pencapaian.'
      )
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || screen.saved

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
        <Field id="achieve-title" label="Judul prestasi" required className="adm-span-2" error={fieldErrors.title} hint="Contoh: Juara 2 Lomba Desain Web.">
          <Input name="title" type="text" value={formData.title} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="achieve-event" label="Nama acara atau lomba" required error={fieldErrors.event_name} hint="Nama ajang atau penyelenggaranya.">
          <Input name="event_name" type="text" value={formData.event_name} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="achieve-year" label="Tahun" required error={fieldErrors.year}>
          <Input name="year" type="number" min="1990" max="2100" inputMode="numeric" value={formData.year} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="achieve-desc" label="Keterangan" optional className="adm-span-2" hint="Misalnya apa yang Anda buat atau kerjakan.">
          <Textarea name="description" rows={4} value={formData.description} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>
    </FormPanel>
  )
}

export default AchievementForm
