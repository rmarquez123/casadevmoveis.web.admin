
// src\app\createproduct.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product.model';
import { ProductsService } from '../../services/products.service';
import { forkJoin } from 'rxjs';
import { DescriptionService } from '../../services/description.service';


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

  uploadedPhotos: string[] = [];
  isDragOver = false; 

  uploadedFiles: File[] = [];

  isGeneratingDescription = false;
  descriptionError: string | null = null;

  constructor(
      private productsService: ProductsService, 
      private router: Router, 
      private descriptionService: DescriptionService) { }

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

  
  private processFiles(files: FileList | File[]) {
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        continue;
      }
      if (file.size > maxSizeBytes) {
        continue;
      }

      this.uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedPhotos.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  onAutoDescribe(): void {
    this.descriptionError = null;

    if (!this.uploadedFiles.length) {
      this.descriptionError = 'Adicione pelo menos uma foto antes de usar a IA.';
      return;
    }

    const mainImage = this.uploadedFiles[0];

    this.isGeneratingDescription = true;

    const dimensionsHint = this.buildDimensionsHint();

    this.descriptionService.generateDescription(mainImage, {
      // You can tweak these defaults
      price: this.product.price || undefined,
      dimensions: dimensionsHint || undefined,
      // you could also pass:
      // category: this.resolveCategoryName(), 
      // conditionHint: 'bom'
    }).subscribe({
      next: (res) => {
        // Use AI suggestion
        if (res.titlePt) {
          this.product.name = res.titlePt;
        }
        if (res.descriptionPt) {
          this.product.description = res.descriptionPt;
        }
        this.isGeneratingDescription = false;
      },
      error: (err) => {
        console.error('AI description error', err);
        this.descriptionError = 'Erro ao gerar descrição automática.';
        this.isGeneratingDescription = false;
      }
    });
  }

  
  private buildDimensionsHint(): string {
    const length = this.product.length;
    const depth = this.product.depth;
    const height = this.product.height;

    const hasLength = !!length;
    const hasDepth = !!depth;
    const hasHeight = !!height;

    const parts: string[] = [];

    if (hasLength) {
      parts.push(`comprimento ${length}cm`);
    }
    if (hasDepth) {
      parts.push(`largura ${depth}cm`);
    }
    if (hasHeight) {
      parts.push(`altura ${height}cm`);
    }

    return parts.join(', ');
  }

  // Optional: if you want to send category name instead of numeric id
  private resolveCategoryName(): string | undefined {
    const match = this.categories.find(c => c.categoryId === this.product.category);
    return match?.name;
  }

  // Updated function: now just delegates to processFiles
  onPhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }
 
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onPaste(event: ClipboardEvent) {
    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) return;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];

      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.processFiles([file]);
        }
      }
    }
    event.preventDefault();
  }

}
