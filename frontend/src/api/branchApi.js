import api from './axiosClient'

export const getBranches = async (params = {}) => (await api.get('/admin/branches', { params })).data
export const createBranch = async (payload) => (await api.post('/admin/branches', payload)).data?.data
export const updateBranch = async (id, payload) => (await api.patch(`/admin/branches/${id}`, payload)).data?.data
export const deleteBranch = async (id) => (await api.delete(`/admin/branches/${id}`)).data
