import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly uploadUrl = environment.cloudinary.uploadUrl;
  private readonly uploadPreset = environment.cloudinary.uploadPreset;

  isUploading = signal(false);
  uploadProgress = signal(0);

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    return this.http.post<CloudinaryUploadResponse>(this.uploadUrl, formData).pipe(
      map(response => response.secure_url),
      catchError(error => {
        console.error('Cloudinary upload error:', error);
        return throwError(() => new Error('Failed to upload image. Please try again.'));
      }),
      finalize(() => {
        this.isUploading.set(false);
        this.uploadProgress.set(0);
      })
    );
  }

  validateFile(file: File): string | null {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.';
    }

    if (file.size > maxSize) {
      return 'File size exceeds 5MB. Please choose a smaller image.';
    }

    return null;
  }
}
