import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async ({ page = 1, category = null, search = '', limit = 50 } = {}) => {
    const params = new URLSearchParams({ page, limit: limit.toString() })
    if (category) params.append('category', category)
    if (search) params.append('search', search)
    
    const response = await api.get(`/content?${params}`)
    return response.data
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
  async (contentData) => {
    const response = await api.post('/content', contentData)
    return response.data
  }
)

export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({ id, ...contentData }) => {
    const response = await api.put(`/content/${id}`, contentData)
    return response.data
  }
)

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (id) => {
    await api.delete(`/content/${id}`)
    return id
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

export const downvoteContent = createAsyncThunk(
  'content/downvoteContent',
  async ({ contentId, isDislike = true }) => {
    const response = await api.post(`/content/${contentId}/like`, { 
      content_id: contentId,
      is_like: false // false means dislike
    })
    return { contentId, ...response.data }
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
    const response = await api.put(`/content/${id}/approve`)
    return response.data
  }
)

export const rejectContent = createAsyncThunk(
  'content/rejectContent',
  async (id) => {
    const response = await api.put(`/content/${id}/reject`)
    return response.data
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
  async ({ contentId, reason }) => {
    const response = await api.post(`/content/${contentId}/flag`, { reason })
    return response.data
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
              isDisliked: userLike?.is_like === false || false
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
              isDisliked: userLike?.is_like === false || false
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
        const { contentId } = action.payload
        const item = state.items.find(item => item.id === contentId)
        if (item) {
          item.isLiked = !item.isLiked
          item.likes_count = item.isLiked ? (item.likes_count || 0) + 1 : Math.max(0, (item.likes_count || 0) - 1)
        }
        if (state.currentContent?.id === contentId) {
          state.currentContent.isLiked = !state.currentContent.isLiked
          state.currentContent.likes_count = state.currentContent.isLiked 
            ? (state.currentContent.likes_count || 0) + 1 
            : Math.max(0, (state.currentContent.likes_count || 0) - 1)
        }
      })
      .addCase(downvoteContent.fulfilled, (state, action) => {
        const { contentId } = action.payload
        const item = state.items.find(item => item.id === contentId)
        if (item) {
          item.isDisliked = !item.isDisliked
          item.dislikes_count = item.isDisliked ? (item.dislikes_count || 0) + 1 : Math.max(0, (item.dislikes_count || 0) - 1)
        }
        if (state.currentContent?.id === contentId) {
          state.currentContent.isDisliked = !state.currentContent.isDisliked
          state.currentContent.dislikes_count = state.currentContent.isDisliked 
            ? (state.currentContent.dislikes_count || 0) + 1 
            : Math.max(0, (state.currentContent.dislikes_count || 0) - 1)
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
  },
})

export const { setFilters, clearCurrentContent } = contentSlice.actions
export default contentSlice.reducer