import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.scss',
})
export class RestaurantList implements OnInit {
  restaurants = signal<Restaurant[]>([]);
  isLoading = signal(true);

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  private loadRestaurants(): void {
    this.isLoading.set(true);
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants.set(restaurants);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  viewRestaurant(id: string): void {
    this.router.navigate(['/restaurants', id]);
  }

  getPriceRange(priceRange: number): string {
    return '$'.repeat(priceRange);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
}

