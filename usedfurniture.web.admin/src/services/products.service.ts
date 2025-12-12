// src\services\products.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Photo, Product } from './product.model';
import { environment } from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class ProductsService {

  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }
  getCategories(): Observable<{ categoryId: number; name: string }[]> {
    return this.http.get<{ categoryId: number; name: string }[]>(`${this.apiUrl}/categories`);
  }

  // Fetch all products from the backend
  getProducts(): Observable<Product[]> {

    const self = this;

    return this.http.get<any[]>(`${this.apiUrl}/products`).pipe(
      map((data: any[]) => {

        return data.map(item => {
          return {
            id: item.product_id,
            name: item.name,
            description: item.description,
            available: item.available,
            dateReceived: new Date(item.dateReceived * 1000),
            dateSold: item.dateSold ? new Date(item.dateSold) : undefined,
            category: item.category,
            categoryName: item.categoryName,
            pictures: [],
            depth: item.depth,
            height: item.height,
            length: item.length,
            price: item.price,
            siteVisible: item.siteVisible ?? false,
            socialMediaVisible: item.socialMediaVisible ?? false
          } as Product;
        });
      })
    );
  }

  private encodeChars(original: string): string {
    if (original === null || original === undefined) {
      return '';
    }
    const utf8Bytes = new TextEncoder().encode(original);
    const misinterpreted = Array.from(utf8Bytes).map(byte => String.fromCharCode(byte)).join('');
    return misinterpreted;
  }


  /**
   * 
   * @param newProduct 
   * @returns 
   */
  createProduct(newProduct: Product): Observable<number> {
    // Include dateReceived in the payload:
    const params = new HttpParams()
      .set('name', this.encodeChars(newProduct.name))
      .set('description', this.encodeChars(newProduct.description))
      .set('category', newProduct.category.toString())
      .set('available', newProduct.available.toString())
      .set('dateReceived', new Date(newProduct.dateReceived).toISOString())
      .set('length', newProduct.length.toString())
      .set('depth', newProduct.depth.toString())
      .set('height', newProduct.height.toString())
      .set('price', newProduct.price.toString())
      .set('siteVisible', newProduct.siteVisible ? 'true' : 'false')
      .set('socialMediaVisible', newProduct.socialMediaVisible ? 'true' : 'false')
      ;


    return this.http.post<number>(`${this.apiUrl}/products/add`, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }




  updateProduct(updatedProduct: Product): Observable<void> {
    let payload;
    if (updatedProduct.dateSold) {
      payload = new HttpParams()
        .set('productId', updatedProduct.id!.toString())
        .set('name', this.encodeChars(updatedProduct.name))
        .set('description', this.encodeChars(updatedProduct.description))
        .set('available', updatedProduct.available)
        .set('category', updatedProduct.category)
        .set('dateReceived', updatedProduct.dateReceived.toISOString())
        .set('dateSold', updatedProduct.dateSold.toISOString())
        .set('length', updatedProduct.length.toString())
        .set('depth', updatedProduct.depth.toString())
        .set('height', updatedProduct.height.toString())
        .set('price', updatedProduct.price.toString());
      ;
    } else {
      payload = new HttpParams()
        .set('productId', updatedProduct.id!.toString())
        .set('name', this.encodeChars(updatedProduct.name))
        .set('description', this.encodeChars(updatedProduct.description))
        .set('available', updatedProduct.available)
        .set('category', updatedProduct.category)
        .set('dateReceived', updatedProduct.dateReceived.toISOString())
        .set('length', updatedProduct.length.toString())
        .set('depth', updatedProduct.depth.toString())
        .set('height', updatedProduct.height.toString())
        .set('price', updatedProduct.price.toString())
        .set('siteVisible', updatedProduct.siteVisible ? 'true' : 'false')
        .set('socialMediaVisible', updatedProduct.socialMediaVisible ? 'true' : 'false')
        ;
    }

    return this.http.post<void>(`${this.apiUrl}/products/edit`, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  /**
   * 
   * @param productId 
   * @returns 
   */
  removeProduct(productId: number): Observable<boolean> {
    const payload = new HttpParams().set('productId', productId.toString());
    const result = this.http.post<boolean>(`${this.apiUrl}/products/remove`, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return result
  }


  getPhotos(productIds: number[], width?: number, height?: number): Observable<{ [key: number]: Photo[] }> {
    const params = new HttpParams().set('productIds', productIds.join(','))
      .set('width', width?.toString() ?? '')
      .set('height', height?.toString() ?? '')
      ;
    return this.http.get<{ [key: number]: Photo[] }>(`${this.apiUrl}/photos`, { params });
  }


  addPhoto(productId: number, photoBase64: string): Observable<number> {
    if (productId == null) {
      throw new Error('Product ID is required');
    }
    if (!photoBase64) {
      throw new Error('Photo base64 is required');
    }

    // Compress to max 2 MB, for example
    return from(
      this.compressBase64ImageToMaxSizeMb(photoBase64, 0.5) // 2 MB
    ).pipe(
      switchMap((compressedBase64) => {
        // Remove the "data:image/jpeg;base64," prefix if your server expects raw base64
        const cleanBase64 = compressedBase64.replace(/^data:image\/\w+;base64,/, '');

        const params = new HttpParams()
          .set('productId', productId.toString())
          .set('photo', cleanBase64);

        return this.http.post<number>(
          `${this.apiUrl}/photos/add`,
          params.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
      })
    );
  }

  removePhoto(photoId: number): Observable<void> {
    const params = new HttpParams().set('photoId', photoId.toString());
    return this.http.post<void>(`${this.apiUrl}/photos/remove`, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }


  getPhotosForProduct(productId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/photos/product`, {
      params: { productId: productId.toString() },
    });
  }


  private compressBase64ImageToMaxSizeMb(
    base64: string,
    maxMB: number,
    minQuality: number = 0.1
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const maxBytes = maxMB * 1024 * 1024;
      const img = new Image();
      // Ensure we have a data URL prefix if missing
      img.src = base64.startsWith('data:image/') ? base64 : `data:image/jpeg;base64,${base64}`;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        // Use the original dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let quality = 1.0;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Because Base64 encoding adds ~37% overhead, compare length to target bytes
        // (length * 3/4) approximates the binary size in bytes if no headers are present
        const base64toBytes = (b64: string) => Math.ceil((b64.length * 3) / 4);

        // Compress in a loop while it exceeds maxBytes
        while (base64toBytes(compressedDataUrl) > maxBytes && quality > minQuality) {
          quality -= 0.05; // Decrease quality step by step
          if (quality < minQuality) {
            quality = minQuality; // Don’t go below the min
          }
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);
    });
  }


}
