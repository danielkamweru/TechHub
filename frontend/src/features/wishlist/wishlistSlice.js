import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist')
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
      const response = await api.get('/wishlist')
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
      const response = await api.post(`/wishlist/${contentId}`)
      // Refetch wishlist to get updated list
      dispatch(fetchWishlist())
      toast.success('Added to wishlist!')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add to wishlist'
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (contentId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/wishlist/${contentId}`)
      dispatch(fetchWishlist())
      toast.success('Removed from wishlist!')
      return contentId
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to remove from wishlist'
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
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