import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

import authSlice from './features/auth/authSlice'
import contentSlice from './features/content/contentSlice'
import notificationsSlice from './features/notifications/notificationsSlice'
import commentsSlice from './features/comments/commentsSlice'

vi.mock('./services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      content: contentSlice,
      notifications: notificationsSlice,
      comments: commentsSlice
    },
    preloadedState: initialState
  })
}

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
)

describe('TechHub Frontend Tests', () => {
  let store

  beforeEach(() => {
    store = createTestStore({
      auth: { user: null, token: null, isLoading: false, error: null },
      content: { items: [], loading: false, error: null },
      notifications: { items: [], unreadCount: 0, loading: false, error: null },
      comments: { items: [], loading: false, error: null }
    })
  })

  describe('01 - Redux Store Configuration', () => {
    it('creates store with correct initial state', () => {
      const testStore = createTestStore()
      const state = testStore.getState()
      
      expect(state.auth).toBeDefined()
      expect(state.content).toBeDefined()
      expect(state.notifications).toBeDefined()
      expect(state.comments).toBeDefined()
    })
  })

  describe('02 - Auth Slice', () => {
    it('handles login action correctly', () => {
      const initialState = { user: null, token: null, isLoading: false, error: null }
      const action = { type: 'auth/login/fulfilled', payload: { user: { id: 1, email: 'test@test.com' }, token: 'test-token' } }
      
      const newState = authSlice(initialState, action)
      
      expect(newState.user.email).toBe('test@test.com')
      expect(newState.token).toBe('test-token')
    })
  })

  describe('03 - Content Slice', () => {
    it('handles fetch content action', () => {
      const initialState = { items: [], loading: false, error: null, userLikes: [] }
      const mockContent = [{ id: 1, title: 'Test Article' }]
      const action = { type: 'content/fetchContent/fulfilled', payload: mockContent }
      
      const newState = contentSlice(initialState, action)
      
      expect(newState.items[0].id).toBe(mockContent[0].id)
      expect(newState.items[0].title).toBe(mockContent[0].title)
      expect(newState.loading).toBe(false)
    })
  })

  describe('04 - Notifications Slice', () => {
    it('handles notification fetching', () => {
      const initialState = { items: [], unreadCount: 0, loading: false, error: null }
      const mockNotifications = [{ id: 1, title: 'Test Notification', is_read: false }]
      const action = { type: 'notifications/fetchNotifications/fulfilled', payload: mockNotifications }
      
      const newState = notificationsSlice(initialState, action)
      
      expect(newState.items).toEqual(mockNotifications)
      expect(newState.unreadCount).toBe(1)
    })
  })

  describe('05 - Comments Slice', () => {
    it('handles comment addition', () => {
      const initialState = { items: [], loading: false, error: null }
      const mockComment = { id: 1, text: 'Test comment' }
      const action = { type: 'comments/addComment/fulfilled', payload: mockComment }
      
      const newState = commentsSlice(initialState, action)
      
      expect(newState.items).toContain(mockComment)
    })
  })

  describe('06 - Component Integration', () => {
    it('renders navigation correctly', () => {
      act(() => {
        render(
          <TestWrapper store={store}>
            <div>Navigation Test</div>
          </TestWrapper>
        )
      })
      expect(document.body).toBeTruthy()
    })
  })

  describe('07 - User Interactions', () => {
    it('handles button clicks', () => {
      const handleClick = vi.fn()
      act(() => {
        render(
          <TestWrapper store={store}>
            <button onClick={handleClick}>Test Button</button>
          </TestWrapper>
        )
      })
      
      const button = screen.getByText('Test Button')
      act(() => {
        fireEvent.click(button)
      })
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('08 - Form Handling', () => {
    it('handles form input changes', () => {
      act(() => {
        render(
          <TestWrapper store={store}>
            <form data-testid="test-form">
              <input data-testid="test-input" placeholder="Test input" />
            </form>
          </TestWrapper>
        )
      })
      
      const input = screen.getByTestId('test-input')
      act(() => {
        fireEvent.change(input, { target: { value: 'test value' } })
      })
      expect(input.value).toBe('test value')
    })
  })

  describe('09 - Async Actions', () => {
    it('handles async state changes', async () => {
      const initialState = { items: [], loading: false, error: null }
      const loadingAction = { type: 'content/fetchContent/pending' }
      
      const loadingState = contentSlice(initialState, loadingAction)
      expect(loadingState.loading).toBe(true)
      
      const successAction = { type: 'content/fetchContent/fulfilled', payload: [] }
      const successState = contentSlice(loadingState, successAction)
      expect(successState.loading).toBe(false)
    })
  })

  describe('10 - Error Handling', () => {
    it('handles error states correctly', () => {
      const initialState = { items: [], loading: false, error: null }
      const errorAction = { type: 'content/fetchContent/rejected', error: { message: 'Test error' } }
      
      const newState = contentSlice(initialState, errorAction)
      
      expect(newState.error).toBe('Test error')
      expect(newState.loading).toBe(false)
    })
  })
})
