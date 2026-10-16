import { Select } from './Field'
import { MONTHS } from './format'
import { IconAlert } from './icons'

/**
 * Month and year as two selects, like a job application form. Value { month: '3', year: '2024' }
 * (empty strings when not chosen); see dateToMonthYear / monthYearToDate in format.js and
 * checkMonthYear in formValues.js.
 * - monthOptional: the month may stay empty (e.g. an achievement known only by year)
 * - years run from maxYear down to minYear
 */
export function MonthYearSelect({
  id,
  legend,
  value,
  onChange,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  monthOptional = false,
  minYear = 2000,
  maxYear = new Date().getFullYear() + 1,
}) {
  const current = value || { month: '', year: '' }
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
  const years = []
  for (let y = maxYear; y >= minYear; y -= 1) years.push(String(y))
  // A stored year outside the range still shows
  if (current.year && !years.includes(current.year)) years.push(current.year)

  return (
    <fieldset className={['adm-field', 'adm-monthyear', error && 'is-invalid'].filter(Boolean).join(' ')} aria-describedby={describedBy}>
      <legend className="adm-label">
        {legend}
        {required && (
          <span className="adm-required" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="adm-optional">(opsional)</span>}
      </legend>
      <div className="adm-monthyear-row">
        <div className="adm-monthyear-part">
          <label htmlFor={`${id}-month`} className="adm-sublabel">
            Bulan
          </label>
          <Select
            id={`${id}-month`}
            value={current.month}
            onChange={(e) => onChange({ ...current, month: e.target.value })}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          >
            <option value="">{monthOptional ? 'Tanpa bulan' : 'Pilih bulan'}</option>
            {MONTHS.map((name, index) => (
              <option key={name} value={String(index + 1)}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <div className="adm-monthyear-part">
          <label htmlFor={`${id}-year`} className="adm-sublabel">
            Tahun
          </label>
          <Select
            id={`${id}-year`}
            value={current.year}
            onChange={(e) => onChange({ ...current, year: e.target.value })}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          >
            <option value="">Pilih tahun</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {hint && (
        <p id={hintId} className="adm-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="adm-error">
          <IconAlert size={16} />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  )
}
