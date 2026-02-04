import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test setup
global.vi = vi

// Suppress React warnings
const originalWarn = console.warn
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act')) {
    return
  }
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag')) {
    return
  }
  originalWarn(...args)
}

// Mock React Router to suppress future flag warnings
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    // Suppress future flag warnings by providing simplified components
    BrowserRouter: ({ children }) => children,
    MemoryRouter: ({ children }) => children,
    Router: ({ children }) => children,
  }
})
