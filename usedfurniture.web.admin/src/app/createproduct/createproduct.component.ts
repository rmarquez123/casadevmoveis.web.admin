
// src\app\createproduct.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product.model';
import { ProductsService } from '../../services/products.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-product',
  templateUrl: './createproduct.component.html',
  styleUrls: ['./createproduct.component.css'],
  standalone: true,  // Add CommonModule here
  imports: [RouterModule, CommonModule, FormsModule],
})
export class CreateProductComponent implements OnInit {
  product: Product = { id: -1, name: '', category: 0, categoryName: 'Cozina', 
    description: '', 
    dateReceived: new Date(), available: true,
    length: 0, depth: 0, height: 0, price: 0  
  };
  categories: { categoryId: number; name: string }[] = [];
  dateReceived: string = '';
  constructor(private productsService: ProductsService, private router: Router) { }

  ngOnInit(): void {
    this.dateReceived = this.formattedDateReceived();
    this.productsService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }


  // Function Update: Create a new product and navigate back  
  onCreate() {
    this.product.dateReceived = new Date(this.dateReceived);
    this.productsService.createProduct(this.product).subscribe((createdProductId: number) => {
      // 1) After creation, handle photos:
      const photoUploadObservables = this.uploadedPhotos.map(photoBase64 => {
        const base64Data = photoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        return this.productsService.addPhoto(createdProductId, base64Data)
      });
  
      // 2) Wait for all photo uploads to finish:
      forkJoin(photoUploadObservables).subscribe(() => {
        // 3) Finally, navigate away once done:
        this.router.navigate(['/products-list']);
      });
    });
  }

  formattedDateReceived(): string {
    const date = this.product.dateReceived;
    const result = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return result;
  }

  

  // Function Update: Cancel creation
  onCancel() {
    this.router.navigate(['/products-list']);
  }

  uploadedPhotos: string[] = [];

  onPhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedPhotos.push(e.target.result); // Add image preview to the array
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
