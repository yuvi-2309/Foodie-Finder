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
  priceRange?: number; // 1-4 ($, $$, $$$, $$$$)
  averageRating?: number;
  totalReviews?: number;
  reviews?: Review[];
  created_at?: string;
  createdAt?: Date;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  username?: string;
  userAvatar?: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  images?: string[];
  visitDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  helpfulCount?: number;
}

export interface CreateReviewRequest {
  restaurant_id: string;
  rating: number;
  content: string;
}

