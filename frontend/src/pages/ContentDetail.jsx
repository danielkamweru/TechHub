import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Play, Headphones, BookOpen, Heart, Bookmark, Share2, MessageCircle, 
  ArrowLeft, User, ThumbsDown, Eye, Calendar
} from 'lucide-react'
import { fetchContentById, likeContent } from '../features/content/contentSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'
import CommentThread from '../components/CommentThread'
import api from '../services/api'

const ContentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentContent, loading } = useSelector((state) => state.content)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchContentById(id))
      fetchComments()
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentContent) {
      setIsInWishlist(wishlistItems.some(item => item.id === currentContent.id))
    }
  }, [currentContent, wishlistItems])

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/content/${id}`)
      setComments(response.data || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return
    
    try {
      const response = await api.post('/comments', {
        content_id: parseInt(id),
        content_text: newComment,
        parent_id: replyTo || null
      })
      setComments([...comments, response.data])
      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleLike = async (isLike = true) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    try {
      await dispatch(likeContent({ contentId: parseInt(id), isLike })).unwrap()
      setIsLiked(isLike)
      setIsDisliked(!isLike)
    } catch (error) {
      console.error('Failed to like/dislike:', error)
    }
  }

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(currentContent.id))
    } else {
      dispatch(addToWishlist(currentContent.id))
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentContent.title,
        text: currentContent.content_text,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Render content based on type
  const renderContent = () => {
    if (!currentContent) return null

    switch (currentContent.content_type) {
      case 'video':
        const videoId = getYouTubeVideoId(currentContent.media_url)
        if (videoId) {
          return (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={currentContent.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )
        }
        return (
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <p>Video URL format not supported for embedding</p>
          </div>
        )

      case 'podcast':
        // For podcasts, show an embedded player or link
        return (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg p-8 text-white">
            <div className="flex items-center justify-center mb-6">
              <Headphones size={64} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">{currentContent.title}</h3>
              <p className="mb-6 opacity-90">{currentContent.content_text}</p>
              <a
                href={currentContent.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Headphones size={20} />
                Listen on Source
              </a>
            </div>
          </div>
        )

      case 'article':
        return (
          <div className="bg-white rounded-lg p-8 prose max-w-none">
            <div className="mb-6">
              {currentContent.thumbnail_url && (
                <img
                  src={currentContent.thumbnail_url}
                  alt={currentContent.title}
                  className="w-full rounded-lg mb-6"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop&auto=format&q=80'
                  }}
                />
              )}
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {currentContent.content_text || 'No content available.'}
            </div>
            {currentContent.media_url && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <a
                  href={currentContent.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <BookOpen size={20} />
                  Read Full Article
                </a>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">Content type not supported</p>
          </div>
        )
    }
  }

  if (loading || !currentContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Content Hub
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Content Player/Viewer */}
          <div className="bg-gray-900">
            {renderContent()}
          </div>

          {/* Content Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentContent.content_type === 'video' ? 'bg-red-100 text-red-800' :
                    currentContent.content_type === 'podcast' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {currentContent.content_type?.toUpperCase()}
                  </span>
                  {currentContent.category && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                      {currentContent.category.name}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{currentContent.title}</h1>
                <p className="text-gray-700 text-lg mb-4">{currentContent.content_text}</p>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {currentContent.views_count || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={16} />
                  {currentContent.likes_count || 0} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  {comments.length} comments
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(currentContent.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Like */}
                <button
                  onClick={() => handleLike(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Like"
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                
                {/* Dislike */}
                <button
                  onClick={() => handleLike(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDisliked
                      ? 'text-gray-600 bg-gray-100'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown size={20} fill={isDisliked ? 'currentColor' : 'none'} />
                </button>
                
                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className={`p-2 rounded-lg transition-colors ${
                    isInWishlist
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Add to Wishlist"
                >
                  <Bookmark size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>
                
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Author Info */}
            {currentContent.author && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {currentContent.author.full_name?.charAt(0) || currentContent.author.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentContent.author.full_name || currentContent.author.username}</p>
                  <p className="text-sm text-gray-500">{currentContent.author.role?.replace('_', ' ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle size={24} />
            Comments ({comments.length})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="mb-8">
              {replyTo && (
                <div className="mb-2 p-2 bg-blue-50 rounded-lg text-sm text-gray-700">
                  Replying to comment... 
                  <button 
                    type="button" 
                    onClick={() => setReplyTo(null)} 
                    className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={!newComment.trim()} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Please log in to comment</p>
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Log In
              </Link>
            </div>
          )}

          <CommentThread contentId={id} />
        </div>
      </div>
    </div>
  )
}

export default ContentDetail
