import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { 
  Play, Headphones, BookOpen, Heart, Bookmark, Share2, MessageCircle, 
  Search, Filter, X, Check
} from 'lucide-react'
import { fetchContent } from '../features/content/contentSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'
import { likeContent } from '../features/content/contentSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'
import CommentThread from '../components/CommentThread'

const ContentHub = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items: content, loading } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [showComments, setShowComments] = useState(false)
  const [likedContent, setLikedContent] = useState(new Set())

  useEffect(() => {
    dispatch(fetchContent({ limit: 50 }))
    dispatch(fetchCategories())
  }, [dispatch])

  // Watch for URL changes and update state
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const typeFromUrl = searchParams.get('type')
    const searchFromUrl = searchParams.get('search')
    
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl || 'all')
    }
    if (typeFromUrl !== selectedType) {
      setSelectedType(typeFromUrl || 'all')
    }
    if (searchFromUrl !== searchTerm) {
      setSearchTerm(searchFromUrl || '')
    }
  }, [searchParams.toString()])



  const handleLike = async (contentId) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    try {
      await dispatch(likeContent({ contentId, isLike: true })).unwrap()
      setLikedContent(prev => {
        const newSet = new Set(prev)
        if (newSet.has(contentId)) {
          newSet.delete(contentId) // Unlike
        } else {
          newSet.add(contentId) // Like
        }
        return newSet
      })
    } catch (error) {
      console.error('Failed to like content:', error)
    }
  }

  const handleWishlist = async (contentId) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const isInWishlist = wishlistItems.some(item => item.id === contentId)
    if (isInWishlist) {
      dispatch(removeFromWishlist(contentId))
    } else {
      dispatch(addToWishlist(contentId))
    }
  }

  const handleShare = (content) => {
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.content_text,
        url: window.location.origin + `/content/${content.id}`
      }).catch(console.error)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/content/${content.id}`)
      alert('Link copied to clipboard!')
    }
  }

  const getActionButton = (contentType, contentId) => {
    switch (contentType) {
      case 'video':
        return (
          <Link 
            to={`/content/${contentId}`}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Play size={16} />
            Watch
          </Link>
        )
      case 'podcast':
        return (
          <Link 
            to={`/content/${contentId}`}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Headphones size={16} />
            Listen
          </Link>
        )
      case 'article':
        return (
          <Link 
            to={`/content/${contentId}`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <BookOpen size={16} />
            Read
          </Link>
        )
      default:
        return null
    }
  }

  const getThumbnail = (item) => {
    // Ensure all content has a thumbnail
    if (item.thumbnail_url) {
      return item.thumbnail_url
    }
    
    // Generate fallback based on type
    const typeColors = {
      video: '6366f1',
      podcast: 'a855f7',
      article: '3b82f6'
    }
    const color = typeColors[item.content_type] || '6366f1'
    const title = encodeURIComponent(item.title.substring(0, 30))
    return `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop&auto=format&q=80`
  }

  const filteredContent = (content || []).filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_text?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      item.category?.name === selectedCategory
    
    const matchesType = selectedType === 'all' || 
      item.content_type === selectedType
    
    console.log('Filtering:', {
      item: item.title,
      category: item.category?.name,
      selectedCategory,
      matchesCategory,
      selectedType,
      matchesType
    })
    
    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tech Content Hub</h1>
          <p className="text-gray-600">Watch videos, listen to podcasts, and read articles in one unified interface</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="podcast">Podcasts</option>
                  <option value="article">Articles</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredContent.length}</span> of {content.length} items
          </p>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => {
              const isLiked = likedContent.has(item.id)
              const isInWishlist = wishlistItems.some(w => w.id === item.id)
              
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Thumbnail - Clickable */}
                  <Link to={`/content/${item.id}`}>
                    <div className="aspect-video bg-gray-200 relative overflow-hidden cursor-pointer group">
                      <img
                        src={getThumbnail(item)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop&auto=format&q=80`
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        {item.content_type === 'video' && (
                          <div className="bg-red-600 bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform">
                            <Play size={32} className="text-white ml-1" fill="white" />
                          </div>
                        )}
                        {item.content_type === 'podcast' && (
                          <div className="bg-purple-600 bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform">
                            <Headphones size={32} className="text-white" />
                          </div>
                        )}
                        {item.content_type === 'article' && (
                          <div className="bg-blue-600 bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform">
                            <BookOpen size={32} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full capitalize">
                          {item.content_type}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {item.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.content_text}</p>

                    {/* Primary Action Button */}
                    <div className="mb-4">
                      {getActionButton(item.content_type, item.id)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mb-3">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isLiked
                            ? 'text-red-600 bg-red-50'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                      </button>
                      
                      {/* Wishlist */}
                      <button
                        onClick={() => handleWishlist(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isInWishlist
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Add to Wishlist"
                      >
                        <Bookmark size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                      </button>
                      
                      {/* Share */}
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                      
                      {/* Comment */}
                      <button
                        onClick={() => {
                          setSelectedContent(item)
                          setShowComments(true)
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Comment"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{item.likes_count || 0} likes</span>
                      <span>{item.comments_count || 0} comments</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredContent.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg">No content found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedType('all')
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showComments && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Comments - {selectedContent.title}</h2>
              <button
                onClick={() => {
                  setShowComments(false)
                  setSelectedContent(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <CommentThread contentId={selectedContent.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentHub
