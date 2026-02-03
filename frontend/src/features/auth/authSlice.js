import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { getToken, setToken, removeToken, getUserFromToken } from '../../utils/authHelpers'

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      setToken(token)
      return { token, user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      setToken(token)
      return { token, user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken()
      if (!token) throw new Error('No token')
      
      const response = await api.get('/auth/me')
      return { token, user: response.data }
    } catch (error) {
      removeToken()
      return rejectWithValue('Authentication failed')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      removeToken()
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // Ensure avatar_url is properly set from profile if available
        if (action.payload.user?.profile?.avatar_url && !action.payload.user.avatar_url) {
          state.user.avatar_url = action.payload.user.profile.avatar_url.startsWith('http')
            ? action.payload.user.profile.avatar_url
            : `http://localhost:8000${action.payload.user.profile.avatar_url}`
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // Ensure avatar_url is properly set from profile if available
        if (action.payload.user?.profile?.avatar_url && !action.payload.user.avatar_url) {
          state.user.avatar_url = action.payload.user.profile.avatar_url.startsWith('http')
            ? action.payload.user.profile.avatar_url
            : `http://localhost:8000${action.payload.user.profile.avatar_url}`
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        // Ensure avatar_url is properly set from profile if available
        if (action.payload.user?.profile?.avatar_url && !action.payload.user.avatar_url) {
          state.user.avatar_url = action.payload.user.profile.avatar_url.startsWith('http')
            ? action.payload.user.profile.avatar_url
            : `http://localhost:8000${action.payload.user.profile.avatar_url}`
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload
        // Ensure avatar_url is properly set from profile if available
        if (action.payload?.profile?.avatar_url && !action.payload.avatar_url) {
          state.user.avatar_url = action.payload.profile.avatar_url.startsWith('http')
            ? action.payload.profile.avatar_url
            : `http://localhost:8000${action.payload.profile.avatar_url}`
        }
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer