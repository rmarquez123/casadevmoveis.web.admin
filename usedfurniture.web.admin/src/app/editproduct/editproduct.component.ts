import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Photo, Product } from '../../services/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-product',
  templateUrl: './editproduct.component.html',
  styleUrls: ['./editproduct.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class EditProductComponent implements OnInit {
  product: Product = { id: -1, name: '', category: 0, categoryName: 'Cozina', description: "", dateReceived: new Date(), available: false, length: 0, depth: 0, height: 0, price: 0   };
  existingPhotos: Photo[] = []; // Existing photos
  newPhotos: { src: string }[] = []; // Newly added photos
  dateReceivedLocal: string = ''; // Local datetime string

  selectedPhoto: Photo | null = null;
  categories: { categoryId: number; name: string }[] = [];

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  selectedPhotoIndex: number = 0; // Track which photo is selected

  // Function to handle selecting a photo

  onSelectPhoto(photo: Photo): void {
    this.selectedPhoto = photo;

  }

  // Function Update: Load product data based on ID
  ngOnInit() {
    // Step 1: Load categories first
    this.productsService.getCategories().subscribe((categories) => {
      this.categories = categories;

      // Step 2: After categories are loaded, fetch the product
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.productsService.getProducts().subscribe((products) => {
        const p = products.find((prod) => prod.id === id);
        if (p) {
          this.product = { ...p };
          this.dateReceivedLocal = this.toDateTimeLocal(new Date(this.product.dateReceived));

          if (!this.categories.some((cat) => cat.categoryId === this.product.category)) {
            console.warn('Product category not found in the category list.');
          }
          this.productsService.getPhotosForProduct(this.product.id).subscribe((photos) => {
            this.existingPhotos = photos;
            if (this.existingPhotos.length > 0) {
              this.selectedPhoto = this.existingPhotos[0]; // Default to the first photo
            }
          });
        }
      });
    });

  }

  // Convert JavaScript Date to "datetime-local" string
  private toDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }





  // Function Update: Save changes
  onSave() {
    this.product.dateReceived = new Date(this.dateReceivedLocal);
    this.productsService.updateProduct(this.product).subscribe(() => {
      // if (updated) {
      this.router.navigate(['/products-list']);
      // }
    });
  }

  // Function Update: Navigate back without saving
  onCancel() {
    this.router.navigate(['/products-list']);
  }

  uploadedPhotos: Photo[] = [];

  onPhotoUpload(event: Event) {
    
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64 = e.target.result.split(',')[1];
          this.productsService.addPhoto(this.product.id, base64).subscribe((photoId) => {
            this.existingPhotos.push({ photoId: photoId, src: base64 });
            this.selectedPhoto = { photoId: photoId, src: base64 };
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onRemovePhoto(photoId: number) {
    this.productsService.removePhoto(photoId).subscribe(() => {
      if (photoId === -1) {
        return
      }
      this.existingPhotos = this.existingPhotos.filter((photo) => photo.photoId !== photoId);
      if (this.selectedPhoto && this.selectedPhoto.photoId === photoId) {
        this.selectedPhoto = null; // Clear selection if the removed photo was selected
      }
    });
  }


  nextPhoto(): void {
    if (this.existingPhotos.length < 2) {
      return; // No navigation needed if only 0 or 1 photo
    }
    // Move to next index (loop around using modulo)
    this.selectedPhotoIndex = (this.selectedPhotoIndex + 1) % this.existingPhotos.length;
    this.selectedPhoto = this.existingPhotos[this.selectedPhotoIndex];
  }

  prevPhoto(): void {
    if (this.existingPhotos.length < 2) {
      return;
    }
    // Move to previous index (loop around with +this.existingPhotos.length)
    this.selectedPhotoIndex =
      (this.selectedPhotoIndex - 1 + this.existingPhotos.length) % this.existingPhotos.length;
    this.selectedPhoto = this.existingPhotos[this.selectedPhotoIndex];
  }



}
