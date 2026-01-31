import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async () => {
  const response = await api.get('/notifications')
  return response.data
})

export const markNotificationAsRead = createAsyncThunk('notifications/markNotificationAsRead', async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`)
  return response.data
})

export const markAllNotificationsAsRead = createAsyncThunk('notifications/markAllNotificationsAsRead', async () => {
  const response = await api.put('/notifications/mark-all-read')
  return response.data
})

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async () => {
  const response = await api.get('/notifications/unread-count')
  return response.data
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload
        state.unreadCount = action.payload.filter(n => !n.is_read).length
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.meta?.arg
        const notification = state.items.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          notification.is_read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload?.unread_count ?? 0
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach(notification => {
          notification.is_read = true
        })
        state.unreadCount = 0
      })
  },
})

export default notificationsSlice.reducer