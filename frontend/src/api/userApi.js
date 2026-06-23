import api from './axiosClient'

export const getUsers = async (params = {}) => (await api.get('/admin/users', { params })).data
export const approveUser = async (id) => (await api.patch(`/admin/users/${id}/approve`)).data?.data
export const rejectUser = async (id) => (await api.patch(`/admin/users/${id}/reject`)).data?.data
export const lockUser = async (id) => (await api.patch(`/admin/users/${id}/lock`)).data?.data
export const unlockUser = async (id) => (await api.patch(`/admin/users/${id}/unlock`)).data?.data
export const changeUserRole = async (id, role) => (await api.patch(`/admin/users/${id}/role`, { role })).data?.data
export const assignUserBranch = async (id, branchId) => (await api.patch(`/admin/users/${id}/branch`, { branchId })).data?.data
export const deleteUser = async (id) => (await api.delete(`/admin/users/${id}`)).data
