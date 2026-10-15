import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Checkbox, ChoiceGroup, Field, FormSection, Input, Textarea } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { useFormScreen } from './ui/useFormFeedback'

/**
 * ExperienceForm Component
 * Supports both CREATE and UPDATE operations for public.experiences table.
 *
 * @param {Object} props
 * @param {Object|null} [props.experience] - Existing experience object if editing
 * @param {(savedExp: Object) => void} props.onSuccess - Callback upon successful save
 * @param {() => void} props.onCancel - Callback when cancel button is clicked
 */
function ExperienceForm({ experience = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(experience)

  const [formData, setFormData] = useState({
    role: experience?.role || '',
    company: experience?.company || '',
    experience_type: experience?.experience_type || 'Kerja',
    location: experience?.location || '',
    start_date: experience?.start_date ? experience.start_date.split('T')[0] : '',
    end_date: experience?.end_date ? experience.end_date.split('T')[0] : '',
    is_current: experience?.is_current ?? false,
    description: experience?.description || '',
    sort_order: experience?.sort_order ?? 0,
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel })
  const { finish } = screen

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextVal = type === 'checkbox' ? checked : value

    setFormData((prev) => {
      const updated = { ...prev, [name]: nextVal }
      // If user marks is_current as true, clear end_date
      if (name === 'is_current' && checked) {
        updated.end_date = ''
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

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, experience_type: type }))
  }

  const validate = () => {
    const errors = {}

    if (!formData.role.trim()) {
      errors.role = 'Posisi wajib diisi.'
    } else if (formData.role.trim().length > 100) {
      errors.role = 'Posisi maksimal 100 karakter.'
    }

    if (!formData.company.trim()) {
      errors.company = 'Nama perusahaan atau organisasi wajib diisi.'
    } else if (formData.company.trim().length > 100) {
      errors.company = 'Nama perusahaan atau organisasi maksimal 100 karakter.'
    }

    if (!formData.start_date) {
      errors.start_date = 'Tanggal mulai wajib dipilih.'
    }

    if (!formData.is_current && formData.end_date && formData.start_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
      }
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
      role: formData.role.trim(),
      company: formData.company.trim(),
      experience_type: formData.experience_type || 'Kerja',
      location: formData.location.trim() || null,
      start_date: formData.start_date,
      end_date: formData.is_current ? null : formData.end_date || null,
      is_current: Boolean(formData.is_current),
      description: formData.description.trim() || null,
      sort_order: parseInt(formData.sort_order, 10) || 0,
    }

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
            options={['Kerja', 'Magang', 'PKL']}
            value={formData.experience_type}
            onChange={handleTypeSelect}
            hint="Kerja profesional, magang, atau PKL."
            disabled={busy}
          />
        </div>
        <Field id="exp-role" label="Posisi" required error={fieldErrors.role} hint="Contoh: Web Developer, Frontend Intern.">
          <Input name="role" type="text" value={formData.role} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="exp-company" label="Perusahaan atau organisasi" required error={fieldErrors.company} hint="Tempat kerja, klien, atau institusi.">
          <Input name="company" type="text" value={formData.company} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="exp-location" label="Lokasi" optional hint="Kota, atau tulis Remote.">
          <Input name="location" type="text" value={formData.location} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>

      <FormSection title="Waktu" columns={2}>
        <Field id="exp-start-date" label="Tanggal mulai" required error={fieldErrors.start_date}>
          <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} disabled={busy} />
        </Field>
        <Field
          id="exp-end-date"
          label="Tanggal selesai"
          optional
          error={fieldErrors.end_date}
          hint={formData.is_current ? 'Tidak perlu diisi karena masih berjalan.' : 'Kosongkan bila belum ada tanggalnya.'}
        >
          <Input
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            disabled={busy || formData.is_current}
          />
        </Field>
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

      <FormSection title="Keterangan" columns={2}>
        <Field
          id="exp-description"
          label="Tanggung jawab dan hasil"
          optional
          className="adm-span-2"
          hint="Ceritakan peran, teknologi yang dipakai, dan hasil kerjanya."
        >
          <Textarea name="description" rows={5} value={formData.description} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="exp-sort-order" label="Urutan tampil" error={fieldErrors.sort_order} hint="Angka kecil tampil lebih atas.">
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
      </FormSection>
    </FormPanel>
  )
}

export default ExperienceForm
