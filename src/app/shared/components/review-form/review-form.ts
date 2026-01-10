import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CreateReviewRequest, Review } from '../../../core/models/restaurant.model';

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
    MatDatepickerModule,
    MatNativeDateModule
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

  constructor(private fb: FormBuilder) {
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

    console.log('Review form - restaurantId:', this.restaurantId);
    console.log('Review form - request payload:', request);

    this.reviewSubmitted.emit(request);
  }

  resetForm(): void {
    this.reviewForm.reset({ visitDate: new Date() });
    this.selectedRating.set(0);
    this.isSubmitting.set(false);
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
      title: 'Review title',
      content: 'Review content',
      visitDate: 'Visit date'
    };
    return labels[fieldName] || fieldName;
  }
}

