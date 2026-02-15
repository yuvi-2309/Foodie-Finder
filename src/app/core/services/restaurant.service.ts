import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { Restaurant, Review, CreateReviewRequest, CreateRestaurantRequest, RestaurantSearchResponse, RestaurantDetailResponse, SearchParams } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RestaurantService {
    private readonly apiUrl = environment.apiUrl;

    restaurants = signal<Restaurant[]>([]);
    reviews = signal<Review[]>([]);
    searchResults = signal<RestaurantSearchResponse[]>([]);

    constructor(private http: HttpClient) {
        this.loadRestaurants();
    }

    private loadRestaurants(): void {
        this.getAllRestaurants().subscribe({
            next: (results) => this.searchResults.set(results),
            error: (error) => console.error('Failed to load restaurants:', error)
        });
    }

    getAllRestaurants(): Observable<RestaurantSearchResponse[]> {
        return this.http.get<RestaurantSearchResponse[]>(`${this.apiUrl}/restaurants/search`).pipe(
            tap(results => this.searchResults.set(results)),
            catchError(error => {
                console.error('Error fetching restaurants:', error);
                return throwError(() => new Error('Failed to load restaurants'));
            })
        );
    }

    getRestaurants(): Observable<Restaurant[]> {
        return this.http.get<any>(`${this.apiUrl}/restaurants/`).pipe(
            map(response => {
                const restaurants = response.value || response || [];
                return restaurants;
            }),
            map(restaurants => {
                return restaurants.map((restaurant: Restaurant) => ({
                    ...restaurant,
                    averageRating: this.calculateAverageRating(restaurant.reviews || []),
                    totalReviews: (restaurant.reviews || []).length
                }));
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

    searchRestaurants(params: SearchParams): Observable<RestaurantSearchResponse[]> {
        let httpParams = new HttpParams();
        if (params.query) httpParams = httpParams.set('query', params.query);
        if (params.min_rating) httpParams = httpParams.set('min_rating', params.min_rating.toString());
        if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
        if (params.order) httpParams = httpParams.set('order', params.order);

        return this.http.get<RestaurantSearchResponse[]>(`${this.apiUrl}/restaurants/search`, { params: httpParams }).pipe(
            tap(results => this.searchResults.set(results)),
            catchError(error => {
                console.error('Error searching restaurants:', error);
                return throwError(() => new Error('Failed to search restaurants'));
            })
        );
    }

    getRecommendations(): Observable<RestaurantSearchResponse[]> {
        return this.http.get<RestaurantSearchResponse[]>(`${this.apiUrl}/restaurants/recommendations`).pipe(
            catchError(error => {
                console.error('Error fetching recommendations:', error);
                return throwError(() => new Error('Failed to load recommendations'));
            })
        );
    }

    createRestaurant(request: CreateRestaurantRequest): Observable<Restaurant> {
        return this.http.post<Restaurant>(`${this.apiUrl}/restaurants/`, request).pipe(
            tap(restaurant => {
                const current = this.restaurants();
                this.restaurants.set([...current, restaurant]);
            }),
            catchError(error => {
                console.error('Error creating restaurant:', error);
                return throwError(() => new Error(error.error?.detail || 'Failed to create restaurant'));
            })
        );
    }

    getRestaurantById(id: string): Observable<Restaurant> {
        return this.http.get<RestaurantDetailResponse>(`${this.apiUrl}/restaurants/${id}`).pipe(
            map(response => {
                const restaurant = response.restaurant;
                const reviews = response.reviews || [];
                return {
                    ...restaurant,
                    reviews,
                    averageRating: response.average_rating ?? this.calculateAverageRating(reviews),
                    totalReviews: reviews.length
                };
            }),
            tap(restaurant => {
                const currentRestaurants = this.restaurants();
                const index = currentRestaurants.findIndex(r => r.id === restaurant.id);
                if (index !== -1) {
                    const updated = [...currentRestaurants];
                    updated[index] = restaurant;
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
        return this.http.post<Review>(`${this.apiUrl}/reviews/`, request).pipe(
            tap(review => {
                const currentReviews = this.reviews();
                this.reviews.set([...currentReviews, review]);
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
                const currentReviews = this.reviews();
                this.reviews.set(currentReviews.filter(r => r.id !== reviewId));
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
