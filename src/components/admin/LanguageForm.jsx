import { useState } from 'react'
import { englishColumnsMissing } from '../../lib/englishColumns'
import { supabase } from '../../lib/supabaseClient'
import { LANGUAGE_LEVELS } from './ui/contentLabels'
import { EnglishField, EnglishSection } from './ui/EnglishFields'
import { Field, FormSection, Input, QuickPicks } from './ui/Field'
import { englishText } from './ui/formValues'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { DisplaySettings } from './ui/Switch'
import { useFormScreen } from './ui/useFormFeedback'

/**
 * LanguageForm Component
 * Supports CREATE and UPDATE for public.languages table.
 *
 * @param {Object} props
 * @param {Object|null} [props.language] - Existing language object
 * @param {number} [props.nextSortOrder] - Position of a new language (end of the list)
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function LanguageForm({ language = null, nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(language)

  const [formData, setFormData] = useState({
    language_name: language?.language_name || '',
    proficiency_level: language?.proficiency_level || '',
    is_visible: language?.is_visible ?? true,
    // Versi Inggris (stage 3C)
    language_name_en: language?.language_name_en || '',
    proficiency_level_en: language?.proficiency_level_en || '',
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel })
  const { finish } = screen

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError(null)
  }

  const validate = () => {
    const errors = {}

    if (!formData.language_name.trim()) {
      errors.language_name = 'Nama bahasa wajib diisi.'
    }

    if (!formData.proficiency_level.trim()) {
      errors.proficiency_level = 'Tulis tingkat kemampuan, atau pilih salah satu.'
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
      proficiency_level: formData.proficiency_level.trim(),
      is_visible: Boolean(formData.is_visible),
    }
    if (!englishColumnsMissing()) {
      Object.assign(payload, {
        language_name_en: englishText(formData.language_name_en),
        proficiency_level_en: englishText(formData.proficiency_level_en),
      })
    }
    // A new language goes to the end of the list; the order is changed with Naik/Turun
    if (!isEditMode) payload.sort_order = nextSortOrder

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
  // Versi Inggris (stage 3C)
  const english = (name) => ({
    name,
    value: formData[name],
    onChange: (e) => setFormData((prev) => ({ ...prev, [name]: e.target.value })),
    disabled: busy,
  })

  return (
    <FormPanel
      label={isEditMode ? 'Ubah bahasa' : 'Bahasa baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Bahasa belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan bahasa'}
    >
      <FormSection title="Bahasa" columns={2}>
        <Field id="lang-name" label="Nama bahasa" required error={fieldErrors.language_name} hint="Contoh: Inggris, Jepang.">
          <Input type="text" value={formData.language_name} onChange={(e) => set('language_name', e.target.value)} disabled={busy} />
        </Field>
        <div>
          <Field
            id="lang-level"
            label="Tingkat kemampuan"
            required
            error={fieldErrors.proficiency_level}
            hint="Teks sederhana, misalnya Aktif atau Dasar. Skor tes (mis. TOEIC) dicatat di Sertifikat."
          >
            <Input type="text" value={formData.proficiency_level} onChange={(e) => set('proficiency_level', e.target.value)} disabled={busy} />
          </Field>
          <QuickPicks
            label="Pilihan tingkat kemampuan"
            options={LANGUAGE_LEVELS}
            value={formData.proficiency_level}
            onPick={(value) => set('proficiency_level', value)}
            isSelected={(option, current) => current.trim().toLowerCase() === option.toLowerCase()}
            disabled={busy}
          />
        </div>
      </FormSection>

      <EnglishSection values={[formData.language_name_en, formData.proficiency_level_en]}>
        <EnglishField
          id="lang-language-name-en"
          label="Nama bahasa"
          original={formData.language_name}
          {...english('language_name_en')}
        />
        <EnglishField
          id="lang-proficiency-level-en"
          label="Tingkat kemampuan"
          original={formData.proficiency_level}
          note="Tingkat standar (Penutur asli, Aktif, Menengah, Dasar) sudah diterjemahkan otomatis; isi hanya untuk tingkat lain."
          {...english('proficiency_level_en')}
        />
      </EnglishSection>

      <DisplaySettings
        idPrefix="lang"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        disabled={busy}
      />
    </FormPanel>
  )
}

export default LanguageForm
