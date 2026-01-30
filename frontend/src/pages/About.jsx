import React from 'react'
import { Link } from 'react-router-dom'
import { Users, BookOpen, Video, Headphones, Star, Shield, Zap, Heart } from 'lucide-react'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Moringa TechHub</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Your gateway to authentic tech knowledge and professional growth
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Moringa TechHub connects aspiring tech professionals with industry expertise through curated, 
            high-quality content from experienced professionals, fostering continuous learning and growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Video Content</h3>
            <p className="text-gray-600 text-sm">Watch tutorials and tech talks from industry experts</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Headphones className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Podcasts</h3>
            <p className="text-gray-600 text-sm">Listen to discussions with tech leaders</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Articles</h3>
            <p className="text-gray-600 text-sm">Read guides on latest tech trends</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community</h3>
            <p className="text-gray-600 text-sm">Connect with peers and mentors</p>
          </div>
        </div>

        {/* How to Use Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Use TechHub</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Students */}
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                <Star className="h-6 w-6 mr-2" />
                For Students
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                  <div>
                    <h4 className="font-medium">Create Account</h4>
                    <p className="text-gray-600 text-sm">Sign up to access curated content</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                  <div>
                    <h4 className="font-medium">Explore Content</h4>
                    <p className="text-gray-600 text-sm">Browse videos, podcasts, and articles</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                  <div>
                    <h4 className="font-medium">Save & Organize</h4>
                    <p className="text-gray-600 text-sm">Add content to wishlist</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Tech Writers */}
            <div>
              <h3 className="text-xl font-semibold text-purple-600 mb-4 flex items-center">
                <Zap className="h-6 w-6 mr-2" />
                For Tech Writers
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</div>
                  <div>
                    <h4 className="font-medium">Apply as Writer</h4>
                    <p className="text-gray-600 text-sm">Get verified by admin team</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</div>
                  <div>
                    <h4 className="font-medium">Create Content</h4>
                    <p className="text-gray-600 text-sm">Use Studio to publish content</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</div>
                  <div>
                    <h4 className="font-medium">Engage Community</h4>
                    <p className="text-gray-600 text-sm">Moderate and interact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Tech Journey?</h2>
          <p className="text-gray-600 mb-6">Join our growing community</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/explore" 
              className="px-8 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Explore Content
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About