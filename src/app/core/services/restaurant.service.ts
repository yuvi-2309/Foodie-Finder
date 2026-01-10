import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { Restaurant, Review, CreateReviewRequest } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RestaurantService {
    private readonly apiUrl = environment.apiUrl;

    restaurants = signal<Restaurant[]>([]);
    reviews = signal<Review[]>([]);

    constructor(private http: HttpClient) {
        this.loadRestaurants();
    }

    private loadRestaurants(): void {
        this.getRestaurants().subscribe({
            next: (restaurants) => this.restaurants.set(restaurants),
            error: (error) => console.error('Failed to load restaurants:', error)
        });
    }

    getRestaurants(): Observable<Restaurant[]> {
        return this.http.get<any>(`${this.apiUrl}/restaurants/`).pipe(
            map(response => {
                console.log('Raw API response:', response);
                const restaurants = response.value || response || [];
                console.log('Extracted restaurants:', restaurants);
                return restaurants;
            }),
            map(restaurants => {
                // Calculate average rating and total reviews from reviews array
                const processedRestaurants = restaurants.map((restaurant: Restaurant) => ({
                    ...restaurant,
                    averageRating: this.calculateAverageRating(restaurant.reviews || []),
                    totalReviews: (restaurant.reviews || []).length
                }));
                console.log('Processed restaurants:', processedRestaurants);
                return processedRestaurants;
            }),
            tap(restaurants => {
                this.restaurants.set(restaurants);
            }),
            catchError(error => {
                console.error('Error fetching restaurants:', error);
                return throwError(() => new Error('Failed to load restaurants'));
            })
        );
    }

    getRestaurantById(id: string): Observable<Restaurant> {
        return this.http.get<Restaurant>(`${this.apiUrl}/restaurants/${id}`).pipe(
            tap(restaurant => {
                // Calculate average rating and total reviews
                const processedRestaurant = {
                    ...restaurant,
                    averageRating: this.calculateAverageRating(restaurant.reviews || []),
                    totalReviews: (restaurant.reviews || []).length
                };

                // Update restaurants signal
                const currentRestaurants = this.restaurants();
                const index = currentRestaurants.findIndex(r => r.id === id);
                if (index !== -1) {
                    const updated = [...currentRestaurants];
                    updated[index] = processedRestaurant;
                    this.restaurants.set(updated);
                }
            }),
            catchError(error => {
                console.error('Error fetching restaurant:', error);
                return throwError(() => new Error('Failed to load restaurant details'));
            })
        );
    }

    getReviewsByRestaurantId(restaurantId: string): Observable<Review[]> {
        // Reviews come with restaurant details in the API
        return this.getRestaurantById(restaurantId).pipe(
            map(restaurant => restaurant.reviews || []),
            tap(reviews => {
                this.reviews.set(reviews);
            }),
            catchError(error => {
                console.error('Error fetching reviews:', error);
                return throwError(() => new Error('Failed to load reviews'));
            })
        );
    }

    createReview(request: CreateReviewRequest): Observable<Review> {
        console.log('RestaurantService.createReview - request:', request);
        return this.http.post<Review>(`${this.apiUrl}/reviews/`, request).pipe(
            tap(review => {
                // Add new review to current reviews
                const currentReviews = this.reviews();
                this.reviews.set([...currentReviews, review]);

                // Refresh restaurant data to get updated ratings
                this.getRestaurantById(request.restaurant_id).subscribe();
            }),
            catchError(error => {
                console.error('Error creating review:', error);
                return throwError(() => new Error(error.error?.detail || 'Failed to create review'));
            })
        );
    }

    updateReview(reviewId: string, request: CreateReviewRequest): Observable<Review> {
        return this.http.put<Review>(`${this.apiUrl}/reviews/${reviewId}`, request).pipe(
            tap(() => {
                // Refresh restaurant data
                this.getRestaurantById(request.restaurant_id).subscribe();
            }),
            catchError(error => {
                console.error('Error updating review:', error);
                return throwError(() => new Error('Failed to update review'));
            })
        );
    }

    deleteReview(reviewId: string, restaurantId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`).pipe(
            tap(() => {
                // Remove review from current reviews
                const currentReviews = this.reviews();
                this.reviews.set(currentReviews.filter(r => r.id !== reviewId));

                // Refresh restaurant data
                this.getRestaurantById(restaurantId).subscribe();
            }),
            catchError(error => {
                console.error('Error deleting review:', error);
                return throwError(() => new Error('Failed to delete review'));
            })
        );
    }

    private calculateAverageRating(reviews: Review[]): number {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }
}
