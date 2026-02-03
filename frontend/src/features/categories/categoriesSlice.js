import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const response = await api.get('/categories')
  return response.data
})

export const createCategory = createAsyncThunk('categories/createCategory', async (categoryData) => {
  const response = await api.post('/categories', categoryData)
  return response.data
})

export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ id, ...categoryData }) => {
  const response = await api.put(`/categories/${id}`, categoryData)
  return response.data
})

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory', 
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.response?.data?.message || 'Failed to delete category')
    }
  }
)

export const subscribeToCategory = createAsyncThunk('categories/subscribeToCategory', async (categoryId) => {
  const response = await api.post(`/categories/${categoryId}/subscribe`)
  return response.data
})

export const unsubscribeFromCategory = createAsyncThunk('categories/unsubscribeFromCategory', async (categoryId) => {
  await api.delete(`/categories/${categoryId}/subscribe`)
  return categoryId
})

export const fetchUserSubscriptions = createAsyncThunk('categories/fetchUserSubscriptions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/categories/user/subscriptions')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions')
  }
})

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    subscribedIds: [],
    userSubscriptions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action) => {
        state.userSubscriptions = action.payload || []
        state.subscribedIds = (action.payload || []).map(c => c.id)
      })
      .addCase(subscribeToCategory.fulfilled, (state, action) => {
        const categoryId = action.meta?.arg
        if (categoryId != null && !state.subscribedIds.includes(categoryId)) {
          state.subscribedIds.push(categoryId)
        }
      })
      .addCase(unsubscribeFromCategory.fulfilled, (state, action) => {
        state.subscribedIds = state.subscribedIds.filter(id => id !== action.payload)
        state.userSubscriptions = state.userSubscriptions.filter(c => c.id !== action.payload)
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(category => category.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  },
})

export default categoriesSlice.reducer