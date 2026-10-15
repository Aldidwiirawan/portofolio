import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Field, FormSection, Input, Textarea } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { useFormScreen } from './ui/useFormFeedback'

/**
 * OrganizationForm Component
 * Supports CREATE and UPDATE for public.organizations table.
 *
 * @param {Object} props
 * @param {Object|null} [props.organization] - Existing organization object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function OrganizationForm({ organization = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(organization)

  const [formData, setFormData] = useState({
    name: organization?.name || '',
    role: organization?.role || '',
    start_date: organization?.start_date ? organization.start_date.split('T')[0] : '',
    end_date: organization?.end_date ? organization.end_date.split('T')[0] : '',
    description: organization?.description || '',
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

    if (!formData.name.trim()) {
      errors.name = 'Nama organisasi wajib diisi.'
    }

    if (!formData.role.trim()) {
      errors.role = 'Jabatan wajib diisi.'
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        errors.end_date = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.'
      }
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
      name: formData.name.trim(),
      role: formData.role.trim(),
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description.trim() || null,
    }

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

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data organisasi.'
      )
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || screen.saved

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

      <FormSection title="Waktu" columns={2}>
        <Field id="org-start-date" label="Tanggal mulai" optional>
          <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="org-end-date" label="Tanggal selesai" optional error={fieldErrors.end_date} hint="Kosongkan bila masih aktif.">
          <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>

      <FormSection title="Keterangan">
        <Field id="org-desc" label="Tanggung jawab dan kontribusi" optional hint="Ceritakan apa yang Anda kerjakan di sana.">
          <Textarea name="description" rows={4} value={formData.description} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>
    </FormPanel>
  )
}

export default OrganizationForm
