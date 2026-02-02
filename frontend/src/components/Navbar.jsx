import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, X, User, LogOut, Sparkles } from 'lucide-react'
import { logout } from '../features/auth/authSlice'
import NotificationCenter from './NotificationCenter'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TechHub
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/explore" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Explore
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            {isAuthenticated && (
              <>
                {user?.role === 'user' && (
                  <Link to="/user" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Userdashboard
                  </Link>
                )}
                <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Wishlist
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Admin
                  </Link>
                )}
                {user?.role === 'tech_writer' && (
                  <Link to="/tech-writer" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    Writer
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <NotificationCenter />
                </div>
                <Link to="/profile" className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="btn-primary flex items-center gap-2">
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/role-selection" className="btn-secondary">
                  Get Started
                </Link>
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-white/10 animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
              Home
            </Link>
            <Link to="/explore" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
              Explore
            </Link>
            <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
              About
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'user' && (
                  <Link to="/user" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
                    Userdashboard
                  </Link>
                )}
                <Link to="/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
                  Wishlist
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/role-selection" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
                  Get Started
                </Link>
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-xl font-medium transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar