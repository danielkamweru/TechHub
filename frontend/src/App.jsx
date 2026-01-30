import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import MobileNavigation from './components/MobileNavigation'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import { checkAuth } from './features/auth/authSlice'
import { fetchUserLikes } from './features/content/contentSlice'
import { fetchWishlist } from './features/wishlist/wishlistSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Restore auth state on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(checkAuth())
    }
  }, [dispatch])

  // Fetch user's likes and wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch user data first, then content will have like status
      dispatch(fetchUserLikes())
      dispatch(fetchWishlist())
    }
  }, [isAuthenticated, dispatch])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <Navbar />
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:block">
          <MobileNavigation />
        </div>
        
        {/* Main Content */}
        <main className={`${isAuthenticated ? 'lg:pt-0 pt-16 lg:pb-0 pb-16' : ''}`}>
          <AppRoutes />
        </main>
        
        {/* Desktop Footer */}
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App