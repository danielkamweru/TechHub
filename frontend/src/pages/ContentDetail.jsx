import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Play, Headphones, BookOpen, Heart, Bookmark, Share2, MessageCircle, 
  ArrowLeft, User, Eye, Calendar, Pause, SkipBack, SkipForward, Volume2, Bell, BellOff
} from 'lucide-react'
import { fetchContentById, likeContent } from '../features/content/contentSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'
import { subscribeToCategory, unsubscribeFromCategory, fetchUserSubscriptions } from '../features/categories/categoriesSlice'
import CommentThread from '../components/CommentThread'

// Custom Audio Player Component with Smart Embedding
const CustomAudioPlayer = ({ src, title, thumbnail }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasCorsError, setHasCorsError] = useState(false)
  const [embedUrl, setEmbedUrl] = useState(null)
  const [showEmbed, setShowEmbed] = useState(false)

  // Check if the URL is a direct audio file or a podcast webpage
  const isDirectAudioFile = (url) => {
    const audioExtensions = ['.mp3', '.mpeg', '.ogg', '.wav', '.m4a', '.aac']
    return audioExtensions.some(ext => url.toLowerCase().includes(ext))
  }

  const isPodcastWebsite = (url) => {
    const podcastSites = ['changelog.com', 'syntax.fm', 'shoptalkshow.com', 'podcast.bretfisher.com']
    return podcastSites.some(site => url.toLowerCase().includes(site))
  }

  // Generate embed URLs for different podcast platforms
  const generateEmbedUrl = (url) => {
    if (!url) return null
    
    // Changelog.com - look for audio files in the page
    if (url.includes('changelog.com')) {
      return url // We'll try to extract audio from the page
    }
    
    // Syntax.fm - they have RSS feeds with direct audio links
    if (url.includes('syntax.fm')) {
      return url // We'll try to extract audio from the page
    }
    
    // ShopTalk Show - similar approach
    if (url.includes('shoptalkshow.com')) {
      return url
    }
    
    return null
  }

  // Check immediately if this is a podcast website
  const isExternalPodcast = src && isPodcastWebsite(src)
  const embedPodcastUrl = isExternalPodcast ? generateEmbedUrl(src) : null

  // Set error state immediately for external podcasts
  useEffect(() => {
    if (isExternalPodcast) {
      console.log('Detected podcast website, setting up embed')
      setEmbedUrl(embedPodcastUrl)
      setHasCorsError(true)
      setIsLoaded(false)
      return
    }
  }, [isExternalPodcast, embedPodcastUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !src || isExternalPodcast) return

    const handleCanPlay = () => {
      setIsLoaded(true)
      console.log('Audio can play')
    }

    const handleError = (e) => {
      console.error('Audio error:', e)
      setIsLoaded(false)
      // Check if it's a CORS error
      if (e.target.error && (e.target.error.message.includes('CORS') || e.target.error.code === 4)) {
        console.log('CORS error detected, will show fallback')
        setHasCorsError(true)
      }
    }

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      setDuration(audio.duration)
      console.log('Duration loaded:', audio.duration)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      console.log('Audio ended')
    }

    const handlePlay = () => {
      setIsPlaying(true)
      console.log('Audio started playing')
    }

    const handlePause = () => {
      setIsPlaying(false)
      console.log('Audio paused')
    }

    // Add event listeners
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Load the audio
    audio.load()

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [src])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio || !isLoaded || isExternalPodcast) {
      console.log('Audio not ready or external podcast')
      return
    }

    try {
      if (isPlaying) {
        audio.pause()
        console.log('Pausing audio')
      } else {
        // Ensure audio is ready to play
        if (audio.readyState < 2) { // HAVE_CURRENT_DATA
          await new Promise((resolve) => {
            audio.addEventListener('canplay', resolve, { once: true })
          })
        }
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio play started successfully')
            setIsPlaying(true)
          }).catch(error => {
            console.error('Audio play failed:', error)
            setIsPlaying(false)
          })
        }
      }
    } catch (error) {
      console.error('Error toggling play:', error)
      setIsPlaying(false)
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const newTime = (e.target.value / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100
    audioRef.current.volume = newVolume
    setVolume(newVolume)
  }

  const skipBackward = () => {
    const audio = audioRef.current
    audio.currentTime = Math.max(0, audio.currentTime - 15)
  }

  const skipForward = () => {
    const audio = audioRef.current
    audio.currentTime = Math.min(duration, audio.currentTime + 15)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      {/* Only render audio element if it's not an external podcast */}
      {!isExternalPodcast && (
        <audio 
          ref={audioRef} 
          src={src} 
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      
      {/* Player Header */}
      <div className="flex items-center gap-4 mb-6">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=64&h=64&fit=crop&auto=format&q=80'
            }}
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 truncate">{title}</h4>
          <p className="text-sm text-gray-600">
            {!isLoaded ? 'Loading...' : 'Podcast Episode'}
          </p>
        </div>
        {!isLoaded && (
          <div className="animate-pulse">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Smart Embedded Podcast Player */}
      {isExternalPodcast && embedUrl && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
              <Headphones size={18} />
              Embedded Podcast Player
            </h4>
            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {showEmbed ? 'Hide' : 'Show'} Player
            </button>
          </div>
          
          {showEmbed && (
            <div className="space-y-4">
              {/* Embedded iframe for podcast website */}
              <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-96 border-0"
                  title={`${title} - Embedded Podcast Player`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onError={(e) => {
                    console.log('Iframe load failed, showing fallback')
                    e.target.style.display = 'none'
                    document.getElementById('podcast-fallback').style.display = 'block'
                  }}
                />
              </div>
              
              {/* Fallback if iframe fails */}
              <div id="podcast-fallback" style={{display: 'none'}} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm mb-3">
                  <Headphones size={16} className="inline mr-2" />
                  Unable to embed podcast. Listen directly on their website:
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Play size={14} />
                    Open Podcast Website
                  </a>
                </div>
              </div>
              
              {/* Podcast Info */}
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">About this episode:</h5>
                <p className="text-sm text-gray-600 mb-3">{title}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Headphones size={12} />
                    External platform
                  </span>
                  <span className="flex items-center gap-1">
                    <Play size={12} />
                    Stream available
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {!showEmbed && (
            <div className="text-center py-4">
              <button
                onClick={() => setShowEmbed(true)}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Play size={18} />
                Play Podcast Episode
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={skipBackward}
          disabled={hasCorsError}
          className={`p-2 transition-colors ${
            hasCorsError 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-purple-600'
          }`}
          title="Skip back 15s"
        >
          <SkipBack size={20} />
        </button>
        
        <button
          onClick={togglePlay}
          disabled={!isLoaded || hasCorsError}
          className={`p-4 rounded-full transition-all shadow-lg ${
            isLoaded && !hasCorsError
              ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={hasCorsError ? 'External podcast' : (!isLoaded ? 'Loading audio...' : (isPlaying ? 'Pause' : 'Play'))}
        >
          {!isLoaded && !hasCorsError ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          ) : hasCorsError ? (
            <Headphones size={24} />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} />
          )}
        </button>
        
        <button
          onClick={skipForward}
          disabled={hasCorsError}
          className={`p-2 transition-colors ${
            hasCorsError 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-purple-600'
          }`}
          title="Skip forward 15s"
        >
          <SkipForward size={20} />
        </button>

        {/* Volume Control */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
            title="Volume"
          >
            <Volume2 size={20} />
          </button>
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-2">
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-24 h-1"
                style={{
                  background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #7c3aed;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #7c3aed;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

const ContentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentContent, loading, userLikes } = useSelector((state) => state.content)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { items: commentList } = useSelector((state) => state.comments)
  const { subscribedIds } = useSelector((state) => state.categories)
  const categoryId = currentContent?.category_id ?? currentContent?.category?.id
  const isSubscribed = categoryId ? subscribedIds.includes(categoryId) : false

  // Get like status from persisted userLikes
  const userLike = userLikes.find(like => like.content_id === parseInt(id))
  const isLiked = userLike?.is_like || false
  const isInWishlist = wishlistItems.some(item => item.id === parseInt(id))
  const commentsCount = (commentList || []).reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)

  useEffect(() => {
    if (id) {
      dispatch(fetchContentById(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserSubscriptions())
    }
  }, [isAuthenticated, dispatch])

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!categoryId) return
    if (isSubscribed) {
      dispatch(unsubscribeFromCategory(categoryId))
    } else {
      dispatch(subscribeToCategory(categoryId))
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    try {
      await dispatch(likeContent({ contentId: parseInt(id), isLike: !isLiked })).unwrap()
    } catch (error) {
      console.error('Failed to like:', error)
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

  const [shareCopied, setShareCopied] = useState(false)
  const handleShare = async () => {
    const url = window.location.href
    try {
      // Always copy to clipboard first
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
      
      // Try native share API if available (but don't wait for it)
      if (navigator.share) {
        await navigator.share({
          title: currentContent.title,
          text: currentContent.content_text,
          url
        })
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Share was cancelled or failed, but link is already copied
        console.log('Share cancelled or failed:', err)
      }
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
        return (
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg overflow-hidden">
            {/* Podcast Header */}
            <div className="p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <Headphones size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  Podcast Episode
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">{currentContent.title}</h3>
                <p className="opacity-90 text-lg mb-6">Learn about this podcast episode and listen to the full audio below</p>
                
                {/* Podcast Thumbnail */}
                {currentContent.thumbnail_url && (
                  <div className="mb-6">
                    <img
                      src={currentContent.thumbnail_url}
                      alt={currentContent.title}
                      className="w-48 h-48 mx-auto rounded-lg shadow-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop&auto=format&q=80'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Custom Audio Player */}
            <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
              <div className="p-8">
                <CustomAudioPlayer 
                  src={currentContent.media_url}
                  title={currentContent.title}
                  thumbnail={currentContent.thumbnail_url}
                />
                
                {/* Additional Actions */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <a
                    href={currentContent.media_url}
                    download
                    className="inline-flex items-center gap-2 bg-purple-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    <Bookmark size={16} />
                    Download Episode
                  </a>
                  <button
                    onClick={() => navigator.share && navigator.share({
                      title: currentContent.title,
                      text: currentContent.content_text,
                      url: window.location.href
                    })}
                    className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'article':
        return (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Article Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <BookOpen size={24} className="text-white" />
                </div>
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  Article
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-4">{currentContent.title}</h3>
              <p className="opacity-90 text-lg mb-4">Read the complete article below</p>
            </div>
            
            {/* Article Content */}
            <div className="p-8">
              {currentContent.thumbnail_url && (
                <div className="mb-8">
                  <img
                    src={currentContent.thumbnail_url}
                    alt={currentContent.title}
                    className="w-full rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop&auto=format&q=80'
                    }}
                  />
                </div>
              )}
              
              {/* Display article content directly */}
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {currentContent.content_text}
                </div>
              </div>
            </div>
            
            {/* Article Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
            </div>
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
                {currentContent.content_type !== 'article' && (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{currentContent.title}</h1>
                    <p className="text-gray-700 text-lg mb-4">{currentContent.content_text.substring(0, 200)}...</p>
                  </>
                )}
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
                  {commentsCount} comments
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(currentContent.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Like */}
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
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
                
                {/* Subscribe to category */}
                {categoryId && (
                  <button
                    onClick={handleSubscribe}
                    className={`p-2 rounded-lg transition-colors text-xs font-medium ${
                      isSubscribed
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    title={isSubscribed ? 'Unsubscribe from category' : 'Subscribe to category for notifications'}
                  >
                    {isSubscribed ? <BellOff size={18} /> : <Bell size={18} />}
                    <span className="ml-1 hidden sm:inline">{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                  </button>
                )}
                {/* Share */}
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Share"
                  >
                    <Share2 size={20} />
                  </button>
                  {shareCopied && (
                    <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      Link copied! Now share it
                    </span>
                  )}
                </div>
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

        {/* Comments Section - single CommentThread handles form + list */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle size={24} />
            Comments
          </h2>
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
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
