import api from './axiosClient'

export const getResources = async (params = {}) => (await api.get('/resources', { params })).data
export const getResourceById = async (id) => (await api.get(`/resources/${id}`)).data?.data
export const getResourcesByBranch = async (branchId, params = {}) =>
  (await api.get(`/resources/branch/${branchId}`, { params })).data?.data || []
export const createResource = async (payload) => (await api.post('/resources', payload)).data?.data
export const updateResource = async (id, payload) => (await api.put(`/resources/${id}`, payload)).data?.data
export const deleteResource = async (id) => (await api.delete(`/resources/${id}`)).data
