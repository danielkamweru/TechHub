import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Users, FileText, Folder, Shield, Eye, EyeOff, Trash2, CheckCircle, XCircle, AlertTriangle, TrendingUp, BarChart3, Settings, Plus, Edit, Flag } from 'lucide-react'
import { fetchUsers, createUser, deactivateUser, activateUser, updateUserRole } from '../../features/users/usersSlice'
import { fetchContent, approveContent, rejectContent, removeContent, flagContent, unflagContent } from '../../features/content/contentSlice'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../features/categories/categoriesSlice'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { items: users } = useSelector((state) => state.users)
  const { items: content } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const [activeTab, setActiveTab] = useState(() => {
    // Get the active tab from localStorage or default to 'overview'
    const savedTab = localStorage.getItem('adminActiveTab')
    return savedTab || 'overview'
  })
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
  const [editingCategory, setEditingCategory] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showContentDeleteConfirm, setShowContentDeleteConfirm] = useState(null)

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab)
  }, [activeTab])

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchContent({ limit: 100, status: null })).then((action) => {
      console.log('Content received:', action.payload?.length || 0, 'items')
      console.log('Flagged items:', action.payload?.filter(item => item.is_flagged) || [])
      console.log('Sample item:', action.payload?.[0])
    })
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
      toast.success('Category created successfully!')
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error('Failed to create category')
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category })
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateCategory({ id: editingCategory.id, ...editingCategory })).unwrap()
      setEditingCategory(null)
      dispatch(fetchCategories())
      toast.success('Category updated successfully!')
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await dispatch(deleteCategory(categoryId)).unwrap()
      setShowDeleteConfirm(null)
      dispatch(fetchCategories())
      toast.success('Category deleted successfully!')
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleContentAction = async (contentId, action) => {
    try {
      switch (action) {
        case 'approve':
          await dispatch(approveContent(contentId)).unwrap()
          toast.success('Content approved successfully!')
          break
        case 'reject':
          await dispatch(rejectContent(contentId)).unwrap()
          toast.success('Content rejected successfully!')
          break
        case 'delete':
          // Show confirmation dialog instead of directly deleting
          setShowContentDeleteConfirm(contentId)
          return
        case 'flag':
          await dispatch(flagContent(contentId)).unwrap()
          toast.success('Content flagged successfully!')
          break
        case 'unflag':
          await dispatch(flagContent(contentId)).unwrap()
          toast.success('Content returned successfully!')
          break
      }
      dispatch(fetchContent({ limit: 100, status: null })) // Refresh all content
    } catch (error) {
      console.error(`Failed to ${action} content:`, error)
      toast.error(`Failed to ${action} content. Please try again.`)
    }
  }

  const handleDeleteContent = async (contentId) => {
    try {
      await dispatch(removeContent(contentId)).unwrap()
      setShowContentDeleteConfirm(null)
      dispatch(fetchContent({ limit: 100, status: null }))
      toast.success('Content deleted successfully!')
    } catch (error) {
      console.error('Failed to delete content:', error)
      toast.error('Failed to delete content. Please try again.')
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...(content || [])]
                        .sort((a, b) => {
                          // Published content first, then unpublished at bottom
                          if (a.status === 'published' && b.status !== 'published') return -1
                          if (a.status !== 'published' && b.status === 'published') return 1
                          return a.id - b.id
                        })
                        .map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.author?.full_name || item.author?.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {item.content_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'published' ? 'bg-green-100 text-green-800' :
                              item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'review' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status === 'published' ? 'PUBLISHED' : 
                               item.status === 'draft' ? 'DRAFT' : 
                               item.status === 'review' ? 'REVIEW' : 
                               'UNPUBLISHED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-1">
                              {item.status === 'published' ? (
                                // Published content shows flag and delete
                                <>
                                  <button
                                    onClick={() => handleContentAction(item.id, item.is_flagged ? 'unflag' : 'flag')}
                                    className={`flex items-center gap-1 px-3 py-2 rounded hover:bg-orange-50 border border-orange-300 ${
                                      item.is_flagged ? 'text-white bg-red-600 hover:bg-red-700' : 'text-orange-600 hover:text-orange-900 bg-orange-50'
                                    }`}
                                    title={item.is_flagged ? "Unflag" : "Flag"}
                                  >
                                    <Flag size={14} />
                                    <span className="text-xs font-medium">{item.is_flagged ? 'Unflag' : 'Flag'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleContentAction(item.id, 'delete')}
                                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-900 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                    <span className="text-xs font-medium">Delete</span>
                                  </button>
                                </>
                              ) : (
                                // Unpublished content shows approve, reject, flag, delete
                                <>
                                  <button
                                    onClick={() => handleContentAction(item.id, 'approve')}
                                    className="flex items-center gap-1 px-3 py-2 text-green-600 hover:text-green-900 rounded hover:bg-green-50 border border-green-300 bg-green-50"
                                    title="Approve"
                                  >
                                    <CheckCircle size={14} />
                                    <span className="text-xs font-medium">Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleContentAction(item.id, 'reject')}
                                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-900 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                    title="Reject"
                                  >
                                    <XCircle size={14} />
                                    <span className="text-xs font-medium">Reject</span>
                                  </button>
                                  <button
                                    onClick={() => handleContentAction(item.id, item.is_flagged ? 'unflag' : 'flag')}
                                    className={`flex items-center gap-1 px-3 py-2 rounded hover:bg-orange-50 border border-orange-300 ${
                                      item.is_flagged ? 'text-white bg-red-600 hover:bg-red-700' : 'text-orange-600 hover:text-orange-900 bg-orange-50'
                                    }`}
                                    title={item.is_flagged ? "Unflag" : "Flag"}
                                  >
                                    <Flag size={14} />
                                    <span className="text-xs font-medium">{item.is_flagged ? 'Unflag' : 'Flag'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleContentAction(item.id, 'delete')}
                                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-900 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                    <span className="text-xs font-medium">Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                            title="Edit category"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(category.id)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                            title="Delete category"
                          >
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
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Total content items: {content?.length || 0} | 
                    Flagged items: {content?.filter(item => item.is_flagged).length || 0}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {content?.filter(item => item.is_flagged).map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.author?.full_name || item.author?.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'published' ? 'bg-green-100 text-green-800' :
                              item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'review' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status === 'published' ? 'PUBLISHED' : 
                               item.status === 'draft' ? 'DRAFT' : 
                               item.status === 'review' ? 'REVIEW' : 
                               'UNPUBLISHED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleContentAction(item.id, 'unflag')}
                                className="flex items-center gap-1 px-3 py-2 text-green-600 hover:text-green-900 rounded hover:bg-green-50 border border-green-300 bg-green-50"
                                title="Return Content"
                              >
                                <CheckCircle size={14} />
                                <span className="text-xs font-medium">Return</span>
                              </button>
                              <button
                                onClick={() => handleContentAction(item.id, 'delete')}
                                className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-900 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                                <span className="text-xs font-medium">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!content?.filter(item => item.is_flagged).length) && (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="text-gray-400 mb-2" size={32} />
                              <p className="text-gray-500 text-sm">No flagged content found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Category</h2>
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-24 resize-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Color:</label>
                  <input
                    type="color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                    className="w-12 h-8 border rounded"
                  />
                  <span className="text-sm text-gray-600">{editingCategory.color}</span>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Update Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold">Delete Category</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this category? This action cannot be undone and may affect content associated with this category.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteCategory(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Delete Confirmation Modal */}
        {showContentDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold">Delete Content</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this content? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteContent(showContentDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowContentDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard