import { useLayoutEffect, useRef, useState } from 'react'
import { Button, IconButton } from './Button'
import { Badge } from './Card'
import { PROJECT_LINK_TYPES } from './contentLabels'
import { Field, Input, Select } from './Field'
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from './icons'
import { emptyLink, LINK_LABEL_MAX, MAX_PROJECT_LINKS } from './projectLinks'
import { Switch } from './Switch'

let rowKey = 0
const newKey = () => {
  rowKey += 1
  return `l${rowKey}`
}

/**
 * Editable list of project links, built like ListInput: each row has a name, a type, an address
 * and a "Privat" switch; rows are added, removed and moved up/down with buttons that work by
 * keyboard, focus follows the row that changed and the change is announced. A private link may
 * have no address. Check and clean the rows with prepareLinks() from projectLinks.js when saving.
 * - value: [{ label, type, url, is_private }]; onChange(next)
 * - errors: per row position, { label?, url? } (from prepareLinks)
 */
export function LinkListInput({ id, label, hint, value, onChange, errors = [], max = MAX_PROJECT_LINKS, disabled = false }) {
  const rows = Array.isArray(value) ? value : []
  const [keys, setKeys] = useState(() => rows.map(newKey))
  const [announcement, setAnnouncement] = useState('')
  const focusNext = useRef(null)

  // Value replaced from outside (e.g. form reset): new keys for the new rows
  const rowKeys = keys.length === rows.length ? keys : rows.map((_, i) => keys[i] ?? `${id}-x${i}`)

  useLayoutEffect(() => {
    if (!focusNext.current) return
    const el = document.getElementById(focusNext.current)
    focusNext.current = null
    el?.focus()
  })

  const hintId = `${id}-hint`
  const full = rows.length >= max

  const update = (nextRows, nextKeys) => {
    setKeys(nextKeys)
    onChange(nextRows)
  }

  const add = () => {
    if (full || disabled) return
    const key = newKey()
    update([...rows, emptyLink()], [...rowKeys, key])
    focusNext.current = `${id}-${key}-label`
    setAnnouncement(`Tautan ${rows.length + 1} ditambahkan.`)
  }

  const remove = (index) => {
    if (disabled) return
    const nextKeys = rowKeys.filter((_, i) => i !== index)
    update(rows.filter((_, i) => i !== index), nextKeys)
    const neighbour = nextKeys[index] ?? nextKeys[index - 1]
    focusNext.current = neighbour ? `${id}-${neighbour}-remove` : `${id}-add`
    setAnnouncement(`Tautan ${index + 1} dihapus.`)
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
    setAnnouncement(`Tautan dipindah ke posisi ${to + 1} dari ${rows.length}.`)
  }

  const change = (index, patch) => onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <fieldset className="adm-field adm-linklist" aria-describedby={hintId}>
      <legend className="adm-label">
        {label}
        <span className="adm-optional">(opsional)</span>
      </legend>

      {rows.length > 0 && (
        <ol className="adm-linklist-rows">
          {rows.map((row, index) => {
            const key = rowKeys[index]
            const base = `${id}-${key}`
            const n = index + 1
            const error = errors[index] || {}
            return (
              <li key={key} className="adm-linklist-row">
                <div className="adm-linklist-head">
                  <span className="adm-linklist-title" aria-hidden="true">
                    Tautan {String(n).padStart(2, '0')}
                  </span>
                  {row.is_private && (
                    <Badge className="adm-linklist-badge" aria-hidden="true">
                      Privat
                    </Badge>
                  )}
                  <span className="adm-linklist-actions">
                    <IconButton
                      id={`${base}-up`}
                      size="sm"
                      label={`Naikkan tautan ${n}`}
                      icon={<IconArrowUp size={16} />}
                      aria-disabled={index === 0 || disabled || undefined}
                      onClick={() => move(index, -1)}
                    />
                    <IconButton
                      id={`${base}-down`}
                      size="sm"
                      label={`Turunkan tautan ${n}`}
                      icon={<IconArrowDown size={16} />}
                      aria-disabled={index === rows.length - 1 || disabled || undefined}
                      onClick={() => move(index, 1)}
                    />
                    <IconButton
                      id={`${base}-remove`}
                      size="sm"
                      variant="danger"
                      label={`Hapus tautan ${n}`}
                      icon={<IconTrash size={16} />}
                      aria-disabled={disabled || undefined}
                      onClick={() => remove(index)}
                    />
                  </span>
                </div>
                <fieldset className="adm-linklist-fields">
                  <legend className="adm-sr-only">Tautan {n}</legend>
                  <Field id={`${base}-label`} label="Nama tautan" required error={error.label}>
                    <Input
                      type="text"
                      value={row.label}
                      maxLength={LINK_LABEL_MAX}
                      placeholder={index === 0 ? 'Contoh: Kode konsol web' : undefined}
                      onChange={(e) => change(index, { label: e.target.value })}
                      disabled={disabled}
                    />
                  </Field>
                  <Field id={`${base}-type`} label="Jenis">
                    <Select value={row.type} onChange={(e) => change(index, { type: e.target.value })} disabled={disabled}>
                      {PROJECT_LINK_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    id={`${base}-url`}
                    label="Alamat"
                    required={!row.is_private}
                    optional={row.is_private}
                    error={error.url}
                    hint={
                      row.is_private
                        ? 'Boleh dikosongkan. Kalau diisi, alamatnya tidak ditampilkan tetapi tetap tersimpan, jadi jangan isi alamat rahasia.'
                        : 'Diawali https://.'
                    }
                    className="adm-linklist-wide"
                  >
                    <Input
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="https://"
                      value={row.url}
                      onChange={(e) => change(index, { url: e.target.value })}
                      disabled={disabled}
                    />
                  </Field>
                  <div className="adm-linklist-wide adm-linklist-private">
                    <Switch
                      id={`${base}-private`}
                      label="Privat"
                      description={
                        row.is_private
                          ? 'Tidak bisa dibuka publik. Nanti tampil sebagai label tanpa tautan, misalnya “Konsol web · repo privat”.'
                          : 'Bisa dibuka siapa saja.'
                      }
                      checked={row.is_private}
                      onChange={(checked) => change(index, { is_private: checked })}
                      disabled={disabled}
                    />
                  </div>
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
          Tambah tautan
        </Button>
        <span className="adm-listinput-count" aria-hidden="true">
          {rows.length}/{max}
        </span>
      </div>

      <p id={hintId} className="adm-hint">
        {hint ? `${hint} ` : ''}
        {full ? `Sudah ${max} dari ${max}; hapus satu untuk menambah.` : `Maksimal ${max}.`}
      </p>
      <p className="adm-sr-only" aria-live="polite">
        {announcement}
      </p>
    </fieldset>
  )
}
