// src/services/description.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AiDescriptionOptions, AiDescriptionResponse } from './description.model';

@Injectable({
  providedIn: 'root'
})
export class DescriptionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Calls the backend AI endpoint to generate a product title/description
   * based on one or more images and optional metadata.
   *
   * @param images  Single File or array of Files (e.g., from file input)
   * @param options Optional metadata: location, price, dimensions, category, conditionHint
   */
  generateDescription(
    images: File | File[],
    options?: AiDescriptionOptions
  ): Observable<AiDescriptionResponse> {

    const formData = new FormData();

    // Always send at least one "images" part
    if (Array.isArray(images)) {
      images.forEach((file) => {
        if (file) {
          formData.append('images', file, file.name);
        }
      });
    } else if (images) {
      formData.append('images', images, images.name);
    }

    // Optional metadata – only append if present
    if (options?.location) {
      formData.append('location', options.location);
    }

    if (options?.price !== undefined && options?.price !== null) {
      formData.append('price', String(options.price));
    }

    if (options?.dimensions) {
      formData.append('dimensions', options.dimensions);
    }

    if (options?.category) {
      formData.append('category', options.category);
    }

    if (options?.conditionHint) {
      formData.append('conditionHint', options.conditionHint);
    }

    return this.http.post<AiDescriptionResponse>(
      `${this.apiUrl}/ai/product-description`,
      formData
    );
  }
}
