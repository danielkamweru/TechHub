import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ skip = 0, limit = 100, role, is_active } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
      if (role) params.append('role', role)
      if (is_active !== undefined) params.append('is_active', String(is_active))
      const response = await api.get(`/admin/users?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch users')
    }
  }
)

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/users', userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create user')
    }
  }
)

export const deactivateUser = createAsyncThunk(
  'admin/deactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/admin/users/${userId}/deactivate`)
      return userId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to deactivate user')
    }
  }
)

export const activateUser = createAsyncThunk(
  'admin/activateUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/admin/users/${userId}/activate`)
      return userId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to activate user')
    }
  }
)

export const fetchPendingContent = createAsyncThunk(
  'admin/fetchPendingContent',
  async ({ skip = 0, limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/pending-approval?skip=${skip}&limit=${limit}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch pending content')
    }
  }
)

export const fetchAllContent = createAsyncThunk(
  'admin/fetchAllContent',
  async ({ skip = 0, limit = 100, status = 'published' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
      if (status) params.append('status', status)
      const response = await api.get(`/content?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch content')
    }
  }
)

export const publishContent = createAsyncThunk(
  'admin/publishContent',
  async (contentId, { rejectWithValue }) => {
    try {
      await api.put(`/admin/${contentId}/publish`)
      return contentId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to publish content')
    }
  }
)

export const rejectContent = createAsyncThunk(
  'admin/rejectContent',
  async ({ contentId, reason }, { rejectWithValue }) => {
    try {
      await api.put(`/admin/${contentId}/reject-publication`, { reason })
      return contentId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to reject content')
    }
  }
)

export const fetchFlags = createAsyncThunk(
  'admin/fetchFlags',
  async ({ skip = 0, limit = 100, resolved } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
      if (resolved !== undefined) params.append('resolved', String(resolved))
      const response = await api.get(`/admin/flags/all?${params}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch flags')
    }
  }
)

export const resolveFlag = createAsyncThunk(
  'admin/resolveFlag',
  async ({ flagId, adminNotes }, { rejectWithValue }) => {
    try {
      await api.put(`/admin/flags/${flagId}/resolve`, { admin_notes: adminNotes })
      return flagId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to resolve flag')
    }
  }
)

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/categories', categoryData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create category')
    }
  }
)

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update user role')
    }
  }
)

export const approveContent = createAsyncThunk(
  'admin/approveContent',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/content/${contentId}/approve`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to approve content')
    }
  }
)

export const removeContent = createAsyncThunk(
  'admin/removeContent',
  async (contentId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/content/${contentId}`)
      return contentId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove content')
    }
  }
)

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    pendingContent: [],
    allContent: [],
    flags: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload.id)
        if (user) user.role = action.payload.role
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload)
        if (user) user.is_active = false
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload)
        if (user) user.is_active = true
      })
      .addCase(approveContent.fulfilled, (state, action) => {
        const content = state.pendingContent.find(c => c.id === action.payload.id)
        if (content) {
          content.status = 'published'
          state.pendingContent = state.pendingContent.filter(c => c.id !== action.payload.id)
        }
      })
      .addCase(removeContent.fulfilled, (state, action) => {
        state.pendingContent = state.pendingContent.filter(c => c.id !== action.payload)
        state.allContent = state.allContent.filter(c => c.id !== action.payload)
      })
      // Pending Content
      .addCase(fetchPendingContent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingContent.fulfilled, (state, action) => {
        state.loading = false
        state.pendingContent = action.payload
      })
      .addCase(fetchPendingContent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(publishContent.fulfilled, (state, action) => {
        state.pendingContent = state.pendingContent.filter(c => c.id !== action.payload)
      })
      .addCase(rejectContent.fulfilled, (state, action) => {
        state.pendingContent = state.pendingContent.filter(c => c.id !== action.payload)
      })
      // All Content
      .addCase(fetchAllContent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllContent.fulfilled, (state, action) => {
        state.loading = false
        state.allContent = action.payload
      })
      .addCase(fetchAllContent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Flags
      .addCase(fetchFlags.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFlags.fulfilled, (state, action) => {
        state.loading = false
        state.flags = action.payload
      })
      .addCase(fetchFlags.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(resolveFlag.fulfilled, (state, action) => {
        const flag = state.flags.find(f => f.id === action.payload)
        if (flag) flag.is_resolved = true
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
