import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useProfile } from '../../hooks/useProfile'
import { prefersReducedMotion } from '../../lib/useMediaQuery'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useLeaveGuard, useToast } from '../../components/admin/ui/adminContexts'
import { Alert } from '../../components/admin/ui/Alert'
import { Button } from '../../components/admin/ui/Button'
import { Badge, Card } from '../../components/admin/ui/Card'
import { Skeleton } from '../../components/admin/ui/Feedback'
import { Field, FormSection, Input, Textarea } from '../../components/admin/ui/Field'
import { FormPanel } from '../../components/admin/ui/FormPanel'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconRefresh } from '../../components/admin/ui/icons'
import { useFormScreen } from '../../components/admin/ui/useFormFeedback'
import './AdminProfilePage.css'

/**
 * ProfileEditor Component
 * Internal form and preview manager keyed to profile data
 * Screen: one admin form in sections with a live preview; unsaved changes are guarded and
 * "Batalkan perubahan" (onReset) goes back to the stored values.
 */
function ProfileEditor({ profile, onSaveSuccess, onReset }) {
  const [formData, setFormData] = useState(() => ({
    full_name: profile?.full_name || '',
    tagline: profile?.tagline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    full_address: profile?.full_address || '',
    phone_number: profile?.phone_number || '',
    email: profile?.email || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    instagram_url: profile?.instagram_url || '',
    resume_url: profile?.resume_url || profile?.resume_link || '',
    resume_link: profile?.resume_link || profile?.resume_url || '',
    hobbies: Array.isArray(profile?.hobbies) ? profile.hobbies.join(', ') : '',
    avatar_url: profile?.avatar_url || '',
    is_available: profile?.is_available ?? true,
  }))

  const [isSaving, setIsSaving] = useState(false)
  const [generalError, setGeneralError] = useState(null)

  // Screen only: feedback, unsaved-changes guard, "Batalkan perubahan"
  const screen = useFormScreen({ data: formData, generalError, onCancel: onReset })
  const { finish } = screen

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (generalError) setGeneralError(null)
  }

  const handleToggleAvailable = () => {
    setFormData((prev) => ({
      ...prev,
      is_available: !prev.is_available,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.full_name.trim()) {
      setGeneralError('Nama lengkap wajib diisi.')
      return
    }

    setIsSaving(true)
    setGeneralError(null)

    const hobbiesArray = formData.hobbies
      ? formData.hobbies
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean)
      : []

    const resumeLinkVal = formData.resume_url.trim() || formData.resume_link.trim() || null

    const payload = {
      full_name: formData.full_name.trim(),
      tagline: formData.tagline.trim() || null,
      bio: formData.bio.trim() || null,
      location: formData.location.trim() || null,
      full_address: formData.full_address.trim() || null,
      phone_number: formData.phone_number.trim() || null,
      email: formData.email.trim() || null,
      github_url: formData.github_url.trim() || null,
      linkedin_url: formData.linkedin_url.trim() || null,
      instagram_url: formData.instagram_url.trim() || null,
      resume_url: resumeLinkVal,
      resume_link: resumeLinkVal,
      hobbies: hobbiesArray,
      avatar_url: formData.avatar_url.trim() || null,
      is_available: Boolean(formData.is_available),
      updated_at: new Date().toISOString(),
    }

    try {
      if (profile?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', profile.id)

        if (updateError) {
          throw new Error(updateError.message || 'Gagal memperbarui profil.')
        }
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([payload])

        if (insertError) {
          throw new Error(insertError.message || 'Gagal menyimpan profil baru.')
        }
      }

      finish(() => onSaveSuccess())
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat memperbarui profil.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const initials = formData.full_name
    ? formData.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD'

  const busy = isSaving || screen.saved
  // "Nama lengkap wajib diisi." belongs under its field; other messages go on top of the form
  const nameError = generalError === 'Nama lengkap wajib diisi.' ? generalError : null
  const topError =
    generalError && !nameError
      ? toFriendlyError(generalError, 'Profil belum tersimpan. Periksa koneksi internet, lalu coba lagi.')
      : ''
  const field = (name) => ({ name, value: formData[name], onChange: handleChange, disabled: busy })

  return (
    <div className="adm-profile">
      <FormPanel
        label="Profil"
        screen={screen}
        error={topError}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        submitLabel="Simpan profil"
        cancelLabel="Batalkan perubahan"
        cancelOnlyWhenDirty
      >
        <FormSection title="Data utama" columns={2}>
          <Field id="profile-full-name" label="Nama lengkap" required error={nameError}>
            <Input type="text" autoComplete="name" {...field('full_name')} />
          </Field>
          <Field id="profile-tagline" label="Profesi atau tagline" optional hint="Tampil di bawah nama, misalnya Web Developer.">
            <Input type="text" {...field('tagline')} />
          </Field>
          <Field id="profile-location" label="Kota" optional hint="Misalnya Kediri, Jawa Timur.">
            <Input type="text" {...field('location')} />
          </Field>
          <Field id="profile-email" label="Email kontak" optional>
            <Input type="email" inputMode="email" autoComplete="email" {...field('email')} />
          </Field>
          <Field id="profile-phone" label="Nomor telepon atau WhatsApp" optional>
            <Input type="tel" inputMode="tel" autoComplete="tel" {...field('phone_number')} />
          </Field>
          <Field id="profile-address" label="Alamat lengkap" optional hint="Hanya tersimpan di sini, tidak tampil di halaman publik.">
            <Input type="text" autoComplete="street-address" {...field('full_address')} />
          </Field>
          <Field id="profile-bio" label="Tentang saya" optional className="adm-span-2" hint="Tampil di bagian perkenalan halaman publik.">
            <Textarea rows={5} {...field('bio')} />
          </Field>
          <Field
            id="profile-hobbies"
            label="Hobi dan minat"
            optional
            className="adm-span-2"
            hint="Pisahkan dengan koma, misalnya: Fotografi, Membaca, Badminton."
          >
            <Input type="text" {...field('hobbies')} />
          </Field>
        </FormSection>

        <FormSection title="Status ketersediaan">
          <div className="adm-switch-row">
            <div className="adm-switch-text">
              <p id="profile-available-label" className="adm-switch-title">
                Terbuka untuk tawaran kerja dan proyek
              </p>
              <p id="profile-available-desc" className="adm-switch-desc">
                {formData.is_available
                  ? 'Halaman publik menampilkan "Terbuka untuk Peluang Kerja & Kolaborasi Proyek".'
                  : 'Halaman publik menampilkan "Sedang Tidak Tersedia untuk Proyek Baru".'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.is_available}
              aria-labelledby="profile-available-label"
              aria-describedby="profile-available-desc"
              className="adm-switch"
              onClick={handleToggleAvailable}
              disabled={busy}
            >
              <span className="adm-switch-track" aria-hidden="true">
                <span className="adm-switch-thumb" />
              </span>
              <span className="adm-switch-state" aria-hidden="true">
                {formData.is_available ? 'Ya' : 'Tidak'}
              </span>
            </button>
          </div>
        </FormSection>

        <FormSection title="Tautan" columns={2}>
          <Field id="profile-github" label="GitHub" optional>
            <Input type="url" inputMode="url" placeholder="https://github.com/" {...field('github_url')} />
          </Field>
          <Field id="profile-linkedin" label="LinkedIn" optional>
            <Input type="url" inputMode="url" placeholder="https://linkedin.com/in/" {...field('linkedin_url')} />
          </Field>
          <Field id="profile-instagram" label="Instagram" optional>
            <Input type="url" inputMode="url" placeholder="https://instagram.com/" {...field('instagram_url')} />
          </Field>
          <Field id="profile-resume" label="CV" optional hint="Tautan file CV, misalnya dari Google Drive.">
            <Input type="url" inputMode="url" placeholder="https://" {...field('resume_url')} />
          </Field>
        </FormSection>
      </FormPanel>

      <aside className="adm-profile-preview" aria-labelledby="profile-preview-title">
        <Card as="div" heading="Pratinjau" headingId="profile-preview-title">
          <div className="adm-preview">
            <div className="adm-preview-avatar">
              {formData.avatar_url ? <img src={formData.avatar_url} alt="" /> : <span aria-hidden="true">{initials}</span>}
            </div>
            <Badge tone={formData.is_available ? 'success' : 'neutral'} dot>
              {formData.is_available ? 'Terbuka untuk peluang kerja' : 'Sedang tidak tersedia'}
            </Badge>
            <div>
              <p className={`adm-preview-name${formData.full_name ? '' : ' is-placeholder'}`}>{formData.full_name || 'Nama lengkap'}</p>
              <p className={`adm-preview-tagline${formData.tagline ? '' : ' is-placeholder'}`}>{formData.tagline || 'Profesi atau tagline'}</p>
            </div>
            <p className={`adm-preview-bio${formData.bio ? '' : ' is-placeholder'}`}>
              {formData.bio || 'Tulisan "Tentang saya" tampil di sini.'}
            </p>
            {(formData.location || formData.email || formData.github_url || formData.linkedin_url) && (
              <dl className="adm-preview-facts">
                {formData.location && (
                  <div>
                    <dt>Kota</dt>
                    <dd>{formData.location}</dd>
                  </div>
                )}
                {formData.email && (
                  <div>
                    <dt>Email</dt>
                    <dd>{formData.email}</dd>
                  </div>
                )}
                {formData.github_url && (
                  <div>
                    <dt>GitHub</dt>
                    <dd>Terhubung</dd>
                  </div>
                )}
                {formData.linkedin_url && (
                  <div>
                    <dt>LinkedIn</dt>
                    <dd>Terhubung</dd>
                  </div>
                )}
              </dl>
            )}
            <p className="adm-preview-note">Pratinjau ringkas. Tampilan aslinya mengikuti desain halaman publik.</p>
          </div>
        </Card>
      </aside>
    </div>
  )
}
/**
 * AdminProfilePage Component (READ & UPDATE)
 * Provides comprehensive portfolio personal profile settings
 */
function AdminProfilePage() {
  return (
    <AdminRoot>
      <ProfileScreen />
    </AdminRoot>
  )
}

function ProfileScreen() {
  const { profile, isLoading, error, refetch } = useProfile({ includePrivateFields: true })

  // Screen only: toasts, guarded "Muat ulang", focus after saving, reset key for "Batalkan perubahan"
  const toast = useToast()
  const { confirmLeave } = useLeaveGuard()
  const headingRef = useRef(null)
  const savedRef = useRef(false)
  const [resetKey, setResetKey] = useState(0)

  const handleSaveSuccess = () => {
    toast.success('Profil disimpan. Perubahan langsung tampil di halaman publik.')
    savedRef.current = true
    refetch()
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  // After saving, the form reloads with the stored data: put focus back on the heading
  useEffect(() => {
    if (isLoading || !savedRef.current) return
    savedRef.current = false
    headingRef.current?.focus({ preventScroll: true })
  }, [isLoading])

  const reload = async () => {
    if (await confirmLeave()) refetch()
  }

  return (
    <AdminLayout
      title="Profil"
      description="Data diri yang tampil di halaman publik: nama, perkenalan, status, dan tautan."
      headingRef={headingRef}
      actions={
        <Button variant="secondary" icon={<IconRefresh size={18} />} onClick={reload} loading={isLoading} loadingText="Memuat...">
          Muat ulang
        </Button>
      }
    >
      {isLoading && <Skeleton variant="form" rows={4} label="Memuat profil..." />}

      {!isLoading && error && (
        <Alert
          tone="danger"
          title="Profil belum bisa dimuat."
          action={
            <Button size="sm" variant="secondary" icon={<IconRefresh size={16} />} onClick={refetch}>
              Coba lagi
            </Button>
          }
        >
          {toFriendlyError(error, 'Periksa koneksi internet, lalu coba lagi.')}
        </Alert>
      )}

      {!isLoading && !error && (
        <ProfileEditor
          key={`${profile?.id || 'new-profile'}-${resetKey}`}
          profile={profile}
          onSaveSuccess={handleSaveSuccess}
          onReset={() => setResetKey((n) => n + 1)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminProfilePage
