import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Field, FormSection, Input } from './ui/Field'
import { FormPanel } from './ui/FormPanel'
import { toFriendlyError } from './ui/friendlyError'
import { useFormScreen } from './ui/useFormFeedback'

/**
 * CertificationForm Component
 * Supports CREATE and UPDATE for public.certifications table.
 *
 * @param {Object} props
 * @param {Object|null} [props.certification] - Existing certification object
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function CertificationForm({ certification = null, onSuccess, onCancel }) {
  const isEditMode = Boolean(certification)

  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuer: certification?.issuer || '',
    issue_date: certification?.issue_date ? certification.issue_date.split('T')[0] : '',
    credential_url: certification?.credential_url || '',
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
      errors.name = 'Nama sertifikat wajib diisi.'
    }

    if (!formData.issuer.trim()) {
      errors.issuer = 'Penerbit wajib diisi.'
    }

    if (formData.credential_url.trim()) {
      try {
        new URL(formData.credential_url.trim())
      } catch {
        errors.credential_url = 'Tautan sertifikat harus diawali http:// atau https://.'
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
      issuer: formData.issuer.trim(),
      issue_date: formData.issue_date || null,
      credential_url: formData.credential_url.trim() || null,
    }

    try {
      if (isEditMode) {
        const { data, error: dbError } = await supabase
          .from('certifications')
          .update(payload)
          .eq('id', certification.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal memperbarui data sertifikasi.')
        }

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      } else {
        const { data, error: dbError } = await supabase
          .from('certifications')
          .insert([payload])
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Gagal menambahkan sertifikasi baru.')
        }

        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data sertifikasi.'
      )
      setIsSubmitting(false)
    }
  }

  const busy = isSubmitting || screen.saved

  return (
    <FormPanel
      label={isEditMode ? 'Ubah sertifikat' : 'Sertifikat baru'}
      screen={screen}
      error={generalError ? toFriendlyError(generalError, 'Sertifikat belum tersimpan. Periksa koneksi internet, lalu coba lagi.') : ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isEditMode ? 'Simpan perubahan' : 'Simpan sertifikat'}
    >
      <FormSection title="Sertifikat" columns={2}>
        <Field id="cert-name" label="Nama sertifikat" required className="adm-span-2" error={fieldErrors.name} hint="Contoh: Dasar Pemrograman Web.">
          <Input name="name" type="text" value={formData.name} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="cert-issuer" label="Penerbit" required error={fieldErrors.issuer} hint="Lembaga yang memberi sertifikat, misalnya Dicoding.">
          <Input name="issuer" type="text" value={formData.issuer} onChange={handleChange} disabled={busy} />
        </Field>
        <Field id="cert-date" label="Tanggal terbit" optional>
          <Input name="issue_date" type="date" value={formData.issue_date} onChange={handleChange} disabled={busy} />
        </Field>
        <Field
          id="cert-url"
          label="Tautan sertifikat"
          optional
          className="adm-span-2"
          error={fieldErrors.credential_url}
          hint="Tautan untuk memeriksa keaslian, atau file PDF sertifikat."
        >
          <Input name="credential_url" type="url" inputMode="url" placeholder="https://" value={formData.credential_url} onChange={handleChange} disabled={busy} />
        </Field>
      </FormSection>
    </FormPanel>
  )
}

export default CertificationForm
