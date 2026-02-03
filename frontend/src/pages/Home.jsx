import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const Home = () => {

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-yellow-300 animate-pulse-slow" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Moringa TechHub</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Discover authentic tech content, connect with industry experts, and accelerate your journey in technology
          </p>
          
          {/* AWS Video */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm p-1">
              <div className="relative rounded-xl overflow-hidden">
                <iframe
                  className="w-full h-64 md:h-96 rounded-xl"
                  src="https://www.youtube.com/embed/VIEiR-mia0c?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
                  title="AWS Full Course for Beginners - Tech Learning"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none rounded-xl" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Create Account CTA */}
          <div className="mb-8">
            <Link 
              to="/register" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
            >
              <Sparkles className="mr-3" size={24} />
              Create Your Free Account
            </Link>
            <p className="mt-4 text-white/80 text-sm">
              Join thousands of tech enthusiasts sharing knowledge
            </p>
          </div>
        </div>
      </div>

      {/* Full Stack Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Full Stack Development Guide</h2>
            <p className="text-gray-600 text-lg">A comprehensive roadmap to become a full-stack developer</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm p-1">
              <div className="relative rounded-xl overflow-hidden">
                <iframe
                  className="w-full h-64 md:h-96 rounded-xl"
                  src="https://www.youtube.com/embed/Q33KBiDriJY?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
                  title="Full Stack Web Development Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none rounded-xl" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home