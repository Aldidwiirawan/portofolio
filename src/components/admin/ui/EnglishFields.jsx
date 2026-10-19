import { englishColumnsMissing } from '../../../lib/englishColumns'
import { useLock } from './adminContexts'
import { Alert } from './Alert'
import { Field, Input, Textarea } from './Field'
import { IconChevronDown } from './icons'

const REFERENCE_MAX = 140

/** The Indonesian text shown under an English field, shortened when long. */
function reference(original) {
  const text = String(original ?? '').trim().replace(/\s+/g, ' ')
  if (!text) return 'Versi Indonesia masih kosong.'
  return `Indonesia: ${text.length > REFERENCE_MAX ? `${text.slice(0, REFERENCE_MAX - 1)}…` : text}`
}

/**
 * "Versi Inggris (opsional)" (stage 3C): a closed section under the Indonesian fields of a content
 * form, with "n dari m terisi". An empty English field is fine: the English page then shows the
 * Indonesian text. While the database update (migration 20261019000000) has not been run, it only
 * says so; the Indonesian content still saves.
 * @param {{ values: string[], children: React.ReactNode }} props values: every English value of the
 *   section (texts and list rows), for the count
 */
export function EnglishSection({ values, children }) {
  const missing = englishColumnsMissing()
  const filled = values.filter((value) => String(value ?? '').trim()).length
  return (
    <details className="adm-en">
      <summary className="adm-en-summary">
        <span className="adm-en-title">Versi Inggris (opsional)</span>
        <span className="adm-en-count">{missing ? 'belum tersedia' : `${filled} dari ${values.length} terisi`}</span>
        <IconChevronDown size={18} className="adm-en-chevron" />
      </summary>
      <div className="adm-en-body">
        {missing ? (
          <Alert tone="info" title="Pembaruan database untuk versi Inggris belum dijalankan">
            Isi bahasa Indonesia tetap bisa disimpan. Setelah migrasi 20261019000000_english_content.sql dijalankan,
            muat ulang halaman ini untuk mengisi versi Inggris.
          </Alert>
        ) : (
          <>
            <p className="adm-hint">
              Kosongkan bila belum ada; halaman publik versi Inggris lalu memakai teks Indonesia. Nama orang, instansi,
              produk, dan teknologi tidak perlu diterjemahkan.
            </p>
            <div className="adm-form-grid">{children}</div>
          </>
        )}
      </div>
    </details>
  )
}

/** One English text, with its Indonesian text as the hint for reference (and an optional note). */
export function EnglishField({ id, label, original, note, multiline = false, rows = 3, className, ...control }) {
  const hint = note ? `${reference(original)} ${note}` : reference(original)
  return (
    <Field id={id} label={`${label} (Inggris)`} optional hint={hint} className={className}>
      {multiline ? <Textarea rows={rows} lang="en" {...control} /> : <Input type="text" lang="en" {...control} />}
    </Field>
  )
}

/**
 * English versions of a list: one field per Indonesian item, in the same order. The rows follow the
 * Indonesian list (added, removed and moved with it), so only the text is edited here.
 * @param {{ id: string, label: string, itemLabel: string, originals: string[], values: string[],
 *   onItemChange: (index: number, text: string) => void, maxLength?: number, emptyHint?: string,
 *   disabled?: boolean }} props
 */
export function EnglishList({ id, label, itemLabel, originals, values, onItemChange, maxLength = 120, emptyHint, disabled = false }) {
  const lock = useLock(disabled)
  return (
    <fieldset className="adm-field adm-en-list">
      <legend className="adm-label">
        {label} (Inggris)
        <span className="adm-optional">(opsional)</span>
      </legend>
      {originals.length === 0 ? (
        <p className="adm-hint">{emptyHint || 'Isi daftar Indonesia dulu; satu kolom Inggris muncul untuk setiap barisnya.'}</p>
      ) : (
        <ol className="adm-en-rows">
          {originals.map((original, index) => {
            const n = index + 1
            const refId = `${id}-${n}-ref`
            return (
              <li key={index} className="adm-en-row">
                <span className="adm-listinput-num" aria-hidden="true">
                  {String(n).padStart(2, '0')}
                </span>
                <span className="adm-control">
                  <input
                    id={`${id}-${n}`}
                    type="text"
                    lang="en"
                    className="adm-input"
                    value={values[index] ?? ''}
                    maxLength={maxLength}
                    aria-label={`${itemLabel} ${n} (Inggris)`}
                    aria-describedby={refId}
                    disabled={lock.hard || undefined}
                    readOnly={lock.soft || undefined}
                    aria-disabled={lock.soft || undefined}
                    onChange={(e) => onItemChange(index, e.target.value)}
                  />
                </span>
                <p id={refId} className="adm-hint adm-en-ref">
                  {reference(original)}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </fieldset>
  )
}
