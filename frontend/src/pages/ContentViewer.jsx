import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, X, Play, Headphones, BookOpen } from 'lucide-react'

const ContentViewer = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const content = location.state?.content

  if (!content) {
    navigate('/')
    return null
  }

  const backToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <button 
          onClick={backToHome}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Content
        </button>
        <h1 className="text-lg font-semibold truncate mx-4">{content.title}</h1>
        <button 
          onClick={backToHome}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content viewer */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        {content.content_type === 'video' && (
          <div className="w-full max-w-6xl mx-auto p-4">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={content.media_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
        
        {content.content_type === 'podcast' && (
          <div className="w-full max-w-4xl mx-auto p-4">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">{content.title}</h2>
              <p className="text-gray-300 mb-6">{content.content_text}</p>
              <a 
                href={content.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
              >
                <Headphones size={20} />
                Listen on Platform
              </a>
            </div>
          </div>
        )}
        
        {content.content_type === 'article' && (
          <div className="w-full max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{content.content_text}</p>
              <a 
                href={content.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <BookOpen size={20} />
                Read Full Article
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentViewer