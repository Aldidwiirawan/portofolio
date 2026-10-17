import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useProfile } from '../../hooks/useProfile'
import { prefersReducedMotion } from '../../lib/useMediaQuery'
import { AdminLayout, AdminRoot } from '../../components/admin/ui/AdminLayout'
import { useLeaveGuard, useToast } from '../../components/admin/ui/adminContexts'
import { Alert } from '../../components/admin/ui/Alert'
import { ImageField, PdfUpload } from '../../components/admin/ui/AssetUpload'
import { Button } from '../../components/admin/ui/Button'
import { Badge, Card } from '../../components/admin/ui/Card'
import { Skeleton } from '../../components/admin/ui/Feedback'
import { Field, FormSection, Input, Textarea } from '../../components/admin/ui/Field'
import { cleanList } from '../../components/admin/ui/formValues'
import { FormPanel } from '../../components/admin/ui/FormPanel'
import { toFriendlyError } from '../../components/admin/ui/friendlyError'
import { IconRefresh } from '../../components/admin/ui/icons'
import { ListInput } from '../../components/admin/ui/ListInput'
import { Switch } from '../../components/admin/ui/Switch'
import { prepareUploads, useAssetField } from '../../components/admin/ui/useAssetFields'
import { useFormScreen } from '../../components/admin/ui/useFormFeedback'
import './AdminProfilePage.css'

const NAME_REQUIRED = 'Nama lengkap wajib diisi.'
const GITHUB_USERNAME = /^[A-Za-z0-9-]{1,39}$/

