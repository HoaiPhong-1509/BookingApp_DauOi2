import { useToastStore } from '../../stores/toastStore'
import Icon from './Icon'

export default function Toast() {
  const { toast, hide } = useToastStore()
  if (!toast) return null
  return <button className={`toast toast--${toast.tone}`} onClick={hide} role="status">
    <span className="toast__icon"><Icon name={toast.tone === 'error' ? 'close' : 'check'} size={16} /></span>
    <span>{toast.message}</span>
  </button>
}
