import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PenTool, Upload, Video, Mic, FileText, Image, Save, X, Plus, Eye } from 'lucide-react'
import { createContent } from '../features/content/contentSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

const Studio = () => {
  const dispatch = useDispatch()
  const { items: categories } = useSelector((state) => state.categories)
  const [activeTab, setActiveTab] = useState('create')
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content_text: '',
    content_type: 'article',
    media_url: '',
    thumbnail_url: '',
    category_id: ''
  })

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleCreateContent = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      await dispatch(createContent(formData)).unwrap()
      setFormData({
        title: '',
        content_text: '',
        content_type: 'article',
        media_url: '',
        thumbnail_url: '',
        category_id: ''
      })
    } catch (error) {
      console.error('Failed to create content:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const tabs = [
    { id: 'create', label: 'Create Content', icon: Plus },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'uploaded', label: 'Uploaded', icon: Video }
  ]

  const contentTypes = [
    { id: 'article', label: 'Article', icon: FileText, description: 'Write a blog post or article' },
    { id: 'video', label: 'Video', icon: Video, description: 'Upload or embed a video' },
    { id: 'podcast', label: 'Podcast', icon: Mic, description: 'Share audio content' },
    { id: 'audio', label: 'Audio', icon: Mic, description: 'Upload audio file' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PenTool className="text-blue-600" />
            Content Studio
          </h1>
          <p className="text-gray-600 mt-2">Create and manage your tech content</p>
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
            {activeTab === 'create' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Create New Content</h2>
                
                {/* Content Type Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Choose Content Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => setFormData({...formData, content_type: type.id})}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            formData.content_type === type.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className={`w-6 h-6 ${
                              formData.content_type === type.id ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                            <span className="font-medium">{type.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Content Form */}
                <form onSubmit={handleCreateContent} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a compelling title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content_text}
                      onChange={(e) => setFormData({...formData, content_text: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={8}
                      placeholder="Write your content here..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(formData.content_type === 'video' || formData.content_type === 'podcast' || formData.content_type === 'audio') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media URL
                      </label>
                      <input
                        type="url"
                        value={formData.media_url}
                        onChange={(e) => setFormData({...formData, media_url: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/media-file"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter a URL to your video, podcast, or audio file
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Optional: Add a thumbnail image for your content
                    </p>
                  </div>

                  {/* Preview */}
                  {formData.title && formData.content_text && (
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-gray-600" />
                        Preview
                      </h3>
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{formData.title}</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{formData.content_text}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                            {formData.content_type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            Draft
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Create Content
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        title: '',
                        content_text: '',
                        content_type: 'article',
                        media_url: '',
                        thumbnail_url: '',
                        category_id: ''
                      })}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'drafts' && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Drafts Yet</h3>
                <p className="text-gray-600 mb-4">
                  Your saved drafts will appear here
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Content
                </button>
              </div>
            )}

            {activeTab === 'uploaded' && (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Uploaded Content Yet</h3>
                <p className="text-gray-600 mb-4">
                  Your published content will appear here
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Studio
