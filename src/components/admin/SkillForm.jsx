import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ImageField } from './ui/AssetUpload'
import { nextSortOrder, SKILL_CATEGORIES } from './ui/contentLabels'
import { ChoiceGroup, Field, FormSection, Input, QuickPicks } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { DisplaySettings } from './ui/Switch'
import { prepareUploads, useAssetField } from './ui/useAssetFields'
import { useFormScreen } from './ui/useFormFeedback'

const PROFICIENCY_PRESETS = ['Dasar', 'Menengah', 'Mahir']

/**
 * SkillForm Component
 * Supports both CREATE and UPDATE operations for public.skills table.
 *
 * @param {Object} props
 * @param {Object|null} [props.skill] - Existing skill object if in edit mode
 * @param {Array<Object>} [props.skills] - All skills (a new or moved skill goes last in its category)
 * @param {(savedSkill: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function SkillForm({ skill = null, skills = [], onSuccess, onCancel }) {
  const isEditMode = Boolean(skill)

  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || '',
    proficiency: skill?.proficiency || '',
    is_visible: skill?.is_visible ?? true,
    is_featured: Boolean(skill?.is_featured),
  })

  // Optional icon (logos/, 400 px), uploaded when saving
  const icon = useAssetField(skill?.icon_url, { folder: 'logos', imageKind: 'logo' })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: icon.dirty })
  const { finish } = screen

  // A category from before the fixed list stays selectable until it is changed
  const categoryOptions = [
    ...SKILL_CATEGORIES,
    ...(skill?.category && !SKILL_CATEGORIES.includes(skill.category) ? [{ value: skill.category, label: `${skill.category} (lama)` }] : []),
  ]

  const set = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError(null)
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Nama keahlian wajib diisi.'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Nama keahlian maksimal 100 karakter.'
    }

    if (!formData.category.trim()) {
      errors.category = 'Pilih salah satu kategori.'
    }

    if (/[\d%]/.test(formData.proficiency)) {
      errors.proficiency = 'Tulis tingkatnya dengan kata, tanpa angka atau persen.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }
    if (icon.busy) {
      setGeneralError('Tunggu sebentar, ikon yang dipilih masih diproses.')
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    let uploads
    try {
      uploads = await prepareUploads({ icon_url: icon })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah ikon.')
      setIsSubmitting(false)
      return
    }

    const category = formData.category.trim()
    const payload = {
      name: formData.name.trim(),
      category,
      proficiency: formData.proficiency.trim() || null,
      icon_url: uploads.values.icon_url,
      is_visible: Boolean(formData.is_visible),
      is_featured: Boolean(formData.is_featured),
    }
    // Order is per category: a new skill, or one moved to another category, goes last there
    if (!isEditMode || category !== skill.category) {
      payload.sort_order = nextSortOrder(skills.filter((s) => s.category === category && s.id !== skill?.id))
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

        await uploads.cleanup()
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
          hint="Nama teknologi, alat kerja, atau kemampuan. Contoh: Laravel, Mikrotik, Kerja tim."
        >
          <Input name="name" type="text" value={formData.name} onChange={handleChange} disabled={busy} />
        </Field>
        <div>
          <Field
            id="skill-proficiency"
            label="Tingkat"
            optional
            error={fieldErrors.proficiency}
            hint="Kata sederhana, tanpa angka atau persen."
          >
            <Input name="proficiency" type="text" value={formData.proficiency} onChange={handleChange} disabled={busy} />
          </Field>
          <QuickPicks
            label="Pilihan tingkat"
            options={PROFICIENCY_PRESETS}
            value={formData.proficiency}
            onPick={(value) => set('proficiency', value)}
            isSelected={(option, current) => current.toLowerCase() === option.toLowerCase()}
            disabled={busy}
          />
        </div>
        <div className="adm-span-2">
          <ChoiceGroup
            name="skill-category"
            legend="Kategori"
            required
            options={categoryOptions}
            value={formData.category}
            onChange={(value) => set('category', value)}
            error={fieldErrors.category}
            hint="Keahlian dikelompokkan per kategori di halaman publik."
            disabled={busy}
          />
        </div>
      </FormSection>

      <FormSection title="Ikon">
        <ImageField
          id="skill-icon"
          label="Ikon atau logo"
          field={icon}
          shape="square"
          imageKind="logo"
          hint="Logo teknologi, sebaiknya berlatar transparan. PNG, JPG, atau WebP; otomatis dikecilkan menjadi 400 px."
          disabled={busy}
        />
      </FormSection>

      <DisplaySettings
        idPrefix="skill"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        featured={formData.is_featured}
        onFeaturedChange={(value) => set('is_featured', value)}
        featuredLabel="Keahlian unggulan"
        featuredDescription="Ditonjolkan di bagian keahlian halaman publik."
        disabled={busy}
      />
    </FormPanel>
  )
}

export default SkillForm
