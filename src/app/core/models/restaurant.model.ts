export interface Restaurant {
  id: string;
  name: string;
  location?: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  priceRange?: number;
  averageRating?: number;
  totalReviews?: number;
  reviews?: Review[];
  created_at?: string;
  createdAt?: Date;
}

export interface RestaurantSearchResponse {
  id: string;
  name: string;
  location: string;
  address: string | null;
  average_rating: number | null;
  review_count: number;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  username?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  photo_url?: string | null;
  images?: string[];
  visitDate?: Date;
  createdAt?: Date;
  created_at?: string;
  updatedAt?: Date;
  helpfulCount?: number;
}

export interface CreateReviewRequest {
  restaurant_id: string;
  rating: number;
  content: string;
  photo_url?: string | null;
}

export interface CreateRestaurantRequest {
  name: string;
  location: string;
  address?: string;
}

export interface SearchParams {
  query?: string;
  min_rating?: number;
  sort_by?: 'rating' | 'name';
  order?: 'asc' | 'desc';
}

export interface RestaurantDetailResponse {
  restaurant: Restaurant;
  average_rating: number | null;
  reviews: Review[];
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type?: string;
  read: boolean;
  created_at?: string;
  restaurant_id?: string;
}

