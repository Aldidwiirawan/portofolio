import { useLayoutEffect, useRef, useState } from 'react'
import { useLock } from './adminContexts'
import { Button, IconButton } from './Button'
import { IconAlert, IconArrowDown, IconArrowUp, IconPlus, IconTrash } from './icons'

let rowKey = 0
const newKey = () => {
  rowKey += 1
  return `r${rowKey}`
}

/**
 * Editable list of short texts (task points, technologies, rotating words, message topics, …).
 * Items can be added, removed and moved up/down with buttons that work by keyboard; Enter in an
 * item adds a new one below it. Focus follows the item that was moved, and the change is announced.
 * - value: string[]; onChange(next: string[]) — empty rows stay while editing; save
 *   cleanList(value) from formValues.js
 * - max: highest number of items; itemLabel names each row for screen readers ("Poin 2")
 * - onRowsChange(order): optional, after a row is added, removed or moved; order[n] is the old
 *   position of row n (null for the new row), so a parallel English list can follow (stage 3C)
 */
export function ListInput({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  onRowsChange,
  max = 10,
  itemLabel = 'Isian',
  addLabel = 'Tambah',
  placeholder,
  optional = false,
  required = false,
  disabled = false,
  maxLength = 120,
}) {
  const items = Array.isArray(value) ? value : []
  const [keys, setKeys] = useState(() => items.map(newKey))
  const [announcement, setAnnouncement] = useState('')
  const focusNext = useRef(null)
  const lock = useLock(disabled)

  // Value replaced from outside (e.g. form reset): new keys for the new rows
  const rowKeys = keys.length === items.length ? keys : items.map((_, i) => keys[i] ?? `${id}-x${i}`)

  useLayoutEffect(() => {
    if (!focusNext.current) return
    const el = document.getElementById(focusNext.current)
    focusNext.current = null
    el?.focus()
  })

  const hintId = `${id}-hint`
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].join(' ')
  const full = items.length >= max

  const update = (nextItems, nextKeys) => {
    setKeys(nextKeys)
    onRowsChange?.(nextKeys.map((key) => (rowKeys.includes(key) ? rowKeys.indexOf(key) : null)))
    onChange(nextItems)
  }

  const add = (afterIndex = items.length - 1) => {
    if (full || disabled) return
    const key = newKey()
    const at = afterIndex + 1
    update([...items.slice(0, at), '', ...items.slice(at)], [...rowKeys.slice(0, at), key, ...rowKeys.slice(at)])
    focusNext.current = `${id}-${key}`
    setAnnouncement(`${itemLabel} ${at + 1} ditambahkan.`)
  }

  const remove = (index) => {
    if (disabled) return
    const nextKeys = rowKeys.filter((_, i) => i !== index)
    update(items.filter((_, i) => i !== index), nextKeys)
    const neighbour = nextKeys[index] ?? nextKeys[index - 1]
    focusNext.current = neighbour ? `${id}-${neighbour}-remove` : `${id}-add`
    setAnnouncement(`${itemLabel} ${index + 1} dihapus.`)
  }

  const move = (index, delta) => {
    const to = index + delta
    if (disabled || to < 0 || to >= items.length) return
    const nextItems = [...items]
    const nextKeys = [...rowKeys]
    ;[nextItems[index], nextItems[to]] = [nextItems[to], nextItems[index]]
    ;[nextKeys[index], nextKeys[to]] = [nextKeys[to], nextKeys[index]]
    update(nextItems, nextKeys)
    focusNext.current = `${id}-${rowKeys[index]}-${delta < 0 ? 'up' : 'down'}`
    setAnnouncement(`${itemLabel} dipindah ke posisi ${to + 1} dari ${items.length}.`)
  }

  const change = (index, text) => {
    const nextItems = [...items]
    nextItems[index] = text
    onChange(nextItems)
  }

  return (
    <fieldset
      className={['adm-field', 'adm-listinput', error && 'is-invalid'].filter(Boolean).join(' ')}
      aria-describedby={describedBy}
    >
      <legend className="adm-label">
        {label}
        {required && (
          <span className="adm-required" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="adm-optional">(opsional)</span>}
      </legend>

      {items.length > 0 && (
        <ol className="adm-listinput-rows">
          {items.map((item, index) => {
            const key = rowKeys[index]
            const n = index + 1
            return (
              <li key={key} className="adm-listinput-row">
                <span className="adm-listinput-num" aria-hidden="true">
                  {String(n).padStart(2, '0')}
                </span>
                <span className="adm-control adm-listinput-control">
                  <input
                    id={`${id}-${key}`}
                    type="text"
                    className="adm-input"
                    value={item}
                    placeholder={index === 0 ? placeholder : undefined}
                    maxLength={maxLength}
                    aria-label={`${itemLabel} ${n}`}
                    aria-invalid={error ? true : undefined}
                    // The form moves focus to the first invalid row; the error is read out with it
                    aria-describedby={errorId}
                    disabled={lock.hard || undefined}
                    readOnly={lock.soft || undefined}
                    aria-disabled={lock.soft || undefined}
                    onChange={(e) => change(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        add(index)
                      }
                    }}
                  />
                </span>
                <span className="adm-listinput-actions">
                  <IconButton
                    id={`${id}-${key}-up`}
                    size="sm"
                    label={`Naikkan ${itemLabel.toLowerCase()} ${n}`}
                    icon={<IconArrowUp size={16} />}
                    aria-disabled={index === 0 || disabled || undefined}
                    onClick={() => move(index, -1)}
                  />
                  <IconButton
                    id={`${id}-${key}-down`}
                    size="sm"
                    label={`Turunkan ${itemLabel.toLowerCase()} ${n}`}
                    icon={<IconArrowDown size={16} />}
                    aria-disabled={index === items.length - 1 || disabled || undefined}
                    onClick={() => move(index, 1)}
                  />
                  <IconButton
                    id={`${id}-${key}-remove`}
                    size="sm"
                    variant="danger"
                    label={`Hapus ${itemLabel.toLowerCase()} ${n}`}
                    icon={<IconTrash size={16} />}
                    aria-disabled={disabled || undefined}
                    onClick={() => remove(index)}
                  />
                </span>
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
          onClick={() => add()}
        >
          {addLabel}
        </Button>
        <span className="adm-listinput-count" aria-hidden="true">
          {items.length}/{max}
        </span>
      </div>

      <p id={hintId} className="adm-hint">
        {hint ? `${hint} ` : ''}
        {full ? `Sudah ${max} dari ${max}; hapus satu untuk menambah.` : `Maksimal ${max}.`}
      </p>
      {error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{error}</span>
        </p>
      )}
      <p className="adm-sr-only" aria-live="polite">
        {announcement}
      </p>
    </fieldset>
  )
}
