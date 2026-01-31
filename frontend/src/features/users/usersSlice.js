import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/users')
  return response.data
})

export const createUser = createAsyncThunk('users/createUser', async (userData) => {
  const response = await api.post('/users', userData)
  return response.data
})

export const deactivateUser = createAsyncThunk('users/deactivateUser', async (userId) => {
  const response = await api.put(`/users/${userId}/deactivate`)
  return response.data
})

export const activateUser = createAsyncThunk('users/activateUser', async (userId) => {
  const response = await api.put(`/users/${userId}/activate`)
  return response.data
})

export const updateUserRole = createAsyncThunk('users/updateUserRole', async ({ userId, role }) => {
  const response = await api.put(`/users/${userId}/role`, { role })
  return response.data
})

export const updateUserStatus = createAsyncThunk('users/updateUserStatus', async ({ id, is_active }) => {
  const response = await api.put(`/users/${id}`, { is_active })
  return response.data
})

export const updateUserProfile = createAsyncThunk('users/updateUserProfile', async ({ id, ...profileData }) => {
  const response = await api.put(`/users/${id}`, profileData)
  return response.data
})

export const fetchRecommendations = createAsyncThunk('users/fetchRecommendations', async (userId) => {
  const response = await api.get(`/users/${userId}/recommendations`)
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    recommendations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const userId = action.meta?.arg
        const index = state.items.findIndex(user => user.id === userId)
        if (index !== -1) state.items[index].is_active = false
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        const userId = action.meta?.arg
        const index = state.items.findIndex(user => user.id === userId)
        if (index !== -1) state.items[index].is_active = true
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const index = state.items.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload
      })
  },
})

export default usersSlice.reducer