# API Integration Summary

## Overview
Successfully integrated the FoodieFinder backend API (https://foodiefinder-backend-8ybs.onrender.com) with the Angular frontend application. The integration covers authentication, restaurant management, reviews with photo uploads via Cloudinary, notifications, and personalized recommendations.

## Technology Stack
- **Frontend:** Angular 20, Angular Material, TypeScript, SCSS
- **Backend:** FastAPI, SQLAlchemy ORM, PostgreSQL (Neon)
- **Authentication:** JWT Bearer Tokens
- **Image Hosting:** Cloudinary (frontend direct upload)
- **Deployment:**
  - Frontend: Vercel — https://foodie-finder-7wx2.vercel.app
  - Backend: Render — https://foodiefinder-backend-8ybs.onrender.com
  - Database: Neon PostgreSQL

## Changes Made

### 1. Environment Configuration
- Created `src/environments/environment.ts` and `environment.prod.ts`
- Configured API base URL: `https://foodiefinder-backend-8ybs.onrender.com`
- Added Cloudinary configuration:
  - Cloud Name: `dv7jq9o72`
  - Upload Preset: `foodiefinder_upload`
  - Upload URL: `https://api.cloudinary.com/v1_1/dv7jq9o72/image/upload`

### 2. HTTP Client Setup
- Updated `src/app/app.config.ts` to include `provideHttpClient`
- Added functional HTTP interceptor for JWT token authentication

### 3. HTTP Interceptor
- Created `src/app/core/interceptors/auth.interceptor.ts`
- Automatically attaches JWT Bearer token to all API requests
- Reads token from localStorage

### 4. Model Updates
Updated models to match API schemas:

**User Model (`user.model.ts`):**
- Simplified `RegisterRequest` to only require `email` and `password`
- Changed `AuthResponse` to return `access_token` and `token_type`
- Made username and displayName optional in User interface

**Restaurant Model (`restaurant.model.ts`):**
- Added `location` field for API compatibility
- Made most fields optional to handle varying API responses
- Updated Review model with snake_case API field names (`restaurant_id`, `user_id`)
- Simplified `CreateReviewRequest` to match API schema
- Added `Notification` interface with `id`, `user_id`, `message`, `read`, `created_at`, `restaurant_id`

### 5. Service Refactoring

**AuthService (`auth.service.ts`):**
- Completely rewritten to use HTTP API calls
- `register()`: POST to `/auth/register`, then fetches user details
- `login()`: POST to `/auth/login`, then fetches user details
- `getCurrentUser()`: GET from `/auth/me` to retrieve authenticated user
- Automatic token verification on app initialization
- Error handling for all API calls

**RestaurantService (`restaurant.service.ts`):**
- Removed localStorage mock data
- `getRestaurants()`: GET from `/restaurants/`
- `getRestaurantById()`: GET from `/restaurants/:id`
- `getReviewsByRestaurantId()`: Extracts reviews from restaurant details
- `searchRestaurants()`: GET from `/restaurants/search?query=...`
- `getRecommendations()`: GET from `/restaurants/recommendations`
- `createRestaurant()`: POST to `/restaurants/`
- `createReview()`: POST to `/reviews/`
- `updateReview()`: PUT to `/reviews/:id`
- `deleteReview()`: DELETE to `/reviews/:id`
- Automatic rating calculation from reviews array

**NotificationService (`notification.service.ts`):**
- `loadNotifications()`: GET from `/notifications/`
- `markAsRead()`: PATCH to `/notifications/:id/read`
- `markAllAsRead()`: Marks all unread notifications as read
- `startPolling()`: Polls for new notifications every 30 seconds
- `stopPolling()`: Stops the notification polling interval
- `clearNotifications()`: Clears all local notification state
- Signal-based state: `notifications()`, `unreadCount()`

**CloudinaryService (`cloudinary.service.ts`):** *(NEW)*
- `uploadImage()`: Uploads image file directly to Cloudinary from frontend
- `validateFile()`: Validates file type (JPEG, PNG, GIF, WebP) and size (max 5MB)
- Signal-based state: `isUploading()`, `uploadProgress()`
- Returns `secure_url` from Cloudinary response

### 6. Component Updates

**Register Component:**
- Removed username and displayName fields from form
- Simplified to email and password only
- Updated validation accordingly

**Review Form Component:** *(UPDATED)*
- Replaced manual Photo URL text input with Cloudinary file upload
- File picker for selecting images from device
- Drag-and-drop style upload area
- Local preview shown immediately while uploading
- Upload progress indicator with indeterminate progress bar
- File validation (type and size) with error messages
- Uploaded `secure_url` sent to backend in `photo_url` field
- Success/error notifications via MatSnackBar

**Notification Bell Component:** *(UPDATED)*
- Auto-starts polling on initialization when authenticated
- Stops polling on component destroy
- Clicking a notification navigates to the associated restaurant
- Uses `inject()` for dependency injection
- Unread badge with count
- "Mark all read" functionality
- Relative time display ("5m ago", "2h ago", etc.)

**Restaurant Detail:**
- Photo gallery section showing review photos
- Photo lightbox for enlarged view
- Review photos displayed inline with reviews
- Fallback image for restaurants without imageUrl
- Handles optional review fields

**Restaurant List:**
- Added fallback for missing imageUrl with default placeholder
- Shows location when address is not available
- Conditional rendering for cuisine and description

**Navbar:**
- Notification bell integrated in navigation bar
- Shows only when user is authenticated
- Conditional rendering for optional displayName

### 7. Server-Side Rendering
- Updated `app.routes.server.ts` to use Client rendering for authenticated routes
- Login and register pages use Prerendering
- Restaurant routes use Client rendering to avoid pre-rendering issues

## API Endpoints Used

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user (requires Bearer token)

### Restaurants
- `GET /restaurants/` - List all restaurants
- `GET /restaurants/:id` - Get restaurant details with reviews
- `GET /restaurants/search?query=` - Search restaurants by name, location, or address
- `GET /restaurants/recommendations` - Get personalized recommendations (requires auth)
- `POST /restaurants/` - Create a new restaurant (requires auth)

### Reviews
- `POST /reviews/` - Create review with optional `photo_url` (requires auth)
- `PUT /reviews/:id` - Update review (requires auth)
- `DELETE /reviews/:id` - Delete review (requires auth)

### Notifications
- `GET /notifications/` - Get all notifications (requires auth)
- `PATCH /notifications/:id/read` - Mark notification as read (requires auth)

### Image Upload (Cloudinary - Frontend Direct)
- `POST https://api.cloudinary.com/v1_1/dv7jq9o72/image/upload` - Upload image
  - Payload: `file` (image file), `upload_preset` ("foodiefinder_upload")
  - Response: `{ secure_url: "https://res.cloudinary.com/..." }`

## Authentication Flow

1. User registers/logs in
2. Backend returns `access_token` and `token_type`
3. Token stored in localStorage as 'token'
4. Frontend fetches user details from `/auth/me`
5. User data stored in localStorage as 'user'
6. HTTP interceptor automatically adds Bearer token to all subsequent requests
7. On app initialization, existing token is verified with `/auth/me`

## Image Upload Flow (Cloudinary)

1. User selects an image file via the review form file picker
2. Frontend validates file type (JPEG/PNG/GIF/WebP) and size (max 5MB)
3. Local preview displayed immediately using FileReader
4. Frontend uploads image directly to Cloudinary: `POST https://api.cloudinary.com/v1_1/dv7jq9o72/image/upload`
5. Cloudinary returns `secure_url`
6. Frontend sends `secure_url` to backend in the `photo_url` field when creating a review
7. No backend file storage required — images served via Cloudinary CDN

## Notification Flow

1. When a user posts a review on a restaurant, all other users who previously reviewed that restaurant receive a notification
2. Notification bell component polls `/notifications/` every 30 seconds
3. Unread count displayed as a badge on the bell icon
4. Clicking a notification marks it as read and navigates to the restaurant
5. "Mark all read" button marks all notifications as read
6. Notifications cleared on logout

## Data Handling

### Restaurant Data
- API returns minimal data (id, name, location, created_at)
- Frontend gracefully handles missing fields (description, cuisine, imageUrl, etc.)
- Default placeholder images used when imageUrl is missing
- Location field used as fallback for address

### Review Data
- Reviews are nested within restaurant details
- Frontend calculates averageRating and totalReviews from reviews array
- All review fields except rating and content are optional
- Photo URLs from Cloudinary stored in `photo_url` field
- Date fields handled with null checks

### Notification Data
- Notifications contain message, read status, and optional restaurant_id
- Sorted by creation time (newest first)
- Relative time display (just now, minutes, hours, days)

## Error Handling
- All service methods include `catchError` operators
- User-friendly error messages displayed via MatSnackBar
- Failed authentication automatically triggers logout
- Console logging for debugging failed API calls
- File upload validation with specific error messages
- Graceful fallback for notification polling failures
