import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateReviewRequest } from '../../../core/models/restaurant.model';
import { CloudinaryService } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-review-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
})
export class ReviewForm {
  @Input() restaurantId!: string;
  @Output() reviewSubmitted = new EventEmitter<CreateReviewRequest>();

  reviewForm: FormGroup;
  selectedRating = signal(0);
  hoverRating = signal(0);
  isSubmitting = signal(false);
  photoPreview = signal<string | null>(null);
  uploadedPhotoUrl = signal<string | null>(null);
  uploadError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    public cloudinaryService: CloudinaryService,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  setRating(rating: number): void {
    this.selectedRating.set(rating);
  }

  setHoverRating(rating: number): void {
    this.hoverRating.set(rating);
  }

  clearHoverRating(): void {
    this.hoverRating.set(0);
  }

  getStarIcon(index: number): string {
    const displayRating = this.hoverRating() || this.selectedRating();
    return index < displayRating ? 'star' : 'star_border';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const validationError = this.cloudinaryService.validateFile(file);

    if (validationError) {
      this.uploadError.set(validationError);
      this.snackBar.open(validationError, 'Close', { duration: 4000 });
      input.value = '';
      return;
    }

    this.uploadError.set(null);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    this.cloudinaryService.uploadImage(file).subscribe({
      next: (secureUrl) => {
        this.uploadedPhotoUrl.set(secureUrl);
        this.photoPreview.set(secureUrl);
        this.snackBar.open('Photo uploaded successfully!', 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.uploadError.set(error.message);
        this.photoPreview.set(null);
        this.uploadedPhotoUrl.set(null);
        this.snackBar.open(error.message, 'Close', { duration: 4000 });
      }
    });
  }

  clearPhoto(): void {
    this.photoPreview.set(null);
    this.uploadedPhotoUrl.set(null);
    this.uploadError.set(null);
  }

  onSubmit(): void {
    if (this.reviewForm.invalid || this.selectedRating() === 0) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const request: CreateReviewRequest = {
      restaurant_id: this.restaurantId,
      rating: this.selectedRating(),
      content: this.reviewForm.value.content
    };

    const photoUrl = this.uploadedPhotoUrl();
    if (photoUrl) {
      request.photo_url = photoUrl;
    }

    this.reviewSubmitted.emit(request);
  }

  resetForm(): void {
    this.reviewForm.reset();
    this.selectedRating.set(0);
    this.isSubmitting.set(false);
    this.photoPreview.set(null);
    this.uploadedPhotoUrl.set(null);
    this.uploadError.set(null);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.reviewForm.get(fieldName);
    if (!field || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      content: 'Review content',
      photo_url: 'Photo URL'
    };
    return labels[fieldName] || fieldName;
  }
}

