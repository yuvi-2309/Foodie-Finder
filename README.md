# FoodieFinder - Restaurant Review Application

A modern, community-driven Angular application for restaurant reviews and ratings built with Angular 20 and Angular Material, integrated with a FastAPI backend, Cloudinary image hosting, and real-time notifications.

## Live Demo

- **Frontend:** https://foodie-finder-7wx2.vercel.app
- **Backend API:** https://foodiefinder-backend-8ybs.onrender.com

## Sprint 1 Features (COMPLETED)

### 1. User Registration & Authentication
- Complete registration and login system with backend API
- JWT token-based authentication
- Form validation with error handling
- Session persistence using localStorage
- Route guards for protected pages
- Responsive auth pages with gradient backgrounds
- Automatic token refresh on app initialization

### 2. Review Posting System
- Interactive 5-star rating system
- Rich text review forms
- Real-time review submission to backend API
- Review display with user information
- Review management (create, update, delete)

### 3. Rating System
- Visual star displays on restaurant cards
- Average rating calculation from reviews
- Total review count
- Automatic updates when reviews are posted

### 4. Restaurant Browsing
- Grid layout of restaurant cards
- Restaurant details pages from backend API
- Location information
- Contact information
- Real-time data from FoodieFinder backend

## Sprint 2 Features (COMPLETED)

### 5. Cloudinary Image Upload
- Direct image upload from frontend to Cloudinary CDN
- File picker with upload area UI
- File validation (JPEG, PNG, GIF, WebP; max 5MB)
- Local preview displayed immediately during upload
- Progress indicator during upload
- Uploaded image URL stored with review in backend
- Photo gallery on restaurant detail pages
- Photo lightbox for enlarged view
- No backend file storage required

### 6. Notification System
- Real-time notification polling (every 30 seconds)
- Notification bell icon with unread count badge
- Notification dropdown with message and timestamp
- Mark individual or all notifications as read
- Click notification to navigate to restaurant
- Relative time display ("5m ago", "2h ago")
- Automatic notifications when a restaurant you reviewed gets a new review

### 7. Search & Filter
- Search restaurants by name, location, or address
- Sort results by rating or name
- Filter by minimum rating
- Real-time search results

### 8. Recommendation Engine
- Personalized restaurant recommendations
- Dedicated "For You" page
- Requires authentication

### 9. Restaurant Creation
- Authenticated users can add new restaurants
- Form with name, location, and address fields

## API Integration (COMPLETED)

The application is fully integrated with the backend API at:
**https://foodiefinder-backend-8ybs.onrender.com**

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get authenticated user details

### Restaurant Endpoints
- `GET /restaurants/` - List all restaurants
- `GET /restaurants/:id` - Get restaurant details with reviews
- `GET /restaurants/search?query=` - Search restaurants
- `GET /restaurants/recommendations` - Personalized recommendations
- `POST /restaurants/` - Create restaurant (requires auth)

### Review Endpoints
- `POST /reviews/` - Create review with optional photo_url (requires auth)
- `PUT /reviews/:id` - Update review (requires auth)
- `DELETE /reviews/:id` - Delete review (requires auth)

### Notification Endpoints
- `GET /notifications/` - Get all notifications (requires auth)
- `PATCH /notifications/:id/read` - Mark notification as read (requires auth)

### Image Upload (Cloudinary - Frontend Direct)
- `POST https://api.cloudinary.com/v1_1/dv7jq9o72/image/upload`
- Payload: `file` (image), `upload_preset` ("foodiefinder_upload")
- Returns: `secure_url` for CDN-hosted image

For detailed API integration information, see [API_INTEGRATION.md](./API_INTEGRATION.md)
For Sprint 2 details, see [SPRINT2_SUMMARY.md](./SPRINT2_SUMMARY.md)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 20+

### Start Development Server
```bash
npm install
npm start
# or
ng serve --ssl=false
```

Navigate to http://localhost:4200/

### First Time Usage
1. Click "Sign Up" and create an account
2. Browse restaurants on the home page
3. Click any restaurant to view details
4. Click "Write a Review" to post a review
5. Upload a photo with your review via the file picker
6. Check the notification bell for updates when others review the same restaurant
7. Visit "For You" for personalized recommendations

## Technologies

- Angular 20 with standalone components
- Angular Material (Azure Blue theme)
- TypeScript & SCSS
- RxJS & Angular Signals
- Reactive Forms
- Cloudinary (Image CDN)
- JWT Authentication

## Deployment

- **Frontend:** Deployed on [Vercel](https://vercel.com) — https://foodie-finder-7wx2.vercel.app
- **Backend:** Deployed on [Render](https://render.com) — https://foodiefinder-backend-8ybs.onrender.com
- **Database:** Neon PostgreSQL
- **Image CDN:** Cloudinary

## Project Structure
```
src/app/
├── core/
│   ├── guards/        # Auth guards
│   ├── interceptors/  # HTTP interceptors (JWT)
│   ├── models/        # Data models (User, Restaurant, Review, Notification)
│   └── services/      # Business logic (Auth, Restaurant, Notification, Cloudinary)
├── auth/              # Login/Register
├── pages/             # Restaurant pages (list, detail, create, recommendations)
└── shared/
    └── components/    # Navbar, ReviewForm, NotificationBell
```

## Features

- User registration with validation
- Secure login/logout with JWT
- Restaurant listing with ratings
- Detailed restaurant pages
- Interactive review posting
- 5-star rating system
- Cloudinary image upload in reviews
- Photo gallery and lightbox
- Notification bell with polling
- Restaurant search and filter
- Personalized recommendations
- Restaurant creation
- Responsive design
- LocalStorage persistence
