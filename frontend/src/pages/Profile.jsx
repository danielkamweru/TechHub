import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { User, Mail, Edit2, Save, X, Github, Linkedin, Camera, Bell, BookOpen, Heart, Upload } from 'lucide-react'
import { updateUserProfile } from '../features/auth/authSlice'
import { fetchUserContent } from '../features/content/contentSlice'
import { fetchUserWishlist } from '../features/wishlist/wishlistSlice'
import api from '../services/api'

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items: userContent } = useSelector((state) => state.content)
  const { items: wishlist } = useSelector((state) => state.wishlist)
  
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploading, setUploading] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0) // Force re-render of avatar
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    github_url: '',
    linkedin_url: '',
    interests: []
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        github_url: user.github_url || '',
        linkedin_url: user.linkedin_url || '',
        interests: user.interests || []
      })
      dispatch(fetchUserContent(user.id))
      // Only fetch wishlist if user is authenticated and has a valid token
      const token = localStorage.getItem('token')
      if (token) {
        dispatch(fetchUserWishlist())
      }
    }
  }, [user, dispatch])

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateUserProfile(formData)).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('Uploading image...')
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      console.log('Upload response:', response.data)
      
      // Get the avatar URL from response
      const newAvatarUrl = response.data.avatar_url
      const timestamp = new Date().getTime()
      const avatarUrlWithTimestamp = `${newAvatarUrl}?t=${timestamp}`
      
      console.log('New avatar URL:', avatarUrlWithTimestamp)
      
      // Update form data immediately
      setFormData(prev => ({ ...prev, avatar_url: avatarUrlWithTimestamp }))
      
      // Update the user in Redux store using the proper action
      if (response.data.user) {
        console.log('Updating Redux store with user:', response.data.user)
        dispatch({ type: 'auth/updateUserProfile/fulfilled', payload: response.data.user })
      }
      
      // Show success message
      alert('Profile picture updated successfully!')
      
      // Force re-render of avatar component
      setAvatarKey(prev => prev + 1)
      
      // Force a re-render of the entire component
      setTimeout(() => {
        setFormData(prev => ({ ...prev }))
      }, 100)
      
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        github_url: user.github_url || '',
        linkedin_url: user.linkedin_url || '',
        interests: user.interests || []
      })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'content', label: 'My Content', icon: BookOpen },
    { id: 'wishlist', label: 'Wishlist', icon: Heart }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img 
                      key={avatarKey} // Force re-render when avatarKey changes
                      src={formData.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover" 
                      onLoad={() => console.log('Avatar loaded successfully:', formData.avatar_url)}
                      onError={(e) => {
                        console.error('Avatar image failed to load:', formData.avatar_url);
                        // Try fallback to user profile avatar
                        if (user?.profile?.avatar_url && formData.avatar_url !== user?.profile?.avatar_url) {
                          // Ensure fallback URL has full domain
                          const fallbackUrl = user.profile.avatar_url.startsWith('http') 
                            ? user.profile.avatar_url 
                            : `http://localhost:8000${user.profile.avatar_url}`;
                          e.target.src = fallbackUrl;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }} 
                    />
                  ) : user?.profile?.avatar_url ? (
                    <img 
                      key={`fallback-${avatarKey}`} // Force re-render when avatarKey changes
                      src={user.profile.avatar_url.startsWith('http') 
                        ? user.profile.avatar_url 
                        : `http://localhost:8000${user.profile.avatar_url}`} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover" 
                      onLoad={() => console.log('Fallback avatar loaded:', user.profile.avatar_url)}
                      onError={(e) => {
                        console.error('Fallback avatar failed to load:', user.profile.avatar_url);
                        e.target.style.display = 'none';
                      }} 
                    />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                
                {/* Always show change button when hovering or editing */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer text-white hover:text-blue-200 transition-colors"
                    title="Change profile picture"
                  >
                    {uploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Camera size={24} />
                    )}
                  </label>
                </div>
                
                {/* Show upload indicator when editing */}
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full">
                    <Camera size={12} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                    {user?.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? <X size={18} /> : <Edit2 size={18} />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-700">
                {user?.bio || 'No bio added yet. Click edit to add your bio.'}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="mt-6 flex items-center gap-4">
            {formData.github_url && (
              <a href={formData.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                <Github size={20} />
              </a>
            )}
            {formData.linkedin_url && (
              <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
                <Linkedin size={20} />
              </a>
            )}
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img 
                        key={avatarKey} // Force re-render when avatarKey changes
                        src={formData.avatar_url} 
                        alt="Avatar preview" 
                        className="w-full h-full rounded-full object-cover" 
                        onLoad={() => console.log('Preview avatar loaded:', formData.avatar_url)}
                        onError={(e) => {
                          console.error('Preview avatar failed to load:', formData.avatar_url);
                          // Try fallback to user profile avatar
                          if (user?.profile?.avatar_url && formData.avatar_url !== user?.profile?.avatar_url) {
                            // Ensure fallback URL has full domain
                            const fallbackUrl = user.profile.avatar_url.startsWith('http') 
                              ? user.profile.avatar_url 
                              : `http://localhost:8000${user.profile.avatar_url}`;
                            e.target.src = fallbackUrl;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : user?.profile?.avatar_url ? (
                      <img 
                        key={`preview-fallback-${avatarKey}`} // Force re-render when avatarKey changes
                        src={user.profile.avatar_url.startsWith('http') 
                          ? user.profile.avatar_url 
                          : `http://localhost:8000${user.profile.avatar_url}`} 
                        alt="Avatar preview" 
                        className="w-full h-full rounded-full object-cover" 
                        onLoad={() => console.log('Preview fallback loaded:', user.profile.avatar_url)}
                        onError={(e) => {
                          console.error('Preview fallback failed:', user.profile.avatar_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera size={18} />
                          <span>Change Picture</span>
                        </>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>
        )}

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
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Status</p>
                      <p className="font-medium capitalize">{user?.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium capitalize">{user?.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">My Content</h3>
                <div className="space-y-4">
                  {userContent?.length > 0 ? (
                    userContent.map((content) => (
                      <div key={content.id} className="border rounded-lg p-4">
                        <h4 className="font-medium">{content.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{content.content_text?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                            {content.content_type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {content.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {content.views_count || 0} views
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No content created yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">My Wishlist</h3>
                <div className="space-y-4">
                  {wishlist?.length > 0 ? (
                    wishlist.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                            {item.content_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.views_count || 0} views
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items in wishlist yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile