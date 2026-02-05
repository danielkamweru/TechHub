# Moringa TechHub

A modern platform where students can get authentic and verified information/inspiration/advice about the tech space. Built with React, Redux Toolkit, Tailwind CSS, and FastAPI.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Team](#-team)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### User Roles
- **Admin**: Manage users, moderate content, create categories
- **Tech Writers**: Create and manage content, moderate discussions
- **Users**: Browse content, comment, maintain wishlist, get recommendations

### Core Functionality
- Multi-user authentication system with JWT
- Content creation and management (articles, videos, audio)
- Category-based content organization
- Comment system with threading (Reddit-style)
- Wishlist functionality
- Content recommendation system
- Real-time notifications
- Content moderation tools
- User profiles and avatars
- Content sharing capabilities
- Like/dislike functionality
- Search and filtering

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **Axios** - HTTP client
- **Vite** - Fast build tool
- **React Hot Toast** - Toast notifications
- **React Toastify** - Alternative notification system

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **Testing Library** - React testing utilities
- **PostCSS** - CSS processing

## 👥 Team

### Project Leadership
- **Daniel Kamweru** - **Group Leader & Backend Architect**
  - JWT authentication implementation
  - Core backend architecture (main.py)
  - Database design and connections
  - API routing and middleware
  - CORS configuration
  - Deployment configuration

### Backend Team
- **Zac** - **Backend Developer**
  - Comments system (comments.py)
  - Categories management (categories.py)
  - Notifications system (notifications.py)
  - User management endpoints
  - API endpoint development

- **Youngren** - **Backend Developer & Schema Architect**
  - Articles management (articles.py)
  - Database schemas design
  - Data models and relationships
  - API response structures
  - Content management system

### Frontend Team
- **James** - **Frontend Developer & UI/UX Lead**
  - Styling and design system
  - Component architecture
  - Responsive design
  - Frontend services integration
  - API service layer

- **Cecelia** - **Frontend Developer & Component Specialist**
  - Page components development
  - Reusable components
  - User interface implementation
  - Component library
  - Frontend routing

## 📁 Project Structure

```
TechHub/
├── README.md
├── .gitignore
├── requirements.txt
├── render.yaml
├── runtime.txt
├── uploads/                     # File uploads
│
├── backend/                     # FastAPI backend
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── Procfile                 # Heroku deployment
│   ├── pytest.ini              # Test configuration
│   ├── setup_postgres.sh       # Database setup
│   ├── app/                     # Main application
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── core/               # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py       # App configuration
│   │   │   ├── security.py     # Security utilities
│   │   │   └── dependencies.py # Dependency injection
│   │   ├── database/           # Database layer
│   │   │   ├── __init__.py
│   │   │   ├── connection.py   # Database connection
│   │   │   └── models.py       # SQLAlchemy models
│   │   ├── routes/             # API routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── users.py        # User management
│   │   │   ├── content.py      # Content CRUD
│   │   │   ├── comments.py     # Comment system
│   │   │   ├── categories.py   # Category management
│   │   │   ├── notifications.py # Notification system
│   │   │   ├── wishlist.py     # Wishlist functionality
│   │   │   └── admin_enhanced.py # Admin endpoints
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Auth schemas
│   │   │   ├── content.py      # Content schemas
│   │   │   ├── user.py         # User schemas
│   │   │   └── comment.py      # Comment schemas
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py # Authentication logic
│   │   │   ├── content_service.py # Content logic
│   │   │   └── user_service.py # User logic
│   │   ├── utils/              # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── helpers.py      # Helper functions
│   │   │   └── validators.py   # Custom validators
│   │   └── tests/              # Test files
│   │       ├── __init__.py
│   │       ├── test_auth.py    # Auth tests
│   │       └── test_content.py # Content tests
│   └── venv/                   # Python virtual environment
│
├── frontend/                   # React frontend
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── index.html             # HTML template
│   ├── public/                # Static assets
│   └── src/                   # Source code
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Main App component
│       ├── index.css          # Global styles
│       ├── app/               # Redux store
│       │   ├── index.js       # Store configuration
│       │   └── slices/        # Redux slices
│       │       ├── authSlice.js
│       │       ├── contentSlice.js
│       │       ├── commentsSlice.js
│       │       └── userSlice.js
│       ├── components/        # Reusable components
│       │   ├── common/        # Common UI components
│       │   │   ├── Header.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Loading.jsx
│       │   ├── forms/         # Form components
│       │   │   ├── LoginForm.jsx
│       │   │   ├── RegisterForm.jsx
│       │   │   └── CommentForm.jsx
│       │   ├── content/       # Content components
│       │   │   ├── ContentCard.jsx
│       │   │   ├── ContentList.jsx
│       │   │   └── ContentView.jsx
│       │   └── comments/      # Comment components
│       │       ├── CommentThread.jsx
│       │       ├── CommentItem.jsx
│       │       └── CommentForm.jsx
│       ├── pages/             # Page components
│       │   ├── Home.jsx       # Homepage
│       │   ├── Login.jsx      # Login page
│       │   ├── Register.jsx   # Registration page
│       │   ├── Dashboard.jsx  # User dashboard
│       │   ├── Profile.jsx    # User profile
│       │   ├── Content.jsx    # Content listing
│       │   ├── Article.jsx    # Article view
│       │   ├── Admin.jsx      # Admin dashboard
│       │   └── NotFound.jsx   # 404 page
│       ├── routes/            # React Router
│       │   └── index.jsx      # Route configuration
│       ├── services/          # API services
│       │   ├── api.js         # Axios configuration
│       │   ├── authService.js # Auth API calls
│       │   ├── contentService.js # Content API calls
│       │   └── userService.js # User API calls
│       ├── utils/             # Utility functions
│       │   ├── constants.js   # App constants
│       │   ├── helpers.js     # Helper functions
│       │   └── validators.js  # Form validators
│       └── features/          # Feature-based organization
│           ├── auth/          # Authentication features
│           ├── content/       # Content features
│           ├── comments/      # Comment features
│           └── user/          # User features
└── dist/                      # Build output
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd TechHub
```

2. **Set up Python environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Set up PostgreSQL database**
```bash
# Create database
createdb techhub

# Run setup script (optional)
chmod +x setup_postgres.sh
./setup_postgres.sh
```

5. **Start the backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. **Start the development server**
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Content Endpoints
- `GET /api/content` - Get all content
- `GET /api/content/{id}` - Get specific content
- `POST /api/content` - Create content (authenticated)
- `PUT /api/content/{id}` - Update content (authenticated)
- `DELETE /api/content/{id}` - Delete content (authenticated)

### Comment Endpoints
- `GET /api/comments/content/{content_id}` - Get comments for content
- `POST /api/comments` - Create comment (authenticated)
- `PUT /api/comments/{id}` - Update comment (authenticated)
- `DELETE /api/comments/{id}` - Delete comment (authenticated)

### User Endpoints
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update profile (authenticated)
- `GET /api/users/wishlist` - Get user wishlist (authenticated)
- `POST /api/users/wishlist/{content_id}` - Add to wishlist (authenticated)

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/techhub
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=TechHub
```

## 🗄 Database Schema

### Main Tables
- **users** - User accounts and profiles
- **content** - Articles, videos, and audio content
- **categories** - Content categories
- **comments** - Comment system with threading
- **notifications** - User notifications
- **wishlist** - User saved content
- **likes** - Content likes/dislikes

### Relationships
- Users can create multiple content items
- Content belongs to one category
- Comments can be nested (parent-child relationships)
- Users can like multiple content items
- Users can have multiple notifications

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
```bash
# Backend is configured for deployment with:
- Procfile for Heroku
- render.yaml for Render
- PostgreSQL database integration
- Static file serving for uploads
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
npm run build
# Upload dist/ folder to Netlify
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
- Authentication flow
- Content CRUD operations
- Comment system
- User management
- API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript/React
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For any questions or support, please contact the development team:

- **Daniel Kamweru** - Group Leader & Backend Architect
- **Project Repository**: [GitHub Link]

## 🙏 Acknowledgments

- Moringa School for the opportunity to build this platform
- The open-source community for the amazing tools and libraries
- All team members for their dedication and hard work

---

**Built with  by the TechHub Development Team**