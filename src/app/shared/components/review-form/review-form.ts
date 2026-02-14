import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateReviewRequest } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-review-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
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

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(20)]],
      photo_url: ['']
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

  onPhotoUrlChange(): void {
    const url = this.reviewForm.get('photo_url')?.value;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.photoPreview.set(url);
    } else {
      this.photoPreview.set(null);
    }
  }

  clearPhoto(): void {
    this.reviewForm.patchValue({ photo_url: '' });
    this.photoPreview.set(null);
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

    const photoUrl = this.reviewForm.value.photo_url?.trim();
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

