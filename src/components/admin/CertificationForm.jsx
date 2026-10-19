import { useState } from 'react'
import { englishColumnsMissing } from '../../lib/englishColumns'
import { supabase } from '../../lib/supabaseClient'
import { ImageField, PdfUpload } from './ui/AssetUpload'
import { CERTIFICATE_CATEGORIES } from './ui/contentLabels'
import { EnglishField, EnglishSection } from './ui/EnglishFields'
import { Checkbox, Field, FormSection, Input, Select } from './ui/Field'
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
 * CertificationForm Component
 * Supports CREATE and UPDATE for public.certifications table (also used for trainings).
 *
 * @param {Object} props
 * @param {Object|null} [props.certification] - Existing certification object
 * @param {number} [props.nextSortOrder] - Position of a new certificate (end of the list)
 * @param {(saved: Object) => void} props.onSuccess - Callback on save success
 * @param {() => void} props.onCancel - Callback when canceled
 */
function CertificationForm({ certification = null, nextSortOrder = 0, onSuccess, onCancel }) {
  const isEditMode = Boolean(certification)

  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuer: certification?.issuer || '',
    category: certification?.category || '',
    issue: dateToMonthYear(certification?.issue_date),
    expiry: dateToMonthYear(certification?.expiry_date),
    no_expiry: Boolean(certification?.no_expiry),
    credential_id: certification?.credential_id || '',
    credential_url: certification?.credential_url || '',
    score: certification?.score || '',
    is_visible: certification?.is_visible ?? true,
    // Versi Inggris (stage 3C)
    name_en: certification?.name_en || '',
    issuer_en: certification?.issuer_en || '',
    is_featured: Boolean(certification?.is_featured),
  })

  // Certificate image and the original PDF (both in certificates/), uploaded when saving
  const image = useAssetField(certification?.image_url, { folder: 'certificates' })
  const pdf = useAssetField(certification?.pdf_url, { folder: 'certificates', type: 'pdf' })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Screen only: feedback, unsaved-changes guard, guarded cancel
  const screen = useFormScreen({ data: formData, generalError, onCancel, extraDirty: image.dirty || pdf.dirty })
  const { finish } = screen

  const set = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      // "Tidak kedaluwarsa": no expiry date
      if (name === 'no_expiry' && value) updated.expiry = { month: '', year: '' }
      return updated
    })
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
    if (generalError) setGeneralError(null)
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Nama sertifikat wajib diisi.'
    }

    if (!formData.issuer.trim()) {
      errors.issuer = 'Penerbit wajib diisi.'
    }

    const issueProblem = checkMonthYear(formData.issue)
    if (issueProblem) errors.issue = issueProblem

    if (!formData.no_expiry) {
      const expiryProblem = checkMonthYear(formData.expiry)
      if (expiryProblem) {
        errors.expiry = expiryProblem
      } else if (!issueProblem && formData.issue.year && formData.expiry.year) {
        if (monthYearToDate(formData.expiry) < monthYearToDate(formData.issue)) {
          errors.expiry = 'Masa berlaku tidak boleh lebih awal dari tanggal terbit.'
        }
      }
    }

    if (formData.credential_url.trim()) {
      try {
        new URL(formData.credential_url.trim())
      } catch {
        errors.credential_url = 'Tautan verifikasi harus diawali http:// atau https://.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return
    if (image.busy || pdf.busy) {
      setGeneralError('Tunggu sebentar, file yang dipilih masih diproses.')
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    let uploads
    try {
      uploads = await prepareUploads({ image_url: image, pdf_url: pdf })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah file.')
      setIsSubmitting(false)
      return
    }

    const payload = {
      name: formData.name.trim(),
      issuer: formData.issuer.trim(),
      issue_date: monthYearToDate(formData.issue),
      credential_url: formData.credential_url.trim() || null,
      category: formData.category || null,
      expiry_date: formData.no_expiry ? null : monthYearToDate(formData.expiry),
      no_expiry: Boolean(formData.no_expiry),
      credential_id: formData.credential_id.trim() || null,
      score: formData.score.trim() || null,
      image_url: uploads.values.image_url,
      pdf_url: uploads.values.pdf_url,
      is_visible: Boolean(formData.is_visible),
      is_featured: Boolean(formData.is_featured),
    }
    if (!englishColumnsMissing()) {
      Object.assign(payload, {
        name_en: englishText(formData.name_en),
        issuer_en: englishText(formData.issuer_en),
      })
    }
    // A new certificate goes to the end of the list; the order is changed with Naik/Turun
    if (!isEditMode) payload.sort_order = nextSortOrder

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

        await uploads.cleanup()
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

        await uploads.cleanup()
        setIsSubmitting(false)
        finish(() => onSuccess(data))
      }
    } catch (err) {
      await uploads.rollback()
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menyimpan data sertifikasi.'
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
  const input = (name) => ({ name, value: formData[name], onChange: handleChange, disabled: busy })

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
        <Field id="cert-name" label="Nama sertifikat atau pelatihan" required className="adm-span-2" error={fieldErrors.name} hint="Contoh: Junior Web Developer, MikroTik MTCNA.">
          <Input type="text" {...input('name')} />
        </Field>
        <Field id="cert-issuer" label="Penerbit" required error={fieldErrors.issuer} hint="Lembaga yang memberi sertifikat, misalnya BNSP atau Dicoding.">
          <Input type="text" {...input('issuer')} />
        </Field>
        <Field id="cert-category" label="Kategori" optional>
          <Select {...input('category')}>
            <option value="">Belum dipilih</option>
            {CERTIFICATE_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Masa berlaku" columns={2}>
        <MonthYearSelect
          id="cert-issue"
          legend="Tanggal terbit"
          optional
          value={formData.issue}
          onChange={(value) => set('issue', value)}
          error={fieldErrors.issue}
          maxYear={THIS_YEAR}
          disabled={busy}
        />
        <MonthYearSelect
          id="cert-expiry"
          legend="Berlaku sampai"
          optional
          value={formData.expiry}
          onChange={(value) => set('expiry', value)}
          error={fieldErrors.expiry}
          hint={formData.no_expiry ? 'Tidak perlu diisi karena tidak kedaluwarsa.' : 'Kosongkan bila tidak tercantum.'}
          maxYear={THIS_YEAR + 10}
          disabled={busy || formData.no_expiry}
        />
        <div className="adm-span-2">
          <Checkbox
            id="cert-no-expiry"
            label="Tidak kedaluwarsa"
            description="Sertifikat berlaku selamanya."
            checked={formData.no_expiry}
            onChange={(e) => set('no_expiry', e.target.checked)}
            disabled={busy}
          />
        </div>
      </FormSection>

      <FormSection title="Bukti dan nilai" columns={2}>
        <Field id="cert-credential-id" label="Nomor kredensial" optional hint="Nomor yang tertulis di sertifikat.">
          <Input type="text" autoComplete="off" {...input('credential_id')} />
        </Field>
        <Field id="cert-score" label="Skor" optional hint="Isi bila ada, misalnya TOEIC 785.">
          <Input type="text" {...input('score')} />
        </Field>
        <Field
          id="cert-url"
          label="Tautan verifikasi"
          optional
          className="adm-span-2"
          error={fieldErrors.credential_url}
          hint="Halaman resmi untuk memeriksa keaslian sertifikat."
        >
          <Input type="url" inputMode="url" placeholder="https://" {...input('credential_url')} />
        </Field>
      </FormSection>

      <FormSection title="File sertifikat" columns={2}>
        <ImageField
          id="cert-image"
          label="Gambar sertifikat"
          field={image}
          hint="Foto atau tangkapan layar sertifikat. Otomatis dikecilkan sebelum diunggah."
          disabled={busy}
        />
        <PdfUpload
          id="cert-pdf"
          label="File PDF asli"
          field={pdf}
          hint="Untuk pratinjau di halaman publik. PDF sampai 5 MB."
          disabled={busy}
        />
      </FormSection>

      <EnglishSection values={[formData.name_en, formData.issuer_en]}>
        <EnglishField
          id="cert-name-en"
          label="Nama sertifikat atau pelatihan"
          original={formData.name}
          {...english('name_en')}
        />
        <EnglishField id="cert-issuer-en" label="Penerbit" original={formData.issuer} {...english('issuer_en')} />
      </EnglishSection>

      <DisplaySettings
        idPrefix="cert"
        visible={formData.is_visible}
        onVisibleChange={(value) => set('is_visible', value)}
        featured={formData.is_featured}
        onFeaturedChange={(value) => set('is_featured', value)}
        featuredLabel="Sertifikat unggulan"
        featuredDescription="Tampil di halaman publik. Pilih 3–6 sertifikat terbaik; sisanya bisa dilihat di LinkedIn."
        disabled={busy}
      />
    </FormPanel>
  )
}

export default CertificationForm
