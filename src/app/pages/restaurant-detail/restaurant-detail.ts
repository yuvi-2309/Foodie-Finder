import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Restaurant, Review, CreateReviewRequest } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { AuthService } from '../../core/services/auth.service';
import { ReviewForm } from '../../shared/components/review-form/review-form';

@Component({
  selector: 'app-restaurant-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReviewForm
  ],
  templateUrl: './restaurant-detail.html',
  styleUrl: './restaurant-detail.scss',
})
export class RestaurantDetail implements OnInit {
  restaurant = signal<Restaurant | null>(null);
  reviews = signal<Review[]>([]);
  isLoading = signal(true);
  showReviewForm = signal(false);
  restaurantId = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.restaurantId.set(id);
      this.loadRestaurant(id);
      this.loadReviews(id);
    }
  }

  private loadRestaurant(id: string): void {
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant) => {
        if (restaurant) {
          this.restaurant.set(restaurant);
        } else {
          this.router.navigate(['/restaurants']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/restaurants']);
      }
    });
  }

  private loadReviews(id: string): void {
    this.restaurantService.getReviewsByRestaurantId(id).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }));
      }
    });
  }

  toggleReviewForm(): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please log in to write a review', 'Login', {
        duration: 3000
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: this.router.url } 
        });
      });
      return;
    }
    this.showReviewForm.set(!this.showReviewForm());
  }

  onReviewSubmitted(request: CreateReviewRequest): void {
    this.restaurantService.createReview(request).subscribe({
      next: (review) => {
        this.reviews.set([review, ...this.reviews()]);
        this.showReviewForm.set(false);
        
        // Reload restaurant to get updated rating
        if (this.restaurant()) {
          this.loadRestaurant(this.restaurant()!.id);
        }
        
        this.snackBar.open('Review posted successfully!', 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to post review', 'Close', {
          duration: 3000
        });
      }
    });
  }

  getPriceRange(priceRange: number): string {
    return '$'.repeat(priceRange);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/restaurants']);
  }
}

