import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/comments/content/${contentId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments')
    }
  }
)

export const addComment = createAsyncThunk(
  'comments/addComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const payload = {
        content_id: commentData.contentId ?? commentData.content_id,
        text: commentData.text,
        parent_id: commentData.parentId ?? commentData.parent_id ?? null
      }
      const response = await api.post('/comments', payload)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment')
    }
  }
)

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/comments/${id}`, { text })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment')
    }
  }
)

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment')
    }
  }
)

export const reportComment = createAsyncThunk(
  'comments/reportComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comments/${commentId}/report`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report comment')
    }
  }
)

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment')
    }
  }
)

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearComments: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        // Update the comment with the new like data
        const updateCommentLikes = (comments) => {
          return comments.map(comment => {
            if (comment.id === action.payload.comment_id) {
              return {
                ...comment,
                likes_count: action.payload.likes_count,
                is_liked: action.payload.is_liked
              }
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateCommentLikes(comment.replies)
              }
            }
            return comment
          })
        }
        
        state.items = updateCommentLikes(state.items)
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  },
})

export const { clearError, clearComments } = commentsSlice.actions
export default commentsSlice.reducer