import { AdminLayout } from './AdminLayout'
import { Alert } from './Alert'
import { Button } from './Button'
import { ConfirmDialog } from './Dialog'
import { EmptyState, Skeleton } from './Feedback'
import { Field, Input } from './Field'
import { toFriendlyError } from './friendlyError'
import { IconPencil, IconPlus, IconRefresh, IconTrash } from './icons'

/**
 * Screen of one content section (Keahlian, Pengalaman, …). Presentational: the page keeps its own
 * data hook, handlers and Supabase calls and passes the results in.
 * - list mode: header with "Muat ulang" and the add button; skeleton while the first load runs
 *   (a reload keeps the list visible), plain error with "Coba lagi", empty state with the robot,
 *   then `summary`, `toolbar` and the list (children)
 * - form mode (`form.open`): the form as a full panel with a breadcrumb back to the list
 * - deleteDialog: props for ConfirmDialog
 */
export function SectionScreen({
  title,
  description,
  addLabel,
  onAdd,
  count,
  isLoading,
  error,
  onReload,
  loadErrorTitle,
  emptyTitle,
  emptyText,
  emptyActionLabel,
  summary,
  toolbar,
  headingRef,
  form,
  deleteDialog,
  children,
}) {
  if (form?.open) {
    return (
      <AdminLayout
        title={form.title}
        description={form.description}
        breadcrumb={[{ label: title, onClick: form.onBack }]}
        headingRef={headingRef}
      >
        {form.children}
      </AdminLayout>
    )
  }

  const showSkeleton = isLoading && count === 0

  return (
    <AdminLayout
      title={title}
      description={description}
      headingRef={headingRef}
      actions={
        <>
          <Button variant="secondary" icon={<IconRefresh size={18} />} onClick={onReload} loading={isLoading} loadingText="Memuat...">
            Muat ulang
          </Button>
          <Button icon={<IconPlus size={18} />} onClick={onAdd}>
            {addLabel}
          </Button>
        </>
      }
    >
      {showSkeleton && <Skeleton rows={3} label={`Memuat daftar ${title.toLowerCase()}...`} />}

      {!isLoading && error && (
        <Alert
          tone="danger"
          title={loadErrorTitle}
          action={
            <Button size="sm" variant="secondary" icon={<IconRefresh size={16} />} onClick={onReload}>
              Coba lagi
            </Button>
          }
        >
          {toFriendlyError(error, 'Periksa koneksi internet, lalu coba lagi.')}
        </Alert>
      )}

      {!isLoading && !error && count === 0 && (
        <EmptyState
          title={emptyTitle}
          action={
            <Button icon={<IconPlus size={18} />} onClick={onAdd}>
              {emptyActionLabel}
            </Button>
          }
        >
          {emptyText}
        </EmptyState>
      )}

      {!showSkeleton && !error && count > 0 && (
        <>
          {summary && (
            <p className="adm-list-summary" aria-live="polite">
              {summary}
            </p>
          )}
          {toolbar}
          {children}
        </>
      )}

      {deleteDialog && <ConfirmDialog {...deleteDialog} />}
    </AdminLayout>
  )
}

/** "Ubah" and "Hapus" for one row; `name` makes each button's accessible name unique. */
export function RowActions({ name, onEdit, onDelete }) {
  return (
    <>
      <Button size="sm" variant="secondary" icon={<IconPencil size={16} />} onClick={onEdit} aria-label={`Ubah ${name}`}>
        Ubah
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="adm-btn--danger-text"
        icon={<IconTrash size={16} />}
        onClick={onDelete}
        aria-label={`Hapus ${name}`}
      >
        Hapus
      </Button>
    </>
  )
}

/** Search field above a list (visible label, filters as you type). */
export function SearchBox({ id, label, value, onChange, hint }) {
  return (
    <div className="adm-list-toolbar adm-search">
      <Field id={id} label={label} hint={hint}>
        <Input type="search" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </Field>
    </div>
  )
}

/** Shown instead of the list when a search finds nothing. */
export function NoMatches({ children }) {
  return (
    <p className="adm-list-none" role="status">
      {children}
    </p>
  )
}
