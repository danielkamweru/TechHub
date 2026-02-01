import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  PenTool,
  Shield,
  Heart,
  Plus
} from 'lucide-react'
import NotificationCenter from './NotificationCenter'
import { logout } from '../features/auth/authSlice'

const MobileNavigation = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      closeMenu()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSettings = () => {
    closeMenu()
    navigate('/settings')
  }

  const getNavItems = () => {
    const items = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/explore', label: 'Explore', icon: Search },
    ]

    if (isAuthenticated) {
      items.push(
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/wishlist', label: 'Wishlist', icon: Heart }
      )

      // Add role-specific navigation
      if (user?.role === 'admin') {
        items.push({ path: '/admin', label: 'Admin', icon: Shield })
      } else if (user?.role === 'tech_writer') {
        items.push({ path: '/tech-writer', label: 'Writer', icon: PenTool })
      } else {
        items.push({ path: '/user', label: 'Userdashboard', icon: BookOpen })
      }
    }

    return items
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TechHub</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && <NotificationCenter />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <User className="w-5 h-5 text-gray-600" style={{ display: user?.avatar_url ? 'none' : 'block' }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.full_name || user?.username}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                {user?.role === 'tech_writer' && (
                  <Link
                    to="/content/create"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Create Content</span>
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>

            {/* Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p>TechHub Learning Platform</p>
                <p className="mt-1">© 2026 All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="grid grid-cols-5 gap-1">
            {[
              { path: '/', icon: Home, label: 'Home' },
              { path: '/explore', icon: Search, label: 'Explore' },
              { path: '/user', icon: BookOpen, label: 'Userdashboard' },
              { path: '/wishlist', icon: Heart, label: 'Wishlist' },
              { path: '/profile', icon: User, label: 'Profile' },
            ].map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 py-2 px-1 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}

export default MobileNavigation
