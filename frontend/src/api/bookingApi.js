import api from './axiosClient'

export const getBookings = async (params = {}) => (await api.get('/bookings', { params })).data
export const getBookingById = async (id) => (await api.get(`/bookings/${id}`)).data?.data
export const createBooking = async (payload) => (await api.post('/bookings', payload)).data?.data
export const updateBooking = async (id, payload) => (await api.patch(`/bookings/${id}`, payload)).data?.data
export const checkInBooking = async (id) => (await api.patch(`/bookings/${id}/check-in`)).data?.data
export const cancelBooking = async (id, cancelReason = '') =>
  (await api.patch(`/bookings/${id}/cancel`, { cancelReason })).data?.data
export const markNoShow = async (id) => (await api.patch(`/bookings/${id}/no-show`)).data?.data
