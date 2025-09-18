import { useMemo, useRef, useState } from 'react'
import styles from './ContributorsField.module.css'

// Props: value: Array<{ role: string, names: string[] }>, onChange: (next) => void
export default function ContributorsField({ value = [], onChange, label = 'Contributors', roleOptions, error }) {
  const roles = useMemo(() => roleOptions || ['Writer', 'Artist', 'Colorist', 'Letterer', 'Editor', 'Cover Artist'], [roleOptions])

  const addRow = () => {
    const next = [...value, { role: '', names: [] }]
    onChange?.(next)
  }
  const removeRow = (idx) => {
    const next = value.filter((_, i) => i !== idx)
    onChange?.(next)
  }
  const updateRole = (idx, role) => {
    const next = value.map((row, i) => i === idx ? { ...row, role } : row)
    onChange?.(next)
  }
  const addName = (idx, name) => {
    const n = name.trim()
    if (!n) return
    const next = value.map((row, i) => i === idx ? { ...row, names: [...(row.names || []), n] } : row)
    onChange?.(next)
  }
  const removeName = (idx, nameIdx) => {
    const next = value.map((row, i) => i === idx ? { ...row, names: row.names.filter((_, ni) => ni !== nameIdx) } : row)
    onChange?.(next)
  }

  return (
    <div className={styles.wrapper}>
      {label && <div className={styles.label}>{label}</div>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      {value.map((row, idx) => (
        <ContribRow
          key={idx}
          index={idx}
          row={row}
          roles={roles}
          onRoleChange={updateRole}
          onAddName={addName}
          onRemoveName={removeName}
          onRemoveRow={removeRow}
        />
      ))}
      <button type="button" className={styles.addBtn} onClick={addRow}>+ Add Contributor</button>
    </div>
  )
}

function ContribRow({ index, row, roles, onRoleChange, onAddName, onRemoveName, onRemoveRow }) {
  const inputRef = useRef(null)
  const [text, setText] = useState('')

  const handleKeys = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (text.trim()) {
        onAddName(index, text)
        setText('')
      }
    } else if (e.key === 'Backspace' && !text) {
      // backspace to remove last chip
      if ((row.names || []).length) onRemoveName(index, (row.names || []).length - 1)
    }
  }

  const onBlurAdd = () => {
    if (text.trim()) {
      // Prevent duplicates on blur as well
      if (!(row.names || []).includes(text.trim())) {
        onAddName(index, text)
      }
      setText('')
    }
  }

  return (
    <div className={styles.row}>
      <select className={styles.select} value={row.role || ''} onChange={(e) => onRoleChange(index, e.target.value)}>
        <option value="">— Role —</option>
        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <div className={styles.chips} onClick={() => inputRef.current?.focus()}>
        {(row.names || []).map((n, i) => (
          <span key={`${n}-${i}`} className={styles.chip}>
            {n}
            <button type="button" aria-label={`Remove ${n}`} onClick={() => onRemoveName(index, i)}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          className={styles.chipInput}
          placeholder="Type a name and press Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeys}
          onBlur={onBlurAdd}
        />
      </div>

      <button type="button" className={styles.removeBtn} onClick={() => onRemoveRow(index)}>Remove</button>
    </div>
  )
}
