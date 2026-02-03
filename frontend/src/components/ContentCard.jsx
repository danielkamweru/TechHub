import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Bookmark, Play, FileText, Headphones, Eye, Flag } from 'lucide-react'
import { toggleLike, flagContent } from '../features/content/contentSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'
import CategoryTag from './CategoryTag'

const ContentCard = ({ content, compact = false, onLike, onSaveToWishlist, showActions = true }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { userLikes } = useSelector((state) => state.content)
  
  // Get like status from persisted userLikes
  const userLike = userLikes.find(like => like.content_id === content.id)
  const isLiked = userLike?.is_like || false
  const likesCount = content.likes_count || 0
  
  const isInWishlist = wishlistItems.some(item => item.id === content.id)

  const handleLike = async () => {
    if (!user) return
    
    try {
      if (onLike) {
        onLike(content.id)
      } else {
        await dispatch(toggleLike(content.id)).unwrap()
      }
    } catch (error) {
      console.error('Failed to like content:', error)
    }
  }

  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/content/${content.id}`
    
    try {
      // Always copy to clipboard first
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
      
      // Try native share API if available (but don't wait for it)
      if (navigator.share) {
        try {
          await navigator.share({
            title: content.title,
            text: content.description || `Check out this ${content.content_type} on TechHub`,
            url
          })
        } catch (shareError) {
          // Share was cancelled or failed, but link is already copied
          console.log('Native share cancelled or failed:', shareError)
        }
      }
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        alert('Could not copy link. Please copy manually: ' + url)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleWishlist = () => {
    if (!user) return
    if (onSaveToWishlist) {
      onSaveToWishlist(content.id)
    } else {
      if (isInWishlist) {
        dispatch(removeFromWishlist(content.id))
      } else {
        dispatch(addToWishlist(content.id))
      }
    }
  }

  const handleFlag = async () => {
    if (!user) return
    
    try {
      await dispatch(flagContent(content.id)).unwrap()
    } catch (error) {
      console.error('Failed to flag content:', error)
    }
  }

  const getContentIcon = () => {
    switch (content.content_type) {
      case 'video': return <Play size={16} className="text-red-500" />
      case 'podcast': return <Headphones size={16} className="text-purple-500" />
      case 'article': return <FileText size={16} className="text-blue-500" />
      default: return <FileText size={16} className="text-gray-500" />
    }
  }

  const getThumbnail = () => {
    if (content.thumbnail_url) {
      return content.thumbnail_url
    }
    // Fallback thumbnail based on content type
    const typeImages = {
      video: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop&auto=format&q=80',
      podcast: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=225&fit=crop&auto=format&q=80',
      article: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=225&fit=crop&auto=format&q=80'
    }
    return typeImages[content.content_type] || typeImages.article
  }

  return (
    <div className={`card group hover:scale-[1.02] animate-fade-in ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex flex-col h-full">
        {/* Thumbnail */}
        {!compact && (
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
            <img
              src={getThumbnail()}
              alt={content.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop&auto=format&q=80'
              }}
            />
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full capitalize">
                {content.content_type}
              </span>
            </div>
            {content.category && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {content.category.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {getContentIcon()}
            <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs rounded-full capitalize">
              {content.content_type}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(content.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Link to={`/content/${content.id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {content.title}
            </h3>
          </Link>
          {!compact && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {content.content_text}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {content.views_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {content.comments_count || 0}
            </span>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-lg transition-colors ${
                  isInWishlist
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Bookmark size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
                {shareCopied && (
                  <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Link copied! Now share it
                  </span>
                )}
              </div>
              <button 
                onClick={() => window.location.href = `/content/${content.id}#comments`}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                title="Comments"
              >
                <MessageCircle size={16} />
              </button>
              <button 
                onClick={handleFlag}
                className={`p-2 rounded-lg transition-colors ${
                  content.is_flagged
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title={content.is_flagged ? 'Unflag' : 'Flag'}
              >
                <Flag size={16} fill={content.is_flagged ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContentCard