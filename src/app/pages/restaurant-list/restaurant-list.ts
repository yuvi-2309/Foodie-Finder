import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Restaurant, RestaurantSearchResponse, SearchParams } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-restaurant-list',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.scss',
})
export class RestaurantList implements OnInit {
  restaurants = signal<Restaurant[]>([]);
  searchResults = signal<RestaurantSearchResponse[]>([]);
  isLoading = signal(true);
  isSearching = signal(false);
  isSearchMode = signal(false);

  searchQuery = signal('');
  minRating = signal<number>(0);
  sortBy = signal<string>('rating');
  sortOrder = signal<string>('desc');
  showFilters = signal(false);

  private searchSubject = new Subject<string>();

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.minRating() > 0) count++;
    if (this.sortBy() !== 'rating') count++;
    if (this.sortOrder() !== 'desc') count++;
    return count;
  });

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      if (query.trim() || this.minRating() > 0) {
        this.performSearch();
      } else {
        this.isSearchMode.set(false);
      }
    });
  }

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

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  performSearch(): void {
    this.isSearching.set(true);
    this.isSearchMode.set(true);

    const params: SearchParams = {};
    if (this.searchQuery().trim()) params.query = this.searchQuery().trim();
    if (this.minRating() > 0) params.min_rating = this.minRating();
    if (this.sortBy()) params.sort_by = this.sortBy() as 'rating' | 'name';
    if (this.sortOrder()) params.order = this.sortOrder() as 'asc' | 'desc';

    this.restaurantService.searchRestaurants(params).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
      },
      error: () => {
        this.isSearching.set(false);
      }
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.minRating.set(0);
    this.sortBy.set('rating');
    this.sortOrder.set('desc');
    this.isSearchMode.set(false);
    this.searchResults.set([]);
  }

  onMinRatingChange(value: number): void {
    this.minRating.set(value);
    this.performSearch();
  }

  onSortChange(): void {
    if (this.isSearchMode()) {
      this.performSearch();
    }
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
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

