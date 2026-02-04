import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async ({ page = 1, category = null, search = '', limit = 50, status = null } = {}) => {
    const params = new URLSearchParams({ page, limit: limit.toString() })
    if (category) params.append('category', category)
    if (search) params.append('search', search)
    if (status !== null) params.append('status', status)
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    
    if (token) {
      // Authenticated user - use full content endpoint (admins see all, users see published)
      const response = await api.get(`/content/?${params}`)
      console.log('Raw API response (auth):', response.data)
      return response.data
    } else {
      // Unauthenticated user - use public endpoint (only published content)
      const response = await api.get(`/content/public?${params}`)
      console.log('Raw API response (public):', response.data)
      return response.data
    }
  }
)

export const fetchContentById = createAsyncThunk(
  'content/fetchContentById',
  async (id) => {
    const response = await api.get(`/content/${id}`)
    return response.data
  }
)

export const createContent = createAsyncThunk(
  'content/createContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/content', contentData)
      toast.success('Content created successfully! It is now pending admin approval.')
      return response.data
    } catch (error) {
      console.error('Create content error:', error.response?.data)
      // Handle different error response formats
      let errorMessage = 'Failed to create content'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response?.data && typeof error.response.data === 'object') {
        const validationError = error.response.data
        if (validationError.detail && Array.isArray(validationError.detail)) {
          errorMessage = validationError.detail.map(err => err.msg || err.message).join(', ')
        } else if (validationError.msg) {
          errorMessage = validationError.msg
        } else if (validationError.message) {
          errorMessage = validationError.message
        } else {
          errorMessage = 'Validation error occurred'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (typeof errorMessage !== 'string') {
        errorMessage = String(errorMessage)
      }
      
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({ id, ...contentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/content/${id}`, contentData)
      toast.success('Content updated successfully!')
      return response.data
    } catch (error) {
      console.error('Update content error:', error.response?.data)
      // Handle different error response formats
      let errorMessage = 'Failed to update content'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response?.data && typeof error.response.data === 'object') {
        const validationError = error.response.data
        if (validationError.detail && Array.isArray(validationError.detail)) {
          errorMessage = validationError.detail.map(err => err.msg || err.message).join(', ')
        } else if (validationError.msg) {
          errorMessage = validationError.msg
        } else if (validationError.message) {
          errorMessage = validationError.message
        } else {
          errorMessage = 'Validation error occurred'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (typeof errorMessage !== 'string') {
        errorMessage = String(errorMessage)
      }
      
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (id) => {
    await api.delete(`/content/${id}`)
    return id
  }
)

export const toggleLike = createAsyncThunk(
  'content/toggleLike',
  async (contentId, { getState }) => {
    const state = getState()
    const userLike = state.content.userLikes.find(like => like.content_id === contentId)
    
    // Toggle like state: if liked -> unlike, if not liked -> like
    const newLikeState = userLike?.is_like ? null : true
    
    if (newLikeState === null) {
      // Remove the like completely
      await api.delete(`/content/${contentId}/like`)
      return { contentId, action: 'remove', isLike: null }
    } else {
      // Create or update like
      const response = await api.post(`/content/${contentId}/like`, { 
        content_id: contentId,
        is_like: newLikeState 
      })
      return { contentId, action: 'toggle', isLike: newLikeState, ...response.data }
    }
  }
)

export const likeContent = createAsyncThunk(
  'content/likeContent',
  async ({ contentId, isLike = true }) => {
    const response = await api.post(`/content/${contentId}/like`, { 
      content_id: contentId,
      is_like: isLike 
    })
    return { contentId, ...response.data }
  }
)

export const fetchUserLikes = createAsyncThunk(
  'content/fetchUserLikes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/content/my-likes')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user likes')
    }
  }
)

export const saveToWishlist = createAsyncThunk(
  'content/saveToWishlist',
  async (id) => {
    const response = await api.post(`/content/${id}/wishlist`)
    return response.data
  }
)

export const approveContent = createAsyncThunk(
  'content/approveContent',
  async (id) => {
    try {
      const response = await api.put(`/content/${id}/approve`)
      toast.success('Content approved and published!')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve content')
      throw error
    }
  }
)

export const rejectContent = createAsyncThunk(
  'content/rejectContent',
  async (id) => {
    try {
      const response = await api.put(`/content/${id}/reject`)
      toast.success('Content rejected')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject content')
      throw error
    }
  }
)

export const removeContent = createAsyncThunk(
  'content/removeContent',
  async (id) => {
    const response = await api.delete(`/content/${id}`)
    return response.data
  }
)

export const flagContent = createAsyncThunk(
  'content/flagContent',
  async ({ contentId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/content/${contentId}/flag`, { reason })
      toast.success('Content flagged successfully!')
      return { contentId, ...response.data }
    } catch (error) {
      console.error('Flag content error:', error.response?.data)
      // Handle different error response formats
      let errorMessage = 'Failed to flag content'
      
      if (error.response?.data?.detail) {
        // Handle FastAPI detail message
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        // Handle custom message format
        errorMessage = error.response.data.message
      } else if (typeof error.response?.data === 'string') {
        // Handle direct string response
        errorMessage = error.response.data
      } else if (error.response?.data && typeof error.response.data === 'object') {
        // Handle FastAPI validation error object
        const validationError = error.response.data
        if (validationError.detail && Array.isArray(validationError.detail)) {
          // Handle FastAPI validation errors array
          errorMessage = validationError.detail.map(err => err.msg || err.message).join(', ')
        } else if (validationError.msg) {
          errorMessage = validationError.msg
        } else if (validationError.message) {
          errorMessage = validationError.message
        } else {
          // Fallback for object errors
          errorMessage = 'Validation error occurred'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Ensure errorMessage is a string
      if (typeof errorMessage !== 'string') {
        errorMessage = String(errorMessage)
      }
      
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const unflagContent = createAsyncThunk(
  'content/unflagContent',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/content/${contentId}/unflag`)
      toast.success('Content unflagged successfully!')
      return response.data
    } catch (error) {
      console.error('Unflag content error:', error.response?.data)
      // Handle different error response formats
      let errorMessage = 'Failed to unflag content'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response?.data && typeof error.response.data === 'object') {
        const validationError = error.response.data
        if (validationError.detail && Array.isArray(validationError.detail)) {
          errorMessage = validationError.detail.map(err => err.msg || err.message).join(', ')
        } else if (validationError.msg) {
          errorMessage = validationError.msg
        } else if (validationError.message) {
          errorMessage = validationError.message
        } else {
          errorMessage = 'Validation error occurred'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (typeof errorMessage !== 'string') {
        errorMessage = String(errorMessage)
      }
      
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchUserContent = createAsyncThunk(
  'content/fetchUserContent',
  async (userId) => {
    const response = await api.get(`/content/user/${userId}`)
    return response.data
  }
)

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    currentContent: null,
    loading: false,
    error: null,
    userLikes: [], // Track user's likes/dislikes
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
    },
    filters: {
      category: null,
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentContent: (state) => {
      state.currentContent = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false
        // Handle both array response and object response
        if (Array.isArray(action.payload)) {
          state.items = action.payload.map(item => {
            const userLike = state.userLikes.find(like => like.content_id === item.id)
            return {
              ...item,
              isLiked: userLike?.is_like || false,
              isDisliked: userLike?.is_like === false || false,
              is_flagged: item.is_flagged || false
            }
          })
          state.pagination = {
            page: 1,
            totalPages: 1,
            total: action.payload.length
          }
        } else {
          state.items = (action.payload.items || []).map(item => {
            const userLike = state.userLikes.find(like => like.content_id === item.id)
            return {
              ...item,
              isLiked: userLike?.is_like || false,
              isDisliked: userLike?.is_like === false || false,
              is_flagged: item.is_flagged || false
            }
          })
          state.pagination = action.payload.pagination || {
            page: 1,
            totalPages: 1,
            total: 0
          }
        }
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchContentById.fulfilled, (state, action) => {
        const userLike = state.userLikes.find(like => like.content_id === action.payload.id)
        state.currentContent = {
          ...action.payload,
          isLiked: userLike?.is_like || false,
          isDisliked: userLike?.is_like === false || false
        }
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateContent.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentContent?.id === action.payload.id) {
          state.currentContent = action.payload
        }
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(likeContent.fulfilled, (state, action) => {
        const { contentId, likes_count, dislikes_count } = action.payload
        
        // Update user likes tracking
        const existing = state.userLikes.find(l => l.content_id === contentId)
        if (existing) {
          // Toggle like if same action, otherwise update
          if (existing.is_like === true) {
            // Remove like (toggle off)
            state.userLikes = state.userLikes.filter(l => l.content_id !== contentId)
          } else {
            existing.is_like = true
          }
        } else {
          state.userLikes.push({ content_id: contentId, is_like: true })
        }
        
        // Update content items with server counts
        const item = state.items.find(i => i.id === contentId)
        if (item) {
          const userLike = state.userLikes.find(l => l.content_id === contentId)
          item.isLiked = userLike?.is_like === true || false
          item.isDisliked = userLike?.is_like === false || false
          item.likes_count = likes_count
          item.dislikes_count = dislikes_count
        }
        
        if (state.currentContent?.id === contentId) {
          const userLike = state.userLikes.find(l => l.content_id === contentId)
          state.currentContent.isLiked = userLike?.is_like === true || false
          state.currentContent.isDisliked = userLike?.is_like === false || false
          state.currentContent.likes_count = likes_count
          state.currentContent.dislikes_count = dislikes_count
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { contentId, action: toggleAction, isLike, likes_count, dislikes_count } = action.payload
        
        // Update user likes tracking
        if (toggleAction === 'remove') {
          // Remove the like completely
          state.userLikes = state.userLikes.filter(l => l.content_id !== contentId)
        } else {
          // Add or update the like
          const existing = state.userLikes.find(l => l.content_id === contentId)
          if (existing) {
            existing.is_like = isLike
          } else {
            state.userLikes.push({ content_id: contentId, is_like: isLike })
          }
        }
        
        // Update content items with server counts
        const item = state.items.find(i => i.id === contentId)
        if (item) {
          const userLike = state.userLikes.find(l => l.content_id === contentId)
          item.isLiked = userLike?.is_like === true || false
          item.isDisliked = userLike?.is_like === false || false
          item.likes_count = likes_count
          item.dislikes_count = dislikes_count
        }
        
        if (state.currentContent?.id === contentId) {
          const userLike = state.userLikes.find(l => l.content_id === contentId)
          state.currentContent.isLiked = userLike?.is_like === true || false
          state.currentContent.isDisliked = userLike?.is_like === false || false
          state.currentContent.likes_count = likes_count
          state.currentContent.dislikes_count = dislikes_count
        }
      })
      .addCase(fetchUserLikes.fulfilled, (state, action) => {
        state.userLikes = action.payload
        // Update content items with user's like/dislike status
        state.items = state.items.map(item => {
          const userLike = state.userLikes.find(like => like.content_id === item.id)
          return {
            ...item,
            isLiked: userLike?.is_like || false,
            isDisliked: userLike?.is_like === false || false
          }
        })
        // Update current content if it exists
        if (state.currentContent) {
          const currentUserLike = state.userLikes.find(like => like.content_id === state.currentContent.id)
          state.currentContent = {
            ...state.currentContent,
            isLiked: currentUserLike?.is_like || false,
            isDisliked: currentUserLike?.is_like === false || false
          }
        }
      })
      .addCase(flagContent.fulfilled, (state, action) => {
        // Update the content item to show it's flagged/unflagged
        const contentId = action.payload.contentId
        const item = state.items.find(i => i.id === contentId)
        if (item) {
          item.is_flagged = !item.is_flagged
        }
        if (state.currentContent?.id === contentId) {
          state.currentContent.is_flagged = !state.currentContent.is_flagged
        }
      })
      .addCase(unflagContent.fulfilled, (state, action) => {
        // Update the content item to show it's unflagged
        const contentId = parseInt(action.meta.arg)
        const item = state.items.find(i => i.id === contentId)
        if (item) {
          item.is_flagged = false
        }
        if (state.currentContent?.id === contentId) {
          state.currentContent.is_flagged = false
        }
      })
      .addCase(approveContent.fulfilled, (state, action) => {
        // Find the approved content and update its status
        const contentId = parseInt(action.meta.arg)
        const item = state.items.find(i => i.id === contentId)
        if (item) {
          item.status = 'published'
          item.published_at = new Date().toISOString()
          // Move approved content to the top
          state.items = [item, ...state.items.filter(i => i.id !== contentId)]
        }
        // Refresh the content list to get updated order
        if (state.items.length > 0) {
          // This will trigger a refetch of content
          state.loading = true
        }
      })
      .addCase(rejectContent.fulfilled, (state, action) => {
        // Find the rejected content and update its status
        const contentId = parseInt(action.meta.arg)
        const item = state.items.find(i => i.id === contentId)
        if (item) {
          item.status = 'rejected'
        }
      })
  },
})

export const { setFilters, clearCurrentContent } = contentSlice.actions
export default contentSlice.reducer