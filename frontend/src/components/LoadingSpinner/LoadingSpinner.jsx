import styles from './LoadingSpinner.module.css'

export function LoadingSpinner({ show }) {
  if (!show) return null
  return (
    <div className={styles.backdrop}>
      <div className={styles.spinner} />
    </div>
  )
}
