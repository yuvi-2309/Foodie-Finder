import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RestaurantSearchResponse } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recommendations',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss',
})
export class Recommendations implements OnInit {
  recommendations = signal<RestaurantSearchResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private restaurantService: RestaurantService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.error.set('Please log in to see personalized recommendations.');
      this.isLoading.set(false);
      return;
    }
    this.loadRecommendations();
  }

  private loadRecommendations(): void {
    this.isLoading.set(true);
    this.restaurantService.getRecommendations().subscribe({
      next: (recommendations) => {
        this.recommendations.set(recommendations);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load recommendations. Try reviewing some restaurants first!');
        this.isLoading.set(false);
      }
    });
  }

  viewRestaurant(id: string): void {
    this.router.navigate(['/restaurants', id]);
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/recommendations' } });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
}
