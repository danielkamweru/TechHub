import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/content/user/wishlist')
      return response.data || []
    } catch (error) {
      // Silently handle 422 and other errors to prevent UI issues
      if (error.response?.status === 422) {
        console.log('Wishlist endpoint returned 422 - possibly empty wishlist')
        return []
      }
      console.warn('Wishlist fetch failed:', error.response?.data?.message || error.message)
      return []
    }
  }
)

export const fetchUserWishlist = createAsyncThunk(
  'wishlist/fetchUserWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/content/user/wishlist')
      return response.data || []
    } catch (error) {
      // Silently handle 422 and other errors to prevent UI issues
      if (error.response?.status === 422) {
        console.log('Wishlist endpoint returned 422 - possibly empty wishlist')
        return []
      }
      console.warn('Wishlist fetch failed:', error.response?.data?.message || error.message)
      return []
    }
  }
)

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (contentId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/content/${contentId}/wishlist`)
      // Refetch wishlist to get updated list
      dispatch(fetchWishlist())
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist')
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (contentId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/content/${contentId}/wishlist`)
      dispatch(fetchWishlist())
      return contentId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist')
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
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
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchUserWishlist.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.error = null
        if (action.payload) {
          state.items = state.items.filter(item => item.id !== action.payload)
        }
      })
  },
})

export const { clearError } = wishlistSlice.actions
export default wishlistSlice.reducer