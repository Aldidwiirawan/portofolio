import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ChoiceGroup, Field, FormSection, Input } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { useFormScreen } from './ui/useFormFeedback'

const PROFICIENCY_OPTIONS = ['Pemula', 'Menengah', 'Mahir', 'Penutur Asli']

/**
 * LanguageForm Component
 * Supports CREATE and UPDATE for public.languages table.
 *
 * @param {Object} props
 * @param {Object|null} [props.language] - Existing language object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function LanguageForm({ language = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(language)

  const [formData, setFormData] = useState({
    language_name: language?.language_name || '',
    proficiency_level: language?.proficiency_level || 'Menengah',
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

  const handleSelectProficiency = (level) => {
    setFormData((prev) => ({ ...prev, proficiency_level: level }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.language_name.trim()) {
      errors.language_name = 'Nama bahasa wajib diisi.'
    }

    if (!formData.proficiency_level) {
      errors.proficiency_level = 'Pilih tingkat kemahiran.'
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
      language_name: formData.language_name.trim(),
      proficiency_level: formData.proficiency_level,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('languages')
          .update(payload)
          .eq('id', language.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data bahasa.')
        }

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('languages')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan bahasa baru.')
        }

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data bahasa.'
      )
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || screen.saved

  return (
    <FormPanel
      label={isEditMode ? 'Ubah bahasa' : 'Bahasa baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Bahasa belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan bahasa'}
    >
      <FormSection title="Bahasa">
        <Field id="lang-name" label="Nama bahasa" required error={fieldErrors.language_name} hint="Contoh: Inggris, Jepang.">
          <Input name="language_name" type="text" value={formData.language_name} onChange={handleChange} disabled={busy} />
        </Field>
        <ChoiceGroup
          name="lang-level"
          legend="Tingkat kemahiran"
          required
          options={PROFICIENCY_OPTIONS}
          value={formData.proficiency_level}
          onChange={handleSelectProficiency}
          error={fieldErrors.proficiency_level}
          disabled={busy}
        />
      </FormSection>
    </FormPanel>
  )
}

export default LanguageForm
