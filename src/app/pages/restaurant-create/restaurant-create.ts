import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RestaurantService } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './restaurant-create.html',
  styleUrl: './restaurant-create.scss',
})
export class RestaurantCreate {
  restaurantForm: FormGroup;
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      address: ['']
    });
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      this.restaurantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const request = {
      name: this.restaurantForm.value.name.trim(),
      location: this.restaurantForm.value.location.trim(),
      ...(this.restaurantForm.value.address?.trim() && { address: this.restaurantForm.value.address.trim() })
    };

    this.restaurantService.createRestaurant(request).subscribe({
      next: (restaurant) => {
        this.isSubmitting.set(false);
        this.snackBar.open('Restaurant created successfully!', 'View', {
          duration: 4000,
          panelClass: 'success-snackbar'
        }).onAction().subscribe(() => {
          this.router.navigate(['/restaurants', restaurant.id]);
        });
        this.router.navigate(['/restaurants']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.snackBar.open(err.message || 'Failed to create restaurant', 'Dismiss', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.restaurantForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) return `${this.getLabel(fieldName)} is required`;
    if (field.hasError('minlength')) {
      const min = field.getError('minlength').requiredLength;
      return `${this.getLabel(fieldName)} must be at least ${min} characters`;
    }
    if (field.hasError('maxlength')) {
      const max = field.getError('maxlength').requiredLength;
      return `${this.getLabel(fieldName)} must be at most ${max} characters`;
    }
    return '';
  }

  private getLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Restaurant name',
      location: 'City / Location',
      address: 'Address'
    };
    return labels[fieldName] || fieldName;
  }
}
