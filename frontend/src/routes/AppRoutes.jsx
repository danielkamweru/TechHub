import { Routes, Route, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import RoleGuard from '../utils/roleGuard.jsx'

// Pages
import Home from '../pages/Home'
import ContentHub from '../pages/ContentHub'
import TestContent from '../pages/TestContent'
import RoleSelection from '../pages/RoleSelection'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import ContentView from '../pages/ContentView'
import Wishlist from '../pages/Wishlist'
import AdminDashboard from '../pages/Admin/AdminDashboard'
import TechWriterDashboard from '../pages/TechWriter/TechWriterDashboard'
import UserDashboard from '../pages/User/UserDashboard'
import Studio from '../pages/Studio'
import CreateContent from '../pages/Content/CreateContent'
import ContentDetail from '../pages/ContentDetail'
import About from '../pages/About'
import ApiTest from '../pages/ApiTest'

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/explore" element={<ContentHub />} />
      <Route path="/test" element={<TestContent />} />
      <Route path="/api-test" element={<ApiTest />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/studio" element={<RoleGuard><Studio /></RoleGuard>} />
      <Route path="/content/create" element={<RoleGuard><CreateContent /></RoleGuard>} />
      
      {/* Protected Routes */}
      <Route 
        path="/profile" 
        element={<RoleGuard><Profile /></RoleGuard>} 
      />
      <Route 
        path="/wishlist" 
        element={<RoleGuard><Wishlist /></RoleGuard>} 
      />
      
      {/* Admin Only Routes */}
      <Route 
        path="/admin/*" 
        element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} 
      />
      
      {/* Tech Writer Routes */}
      <Route 
        path="/tech-writer/*" 
        element={<RoleGuard allowedRoles={['tech_writer', 'admin']}><TechWriterDashboard /></RoleGuard>} 
      />
      
      {/* User Routes */}
      <Route 
        path="/user/*" 
        element={<RoleGuard allowedRoles={['user']}><UserDashboard /></RoleGuard>} 
      />
      
      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <Link to="/" className="btn-primary">Go Home</Link>
            </div>
          </div>
        } 
      />
    </Routes>
  )
}

export default AppRoutes