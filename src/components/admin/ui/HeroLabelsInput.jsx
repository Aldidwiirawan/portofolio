import { useLayoutEffect, useRef, useState } from 'react'
import { Button, IconButton } from './Button'
import { Field, Input, Select } from './Field'
import { emptyHeroLabel, HERO_LABEL_MAX, MAX_HERO_LABELS } from './heroLabels'
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from './icons'

const SHAPES = [
  { value: 'tag', label: 'Tag' },
  { value: 'circle', label: 'Lingkaran' },
]

let rowKey = 0
const newKey = () => {
  rowKey += 1
  return `h${rowKey}`
}

/**
 * "Label panggung hero" (stage 3C): the labels that drop onto the hero stage, in order. Built like
 * LinkListInput: each row has a text, a shape (tag or circle) and an optional English text; rows are
 * added, removed and moved with buttons that work by keyboard, focus follows the row that changed and
 * the change is announced. A small preview shows the pile. Empty list = the featured skills.
 * - value: [{ text, text_en, shape }]; onChange(next); errors per row (from prepareHeroLabels)
 * - english: false while the English columns do not exist (the English text is then not offered)
 */
export function HeroLabelsInput({ id, value, onChange, errors = [], english = true, disabled = false }) {
  const rows = Array.isArray(value) ? value : []
  const [keys, setKeys] = useState(() => rows.map(newKey))
  const [announcement, setAnnouncement] = useState('')
  const focusNext = useRef(null)

  const rowKeys = keys.length === rows.length ? keys : rows.map((_, i) => keys[i] ?? `${id}-x${i}`)

  useLayoutEffect(() => {
    if (!focusNext.current) return
    const el = document.getElementById(focusNext.current)
    focusNext.current = null
    el?.focus()
  })

  const hintId = `${id}-hint`
  const full = rows.length >= MAX_HERO_LABELS

  const update = (nextRows, nextKeys) => {
    setKeys(nextKeys)
    onChange(nextRows)
  }

  const add = () => {
    if (full || disabled) return
    const key = newKey()
    update([...rows, emptyHeroLabel()], [...rowKeys, key])
    focusNext.current = `${id}-${key}-text`
    setAnnouncement(`Label ${rows.length + 1} ditambahkan.`)
  }

  const remove = (index) => {
    if (disabled) return
    const nextKeys = rowKeys.filter((_, i) => i !== index)
    update(rows.filter((_, i) => i !== index), nextKeys)
    const neighbour = nextKeys[index] ?? nextKeys[index - 1]
    focusNext.current = neighbour ? `${id}-${neighbour}-remove` : `${id}-add`
    setAnnouncement(`Label ${index + 1} dihapus.`)
  }

  const move = (index, delta) => {
    const to = index + delta
    if (disabled || to < 0 || to >= rows.length) return
    const nextRows = [...rows]
    const nextKeys = [...rowKeys]
    ;[nextRows[index], nextRows[to]] = [nextRows[to], nextRows[index]]
    ;[nextKeys[index], nextKeys[to]] = [nextKeys[to], nextKeys[index]]
    update(nextRows, nextKeys)
    focusNext.current = `${id}-${rowKeys[index]}-${delta < 0 ? 'up' : 'down'}`
    setAnnouncement(`Label dipindah ke posisi ${to + 1} dari ${rows.length}.`)
  }

  const change = (index, patch) => onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  const preview = rows.filter((row) => String(row.text ?? '').trim())

  return (
    <fieldset className="adm-field adm-linklist adm-herolabels" aria-describedby={hintId}>
      <legend className="adm-label">
        Label panggung hero
        <span className="adm-optional">(opsional)</span>
      </legend>

      {rows.length > 0 && (
        <ol className="adm-linklist-rows">
          {rows.map((row, index) => {
            const key = rowKeys[index]
            const base = `${id}-${key}`
            const n = index + 1
            const error = errors[index] || {}
            const max = HERO_LABEL_MAX[row.shape] ?? HERO_LABEL_MAX.tag
            return (
              <li key={key} className="adm-linklist-row">
                <div className="adm-linklist-head">
                  <span className="adm-linklist-title" aria-hidden="true">
                    Label {String(n).padStart(2, '0')}
                    {n > 8 && <span className="adm-herolabels-note"> · tidak tampil di HP</span>}
                  </span>
                  <span className="adm-linklist-actions">
                    <IconButton
                      id={`${base}-up`}
                      size="sm"
                      label={`Naikkan label ${n}`}
                      icon={<IconArrowUp size={16} />}
                      aria-disabled={index === 0 || disabled || undefined}
                      onClick={() => move(index, -1)}
                    />
                    <IconButton
                      id={`${base}-down`}
                      size="sm"
                      label={`Turunkan label ${n}`}
                      icon={<IconArrowDown size={16} />}
                      aria-disabled={index === rows.length - 1 || disabled || undefined}
                      onClick={() => move(index, 1)}
                    />
                    <IconButton
                      id={`${base}-remove`}
                      size="sm"
                      variant="danger"
                      label={`Hapus label ${n}`}
                      icon={<IconTrash size={16} />}
                      aria-disabled={disabled || undefined}
                      onClick={() => remove(index)}
                    />
                  </span>
                </div>
                <fieldset className="adm-linklist-fields">
                  <legend className="adm-sr-only">Label {n}</legend>
                  <Field
                    id={`${base}-text`}
                    label="Teks"
                    required
                    error={error.text}
                    hint={row.shape === 'circle' ? 'Lingkaran: 1–3 karakter, misalnya </> atau *.' : `Sampai ${max} karakter.`}
                  >
                    <Input
                      type="text"
                      value={row.text}
                      maxLength={max}
                      placeholder={index === 0 ? 'Contoh: React' : undefined}
                      onChange={(e) => change(index, { text: e.target.value })}
                      disabled={disabled}
                    />
                  </Field>
                  <Field id={`${base}-shape`} label="Bentuk">
                    <Select value={row.shape} onChange={(e) => change(index, { shape: e.target.value })} disabled={disabled}>
                      {SHAPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {english && (
                    <Field
                      id={`${base}-text-en`}
                      label="Teks Inggris"
                      optional
                      error={error.text_en}
                      hint="Kosongkan bila sama, misalnya nama teknologi."
                      className="adm-linklist-wide"
                    >
                      <Input
                        type="text"
                        lang="en"
                        value={row.text_en}
                        maxLength={max}
                        onChange={(e) => change(index, { text_en: e.target.value })}
                        disabled={disabled}
                      />
                    </Field>
                  )}
                </fieldset>
              </li>
            )
          })}
        </ol>
      )}

      <div className="adm-listinput-foot">
        <Button
          id={`${id}-add`}
          size="sm"
          variant="secondary"
          icon={<IconPlus size={16} />}
          aria-disabled={full || disabled || undefined}
          onClick={add}
        >
          Tambah label
        </Button>
        <span className="adm-listinput-count" aria-hidden="true">
          {rows.length}/{MAX_HERO_LABELS}
        </span>
      </div>

      <p id={hintId} className="adm-hint">
        Label yang jatuh dan bisa dilempar di panggung bagian pembuka, sesuai urutan di sini; HP menampilkan 8 label
        pertama. Kosongkan untuk memakai keahlian unggulan.{' '}
        {full ? `Sudah ${MAX_HERO_LABELS} dari ${MAX_HERO_LABELS}; hapus satu untuk menambah.` : `Maksimal ${MAX_HERO_LABELS}.`}
      </p>

      <div className="adm-herolabels-preview" aria-hidden="true">
        <span className="adm-herolabels-preview-title">Pratinjau panggung</span>
        {preview.length > 0 ? (
          <div className="adm-herolabels-pile">
            {preview.map((row, index) => (
              <span key={index} className={row.shape === 'circle' ? 'adm-herolabels-orb' : 'adm-herolabels-tag'}>
                {row.text.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="adm-hint">Belum ada label: panggung memakai keahlian unggulan.</p>
        )}
      </div>

      <p className="adm-sr-only" aria-live="polite">
        {announcement}
      </p>
    </fieldset>
  )
}
