# FoodieFinder - Restaurant Review Application

A modern, community-driven Angular application for restaurant reviews and ratings built with Angular 20 and Angular Material, integrated with a real backend API.

## Sprint 1 Features (COMPLETED ✅)

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

## API Integration (COMPLETED ✅)

The application is now fully integrated with the backend API at:
**https://foodiefinder-backend-8ybs.onrender.com**

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login  
- `GET /auth/me` - Get authenticated user details

### Restaurant Endpoints
- `GET /restaurants/` - List all restaurants
- `GET /restaurants/:id` - Get restaurant details with reviews

### Review Endpoints
- `POST /reviews/` - Create review (requires authentication)
- `PUT /reviews/:id` - Update review (requires authentication)
- `DELETE /reviews/:id` - Delete review (requires authentication)

For detailed API integration information, see [API_INTEGRATION.md](./API_INTEGRATION.md)

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
1. Click "Sign Up" and create an account (connects to real backend)
2. Browse restaurants on the home page (loaded from API)
3. Click any restaurant to view details
4. Click "Write a Review" to post a review (saved to backend)

5. Rate and review restaurants

## Technologies

- Angular 20.3 with standalone components
- Angular Material (Azure Blue theme)
- TypeScript & SCSS
- RxJS & Angular Signals
- Reactive Forms

## Project Structure
```
src/app/
├── core/
│   ├── guards/        # Auth guards
│   ├── models/        # Data models
│   └── services/      # Business logic
├── auth/              # Login/Register
├── pages/             # Restaurant pages
└── shared/
    └── components/    # Navbar, ReviewForm
```

## Features

✅ User registration with validation
✅ Secure login/logout
✅ Restaurant listing with ratings
✅ Detailed restaurant pages
✅ Interactive review posting
✅ 5-star rating system
✅ Responsive design
✅ LocalStorage persistence

## Sprint 2 (Upcoming)
- Search and filter restaurants
- Photo uploads
- Recommendation engine
- User profiles
- Favorite restaurants
