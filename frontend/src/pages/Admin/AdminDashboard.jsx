import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, FileText, Folder, Shield, Eye, EyeOff, Trash2, CheckCircle, XCircle, AlertTriangle, TrendingUp, BarChart3, Settings, Plus, Edit, Flag } from 'lucide-react'
import { fetchUsers, createUser, deactivateUser, activateUser, updateUserRole } from '../../features/users/usersSlice'
import { fetchContent, approveContent, rejectContent, removeContent } from '../../features/content/contentSlice'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../features/categories/categoriesSlice'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { items: users } = useSelector((state) => state.users)
  const { items: content } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    role: 'user'
  })
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#3B82F6' })

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchContent())
    dispatch(fetchCategories())
  }, [dispatch])

  const handleUserToggle = async (userId, isActive) => {
    try {
      if (isActive) {
        await dispatch(deactivateUser(userId)).unwrap()
      } else {
        await dispatch(activateUser(userId)).unwrap()
      }
      dispatch(fetchUsers())
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap()
      dispatch(fetchUsers())
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createUser(newUser)).unwrap()
      setNewUser({ email: '', username: '', full_name: '', password: '', role: 'user' })
      setShowCreateUser(false)
      dispatch(fetchUsers())
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createCategory(newCategory)).unwrap()
      setNewCategory({ name: '', description: '', color: '#3B82F6' })
      setShowCreateCategory(false)
      dispatch(fetchCategories())
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleContentAction = async (contentId, action) => {
    try {
      switch (action) {
        case 'approve':
          await dispatch(approveContent(contentId)).unwrap()
          break
        case 'reject':
          await dispatch(rejectContent(contentId)).unwrap()
          break
        case 'delete':
          await dispatch(removeContent(contentId)).unwrap()
          break
      }
      dispatch(fetchContent())
    } catch (error) {
      console.error(`Failed to ${action} content:`, error)
    }
  }

  const pendingContent = content?.filter(c => c.status === 'review') || []
  const publishedContent = content?.filter(c => c.status === 'published') || []
  const totalUsers = users?.length || 0
  const activeUsers = users?.filter(u => u.is_active).length || 0
  const adminUsers = users?.filter(u => u.role === 'admin').length || 0
  const writerUsers = users?.filter(u => u.role === 'tech_writer').length || 0
  const regularUsers = users?.filter(u => u.role === 'user').length || 0

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'flags', label: 'Content Flags', icon: Flag }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users, content, and platform settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Platform Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Content</p>
                        <p className="text-2xl font-bold text-gray-900">{content?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Review</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingContent.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Role Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium mb-4">User Role Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Admins</span>
                        <span className="font-medium">{adminUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tech Writers</span>
                        <span className="font-medium">{writerUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regular Users</span>
                        <span className="font-medium">{regularUsers}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium mb-4">Content Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published</span>
                        <span className="font-medium">{publishedContent.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Review</span>
                        <span className="font-medium">{pendingContent.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Categories</span>
                        <span className="font-medium">{categories?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Add User
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(users || []).map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize border-0"
                            >
                              <option value="user">User</option>
                              <option value="tech_writer">Tech Writer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleUserToggle(user.id, user.is_active)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm text-red-600 hover:bg-red-50"
                            >
                              {user.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Content Management</h2>
                <div className="space-y-4">
                  {(content || []).map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                              {item.content_type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.status === 'published' ? 'bg-green-100 text-green-800' :
                              item.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status || 'draft'}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {item.category?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              By: {item.author?.full_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>{item.views_count || 0} views</span>
                            <span>{item.likes_count || 0} likes</span>
                            <span>{item.comments_count || 0} comments</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {item.status === 'review' && (
                            <>
                              <button
                                onClick={() => handleContentAction(item.id, 'approve')}
                                className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-md text-sm"
                              >
                                <CheckCircle size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleContentAction(item.id, 'reject')}
                                className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleContentAction(item.id, 'delete')}
                            className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Category Management</h2>
                  <button
                    onClick={() => setShowCreateCategory(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Create Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(categories || []).map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <h3 className="font-medium">{category.name}</h3>
                          </div>
                          <p className="text-gray-600 text-sm">{category.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {category.content?.length || 0} items
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'flags' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Content Flags</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <h3 className="font-medium text-yellow-800">No Active Flags</h3>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Content flagging system will be available once backend implementation is complete.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="user">User</option>
                  <option value="tech_writer">Tech Writer</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {showCreateCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-24 resize-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Color:</label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-12 h-8 border rounded"
                  />
                  <span className="text-sm text-gray-600">{newCategory.color}</span>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(false)}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard