import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Moringa TechHub</h3>
            <p className="text-gray-300">
              Your go-to platform for authentic tech content from the Moringa community.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/explore" className="hover:text-white transition-colors">Explore</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/explore?category=Full-Stack" className="hover:text-white transition-colors">Full Stack</Link></li>
              <li><Link to="/explore?category=Front-End" className="hover:text-white transition-colors">Frontend</Link></li>
              <li><Link to="/explore?category=DevOps" className="hover:text-white transition-colors">DevOps</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2026 Moringa TechHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer