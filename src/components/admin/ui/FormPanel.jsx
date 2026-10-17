import { FormBusyContext } from './adminContexts'
import { Alert } from './Alert'
import { Button } from './Button'
import { Card } from './Card'

/**
 * Frame of an admin form: module card with corner brackets, server error on top (scrolled into
 * view), required-fields note, the fields, and the sticky Batal / Simpan bar with "Menyimpan..."
 * and the success state. `screen` comes from useFormScreen; `onSubmit` is the form's own handler.
 * - cancelLabel / cancelOnlyWhenDirty: a single form without a list (Profil) offers e.g.
 *   "Batalkan perubahan", shown only once something has changed
 */
export function FormPanel({
  label,
  screen,
  error,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelLabel = 'Batal',
  cancelOnlyWhenDirty = false,
  children,
}) {
  const { formRef, alertRef, noteSubmit, saved, isDirty, cancel } = screen
  const busy = isSubmitting || saved

  return (
    <Card as="div" label={label} corners className="adm-form-card">
      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          // Already saved: the form is about to close, never submit twice
          if (saved) {
            e.preventDefault()
            return
          }
          noteSubmit()
          onSubmit(e)
        }}
      >
        {error && (
          <div ref={alertRef} className="adm-form-alert">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}
        <p className="adm-required-note">
          Kolom bertanda <span aria-hidden="true">*</span>
          <span className="adm-sr-only">bintang</span> wajib diisi.
        </p>
        <FormBusyContext.Provider value={busy}>
          {children}
          <div className="adm-form-actions">
            {isDirty && !saved && <p className="adm-form-actions-note">Ada perubahan yang belum disimpan</p>}
            {(!cancelOnlyWhenDirty || (isDirty && !saved)) && (
              <Button variant="secondary" onClick={cancel} disabled={busy}>
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Menyimpan..."
              status={saved ? 'success' : undefined}
              successText="Tersimpan"
              aria-disabled={busy || undefined}
            >
              {submitLabel}
            </Button>
          </div>
        </FormBusyContext.Provider>
      </form>
    </Card>
  )
}