/** 'https://github.com/Aldidwiirawan/repo' → 'Aldidwiirawan' (or '' when it is not a GitHub URL) */
function githubUsernameFromUrl(url) {
  const match = String(url || '').match(/github\.com\/([A-Za-z0-9-]{1,39})(?:[/?#]|$)/i)
  return match ? match[1] : ''
}

function checkGithubUsername(value) {
  const name = value.trim()
  if (!name) return null
  if (!GITHUB_USERNAME.test(name) || /(^-|-$|--)/.test(name)) {
    return 'Username GitHub hanya berisi huruf, angka, dan tanda hubung (maksimal 39 karakter), tanpa @ atau alamat lengkap.'
  }
  return null
}

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
    primary_role: profile?.primary_role || '',
    secondary_roles: Array.isArray(profile?.secondary_roles) ? profile.secondary_roles : [],
    hero_keywords: Array.isArray(profile?.hero_keywords) ? profile.hero_keywords : [],
    bio: profile?.bio || '',
    location: profile?.location || '',
    full_address: profile?.full_address || '',
    phone_number: profile?.phone_number || '',
    email: profile?.email || '',
    github_url: profile?.github_url || '',
    github_username: profile?.github_username || '',
    linkedin_url: profile?.linkedin_url || '',
    instagram_url: profile?.instagram_url || '',
    resume_url: profile?.resume_url || profile?.resume_link || '',
    resume_link: profile?.resume_link || profile?.resume_url || '',
    hobbies: Array.isArray(profile?.hobbies) ? profile.hobbies.join(', ') : '',
    contact_topics: Array.isArray(profile?.contact_topics) ? profile.contact_topics : [],
    is_available: profile?.is_available ?? true,
  }))

  // Files: profile photo (profile/) and the CV as PDF (cv/); uploaded when saving
  const avatar = useAssetField(profile?.avatar_url, { folder: 'profile' })
  const cv = useAssetField(profile?.cv_file_url, { folder: 'cv', type: 'pdf' })

  const [isSaving, setIsSaving] = useState(false)
  const [generalError, setGeneralError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // Screen only: feedback, unsaved-changes guard, "Batalkan perubahan"
  const screen = useFormScreen({ data: formData, generalError, onCancel: onReset, extraDirty: avatar.dirty || cv.dirty })
  const { finish } = screen

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (generalError) setGeneralError(null)
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
  }

  const setList = (name) => (items) => setFormData((prev) => ({ ...prev, [name]: items }))

  // Filling the GitHub link also suggests the username (only while that field is empty or was
  // suggested from the link before)
  const handleGithubUrlChange = (e) => {
    const url = e.target.value
    setFormData((prev) => {
      const before = githubUsernameFromUrl(prev.github_url)
      const suggested = githubUsernameFromUrl(url)
      const keepTyped = prev.github_username && prev.github_username !== before
      return { ...prev, github_url: url, github_username: keepTyped ? prev.github_username : suggested }
    })
    if (fieldErrors.github_username) setFieldErrors((prev) => ({ ...prev, github_username: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = {}
    if (!formData.full_name.trim()) errors.full_name = NAME_REQUIRED
    const usernameProblem = checkGithubUsername(formData.github_username)
    if (usernameProblem) errors.github_username = usernameProblem
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setGeneralError(null)
      return
    }
    if (avatar.busy || cv.busy) {
      setGeneralError('Tunggu sebentar, file yang dipilih masih diproses.')
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

    let uploads
    try {
      uploads = await prepareUploads({ avatar_url: avatar, cv_file_url: cv })
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Gagal mengunggah file.')
      setIsSaving(false)
      return
    }

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
      avatar_url: uploads.values.avatar_url,
      is_available: Boolean(formData.is_available),
      cv_file_url: uploads.values.cv_file_url,
      primary_role: formData.primary_role.trim() || null,
      secondary_roles: cleanList(formData.secondary_roles),
      hero_keywords: cleanList(formData.hero_keywords),
      github_username: formData.github_username.trim() || null,
      contact_topics: cleanList(formData.contact_topics),
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

      await uploads.cleanup()
      finish(() => onSaveSuccess())
    } catch (err) {
      await uploads.rollback()
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
  const topError = generalError
    ? toFriendlyError(generalError, 'Profil belum tersimpan. Periksa koneksi internet, lalu coba lagi.')
    : ''
  const field = (name) => ({ name, value: formData[name], onChange: handleChange, disabled: busy })
  const roles = [formData.primary_role.trim(), ...cleanList(formData.secondary_roles)].filter(Boolean)
  const keywords = cleanList(formData.hero_keywords)

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
          <Field id="profile-full-name" label="Nama lengkap" required error={fieldErrors.full_name}>
            <Input type="text" autoComplete="name" {...field('full_name')} />
          </Field>
          <Field id="profile-tagline" label="Profesi atau tagline" optional hint="Tampil di bawah nama, misalnya Web Developer.">
            <Input type="text" {...field('tagline')} />
          </Field>
          <Field id="profile-location" label="Kota" optional hint="Cukup nama kota, misalnya Kediri.">
            <Input type="text" autoComplete="address-level2" {...field('location')} />
          </Field>
          <Field id="profile-email" label="Email kontak" optional>
            <Input type="email" inputMode="email" autoComplete="email" {...field('email')} />
          </Field>
          <Field id="profile-phone" label="Nomor telepon atau WhatsApp" optional hint="Tidak tampil di halaman publik, tapi jangan isi data rahasia.">
            <Input type="tel" inputMode="tel" autoComplete="tel" {...field('phone_number')} />
          </Field>
          <Field id="profile-address" label="Alamat lengkap" optional hint="Tidak tampil di halaman publik, tapi jangan isi data rahasia.">
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

        <FormSection title="Foto dan CV" columns={2}>
          <ImageField
            id="profile-avatar"
            label="Foto profil"
            field={avatar}
            shape="square"
            hint="Foto wajah yang jelas dengan latar rapi. PNG, JPG, atau WebP sampai 10 MB; otomatis dikecilkan sebelum diunggah."
            disabled={busy}
          />
          <PdfUpload
            id="profile-cv"
            label="CV (PDF)"
            field={cv}
            hint="File PDF sampai 5 MB. Pengunjung bisa mengunduhnya dari halaman publik."
            disabled={busy}
          />
          <Field
            id="profile-resume"
            label="Tautan CV cadangan"
            optional
            className="adm-span-2"
            hint="Dipakai selama belum ada file CV yang diunggah, misalnya tautan Google Drive."
          >
            <Input type="url" inputMode="url" placeholder="https://" {...field('resume_url')} />
          </Field>
        </FormSection>

        <FormSection title="Peran dan kata berganti" columns={2}>
          <Field
            id="profile-primary-role"
            label="Peran utama"
            optional
            hint="Peran yang paling ingin Anda tonjolkan, misalnya Junior Programmer (Web & Mobile)."
          >
            <Input type="text" maxLength={60} {...field('primary_role')} />
          </Field>
          <ListInput
            id="profile-secondary-roles"
            label="Peran pendukung"
            optional
            value={formData.secondary_roles}
            onChange={setList('secondary_roles')}
            max={2}
            itemLabel="Peran"
            addLabel="Tambah peran"
            placeholder="Contoh: IT Support"
            maxLength={60}
            hint="Peran lain yang juga Anda kuasai."
            disabled={busy}
          />
          <div className="adm-span-2">
            <ListInput
              id="profile-hero-keywords"
              label="Kata berganti di bagian pembuka"
              optional
              value={formData.hero_keywords}
              onChange={setList('hero_keywords')}
              max={8}
              itemLabel="Kata"
              addLabel="Tambah kata"
              placeholder="Contoh: aplikasi web"
              maxLength={40}
              hint="Kata yang muncul bergantian, misalnya aplikasi web, aplikasi mobile, jaringan & IT support."
              disabled={busy}
            />
          </div>
        </FormSection>

        <FormSection title="Status ketersediaan">
          <Switch
            id="profile-available"
            label="Terbuka untuk tawaran kerja dan proyek"
            description={
              formData.is_available
                ? 'Halaman publik menampilkan "Terbuka untuk Peluang Kerja & Kolaborasi Proyek".'
                : 'Halaman publik menampilkan "Sedang Tidak Tersedia untuk Proyek Baru".'
            }
            checked={formData.is_available}
            onChange={(value) => setFormData((prev) => ({ ...prev, is_available: value }))}
            disabled={busy}
          />
        </FormSection>

        <FormSection title="Tautan" columns={2}>
          <Field id="profile-github" label="GitHub" optional>
            <Input
              type="url"
              inputMode="url"
              placeholder="https://github.com/"
              name="github_url"
              value={formData.github_url}
              onChange={handleGithubUrlChange}
              disabled={busy}
            />
          </Field>
          <Field
            id="profile-github-username"
            label="Username GitHub"
            optional
            error={fieldErrors.github_username}
            hint="Untuk grafik kontribusi GitHub di halaman publik. Terisi otomatis dari tautan GitHub."
          >
            <Input type="text" autoComplete="off" spellCheck={false} placeholder="Contoh: Aldidwiirawan" {...field('github_username')} />
          </Field>
          <Field id="profile-linkedin" label="LinkedIn" optional hint="Riwayat dan sertifikat lengkap diarahkan ke sini.">
            <Input type="url" inputMode="url" placeholder="https://linkedin.com/in/" {...field('linkedin_url')} />
          </Field>
          <Field id="profile-instagram" label="Instagram" optional>
            <Input type="url" inputMode="url" placeholder="https://instagram.com/" {...field('instagram_url')} />
          </Field>
        </FormSection>

        <FormSection title="Formulir kontak">
          <ListInput
            id="profile-contact-topics"
            label="Pilihan topik pesan"
            optional
            value={formData.contact_topics}
            onChange={setList('contact_topics')}
            max={8}
            itemLabel="Topik"
            addLabel="Tambah topik"
            placeholder="Contoh: Tawaran kerja"
            maxLength={60}
            hint="Pengunjung memilih salah satu topik ini saat mengirim pesan."
            disabled={busy}
          />
        </FormSection>
      </FormPanel>

      <aside className="adm-profile-preview" aria-labelledby="profile-preview-title">
        <Card as="div" heading="Pratinjau" headingId="profile-preview-title">
          <div className="adm-preview">
            <div className="adm-preview-avatar">
              {avatar.url ? <img src={avatar.url} alt="" /> : <span aria-hidden="true">{initials}</span>}
            </div>
            <Badge tone={formData.is_available ? 'success' : 'neutral'} dot>
              {formData.is_available ? 'Terbuka untuk peluang kerja' : 'Sedang tidak tersedia'}
            </Badge>
            <div>
              <p className={`adm-preview-name${formData.full_name ? '' : ' is-placeholder'}`}>{formData.full_name || 'Nama lengkap'}</p>
              <p className={`adm-preview-tagline${roles.length || formData.tagline ? '' : ' is-placeholder'}`}>
                {roles.length ? roles.join(' · ') : formData.tagline || 'Peran utama'}
              </p>
            </div>
            {keywords.length > 0 && (
              <ul className="adm-tags" aria-label="Kata berganti">
                {keywords.map((word) => (
                  <li key={word} className="adm-tag">
                    {word}
                  </li>
                ))}
              </ul>
            )}
            <p className={`adm-preview-bio${formData.bio ? '' : ' is-placeholder'}`}>
              {formData.bio || 'Tulisan "Tentang saya" tampil di sini.'}
            </p>
            {(formData.location || formData.email || formData.github_url || formData.linkedin_url || cv.hasFile) && (
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
                    <dd>{formData.github_username.trim() ? `@${formData.github_username.trim()}` : 'Terhubung'}</dd>
                  </div>
                )}
                {formData.linkedin_url && (
                  <div>
                    <dt>LinkedIn</dt>
                    <dd>Terhubung</dd>
                  </div>
                )}
                {cv.hasFile && (
                  <div>
                    <dt>CV</dt>
                    <dd>PDF {cv.next ? '(belum disimpan)' : 'tersimpan'}</dd>
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
    toast.success('Profil disimpan.')
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
      description="Data diri, foto, CV, peran, dan tautan untuk halaman publik."
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
