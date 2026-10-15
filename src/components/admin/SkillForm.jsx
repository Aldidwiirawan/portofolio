import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Field, FormSection, Input, QuickPicks } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { useFormScreen } from './ui/useFormFeedback'

const CATEGORY_PRESETS = ['Frontend', 'Backend', 'Database', 'Tools']
const PROFICIENCY_PRESETS = ['Dasar', 'Menengah', 'Mahir', 'Dasar / Menengah']

/**
 * SkillForm Component
 * Supports both CREATE and UPDATE operations for public.skills table.
 *
 * @param {Object} props
 * @param {Object|null} [props.skill] - Existing skill object if in edit mode
 * @param {(savedSkill: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function SkillForm({ skill = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(skill)

  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || 'Frontend',
    proficiency: skill?.proficiency || 'Menengah',
    sort_order: skill?.sort_order ?? 0,
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

  const handleSelectCategoryPreset = (preset) => {
    setFormData((prev) => ({ ...prev, category: preset }))
    if (fieldErrors.category) {
      setFieldErrors((prev) => ({ ...prev, category: null }))
    }
  }

  const handleSelectProficiencyPreset = (preset) => {
    setFormData((prev) => ({ ...prev, proficiency: preset }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Nama keahlian wajib diisi.'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Nama keahlian maksimal 100 karakter.'
    }

    if (!formData.category.trim()) {
      errors.category = 'Kategori wajib diisi. Pilih salah satu atau ketik sendiri.'
    }

    const sortOrderVal = Number(formData.sort_order)
    if (isNaN(sortOrderVal) || !Number.isInteger(sortOrderVal) || sortOrderVal < 0) {
      errors.sort_order = 'Urutan tampil harus berupa angka bulat 0 atau lebih.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      proficiency: formData.proficiency.trim() || null,
      sort_order: parseInt(formData.sort_order, 10) || 0,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('skills')
          .update(payload)
          .eq('id', skill.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui skill di database.')
        }

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('skills')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan skill baru ke database.')
        }

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem yang tidak terduga saat menyimpan data.'
      )
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || screen.saved

  return (
    <FormPanel
      label={isEditMode ? 'Ubah keahlian' : 'Keahlian baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Keahlian belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan keahlian'}
    >
      <FormSection title="Keahlian" columns={2}>
        <Field
          id="skill-name"
          label="Nama keahlian"
          required
          error={fieldErrors.name}
          hint="Nama teknologi, bahasa, atau alat kerja. Contoh: React, PostgreSQL, Figma."
        >
          <Input name="name" type="text" value={formData.name} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="skill-sort-order" label="Urutan tampil" error={fieldErrors.sort_order} hint="Angka kecil tampil lebih dulu.">
          <Input
            name="sort_order"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={formData.sort_order}
            onChange={handleChange}
            disabled={busy}
          />
        </Field>
        <div>
          <Field id="skill-category" label="Kategori" required error={fieldErrors.category} hint="Pilih salah satu, atau ketik sendiri.">
            <Input name="category" type="text" value={formData.category} onChange={handleChange} disabled={busy} />
          </Field>
          <QuickPicks
            label="Pilihan kategori"
            options={CATEGORY_PRESETS}
            value={formData.category}
            onPick={handleSelectCategoryPreset}
            isSelected={(option, current) => current.toLowerCase() === option.toLowerCase()}
            disabled={busy}
          />
        </div>
        <div>
          <Field id="skill-proficiency" label="Tingkat kemahiran" optional hint="Pilih salah satu, atau ketik sendiri.">
            <Input name="proficiency" type="text" value={formData.proficiency} onChange={handleChange} disabled={busy} />
          </Field>
          <QuickPicks
            label="Pilihan tingkat kemahiran"
            options={PROFICIENCY_PRESETS}
            value={formData.proficiency}
            onPick={handleSelectProficiencyPreset}
            disabled={busy}
          />
        </div>
      </FormSection>
    </FormPanel>
  )
}

export default SkillForm
