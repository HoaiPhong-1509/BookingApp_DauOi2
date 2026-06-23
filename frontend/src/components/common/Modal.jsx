import { useEffect } from 'react'
import Icon from './Icon'

export default function Modal({ open, onClose, title, eyebrow, children, size = 'normal' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`modal-sheet modal-sheet--${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="sheet-handle" />
      <header className="modal-header">
        <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 id="modal-title">{title}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" /></button>
      </header>
      <div className="modal-body">{children}</div>
    </section>
  </div>
}
