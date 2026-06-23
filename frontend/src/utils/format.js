export const formatDateTime = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export const formatTime = (value) => value
  ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : '—'

export const toDateTimeLocal = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export const getErrorMessage = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') =>
  error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg || fallback

export const getId = (value) => value?._id || value?.id || value
