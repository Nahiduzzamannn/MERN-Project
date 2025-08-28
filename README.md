<<<<<<< HEAD
# MERN Stack Blog Platform

A full-stack blog application built with MongoDB, Express.js, React, and Node.js. This platform provides a complete blogging experience with user authentication, post management, file uploads, and a responsive user interface.

## 🚀 Features

### Frontend Features

- **Responsive Design**: Built with React and Tailwind CSS
- **User Authentication**: Login/Signup with JWT tokens
- **Post Management**: Create, read, update, and delete blog posts
- **Rich Text Editor**: Write and edit posts with a user-friendly editor
- **Post Details**: Individual post pages with slug-based routing
- **Private Routes**: Protected dashboard and editor pages
- **Image Uploads**: Support for uploading and displaying images
- **Navigation**: Intuitive navbar and footer components

### Backend Features

- **RESTful API**: Well-structured API endpoints
- **JWT Authentication**: Secure user authentication with cookies
- **File Upload**: Image upload functionality with Multer
- **Rate Limiting**: API rate limiting for security
- **Data Validation**: Input validation with express-validator
- **HTML Sanitization**: Secure content handling
- **CORS Support**: Cross-origin resource sharing configuration
- **Error Handling**: Centralized error handling middleware

## 🛠️ Tech Stack

### Frontend

- **React 19.1.1** - UI library
- **Vite 7.1.2** - Build tool and development server
- **React Router Dom 7.8.2** - Client-side routing
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Axios 1.11.0** - HTTP client for API calls

### Backend

- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 8.18.0** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer 2.0.2** - File upload middleware
- **Express Rate Limit** - Rate limiting middleware

## 📁 Project Structure

```
├── Backend/
│   ├── Controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── uploadController.js
│   ├── DB/
│   │   └── connection.js     # Database connection
│   ├── Middleware/           # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── Models/               # Database models
│   │   ├── Post.js
│   │   └── User.js
│   ├── Routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── postRouters.js
│   │   └── uploadRoutes.js
│   ├── scripts/              # Utility scripts
│   │   ├── build-indexes.js
│   │   └── seed.js
│   ├── uploads/              # Uploaded files
│   ├── index.js              # Server entry point
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/          # React context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── AuthContextBase.js
│   │   │   └── useAuth.js
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useCachedResource.js
│   │   │   └── useDebouncedValue.js
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Post.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd My_Project
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   ```

### Environment Variables

Create a `.env` file in the Backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/blog_db
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blog_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_ORIGIN=http://localhost:5173
```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd Backend
   npm run dev
   ```

   Server will run on `http://localhost:3000`

2. **Start the Frontend Development Server**

   ```bash
   cd Frontend
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

3. **Seed the Database (Optional)**

   ```bash
   cd Backend
   npm run seed
   ```

4. **Build Indexes (Optional)**
   ```bash
   cd Backend
   npm run build-indexes
   ```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### File Upload

- `POST /api/upload` - Upload files (protected)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- Tokens are stored in HTTP-only cookies
- Protected routes require valid authentication
- Rate limiting is applied to authentication endpoints

## 🎨 Frontend Routes

- `/` - Login page (root)
- `/home` - Home feed
- `/posts` - Posts listing page
- `/post/:slug` - Individual post detail
- `/login` - Login page
- `/signup` - Registration page
- `/dashboard` - User dashboard (protected)
- `/editor` - Post editor (protected)
- `/editor/:id` - Edit existing post (protected)

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- HTML sanitization
- Input validation
- CORS configuration
- Protected routes

## 🚀 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Build the application: `npm start`
3. Ensure MongoDB connection is configured

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Scripts

### Backend Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm run build-indexes` - Build database indexes

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**MD. Nahiduzzaman**

---

⭐ If you found this project helpful, please give it a star!
=======
# Mern Stack Blog Project.
>>>>>>> eacad44376a9c6615c799de4ef84c175e98557b3
