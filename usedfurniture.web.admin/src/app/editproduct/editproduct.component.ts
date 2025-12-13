import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Photo, Product } from '../../services/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DescriptionService } from '../../services/description.service';
import { PhotoEditorComponent } from '../shared/photo-editor/photo-editor.component';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-edit-product',
  templateUrl: './editproduct.component.html',
  styleUrls: ['./editproduct.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PhotoEditorComponent],
})
export class EditProductComponent implements OnInit {
  product: Product = {
    id: -1,
    name: '',
    category: 0,
    categoryName: 'Cozina',
    description: "",
    dateReceived: new Date(),
    available: false,
    length: 0, depth: 0, height: 0, price: 0
  };
  existingPhotos: Photo[] = [];
  newPhotos: { src: string }[] = [];
  dateReceivedLocal: string = '';

  selectedPhoto: Photo | null = null;
  categories: { categoryId: number; name: string }[] = [];
  isDragOver = false;
  uploadedPhotos: Photo[] = [];
  isPhotoEditorOpen = false;
  photoBeingEdited: Photo | null = null;
  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private descriptionService: DescriptionService
  ) { }
  selectedPhotoIndex: number = 0;

  isGeneratingDescription = false;
  descriptionError: string | null = null;

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
          console.log('Loaded product for editing:', this.product);
          this.dateReceivedLocal = this.toDateTimeLocal(new Date(this.product.dateReceived));

          if (!this.categories.some((cat) => cat.categoryId === this.product.category)) {
            console.warn('Product category not found in the category list.');
          }

          this.productsService.getPhotosForProduct(this.product.id) //
            .subscribe(this.onPhotosLoaded.bind(this));
        }
      });
    });
  }

  private onPhotosLoaded(photos: Photo[]) {
    this.existingPhotos = photos;
    if (this.existingPhotos.length > 0) {
      this.selectedPhoto = this.existingPhotos[0]; // Default to the first photo
    }
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


  private processFiles(files: FileList | File[]) {
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Optional: validate type / size
      if (!file.type.startsWith('image/')) {
        continue;
      }
      if (file.size > maxSizeBytes) {
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl: string = e.target.result;
        const base64 = dataUrl.split(',')[1];

        this.productsService.addPhoto(this.product.id, base64).subscribe((photoId) => {
          const newPhoto: Photo = { photoId, src: base64 };
          this.existingPhotos.push(newPhoto);
          this.selectedPhoto = newPhoto;
          this.selectedPhotoIndex = this.existingPhotos.length - 1;
        });
      };
      reader.readAsDataURL(file);
    }
  }

  openPhotoEditor(): void {
    if (!this.selectedPhoto) return;
    this.photoBeingEdited = this.selectedPhoto;
    this.isPhotoEditorOpen = true;
  }

  closePhotoEditor(): void {
    this.isPhotoEditorOpen = false;
    this.photoBeingEdited = null;
  }

  /* Replace selected photo by: remove old + add edited as new */
  onPhotoEdited(editedBase64WithPrefix: string): void {
    console.log('Received edited photo data from editor');
    if (this.photoBeingEdited == null || this.photoBeingEdited == undefined) return;

    const editedBase64 = editedBase64WithPrefix.includes(',')
      ? editedBase64WithPrefix.split(',')[1]
      : editedBase64WithPrefix;

    const oldPhotoId = this.photoBeingEdited.photoId;

    this.productsService.removePhoto(oldPhotoId).pipe(
      switchMap(() => this.productsService.addPhoto(this.product.id, editedBase64)),
      map((newPhotoId) => ({ newPhotoId }))
    ).subscribe({
      next: ({ newPhotoId }) => {
        /* Update UI list */
        this.existingPhotos = this.existingPhotos.filter(p => p.photoId !== oldPhotoId);

        const newPhoto: Photo = { photoId: newPhotoId, src: editedBase64 };
        this.existingPhotos.push(newPhoto);

        this.selectedPhoto = newPhoto;
        this.selectedPhotoIndex = Math.max(0, this.existingPhotos.length - 1);

        this.closePhotoEditor();
      },
      error: (err) => {
        console.error('Failed to replace photo with edited version', err);
      }
    });
  }


  onPhotoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
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
          // ✅ Just pass an array of File
          this.processFiles([file]);
        }
      }
    }
    // Optional: avoid pasting into a focused input/textarea
    event.preventDefault();
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


  private base64ToFile(base64: string, fileName: string, contentType = 'image/jpeg'): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ab], fileName, { type: contentType });
  }

  onAutoDescribe(): void {
    this.descriptionError = null;

    // Choose photo: selectedPhoto, or first existing
    const photoSource: Photo | null =
      this.selectedPhoto || (this.existingPhotos.length > 0 ? this.existingPhotos[0] : null);

    if (!photoSource) {
      this.descriptionError = 'Selecione ou adicione pelo menos uma foto antes de usar a IA.';
      return;
    }

    // Convert Base64 → File
    const file = this.base64ToFile(photoSource.src, 'produto.jpg');

    this.isGeneratingDescription = true;

    const dimensionsHint = this.buildDimensionsHint();

    this.descriptionService.generateDescription(file, {
      price: this.product.price || undefined,
      dimensions: dimensionsHint || undefined,
      // Optionally:
      // category: this.resolveCategoryName(),
      // conditionHint: 'bom'
    }).subscribe({
      next: (res) => {
        if (res.titlePt) {
          this.product.name = res.titlePt;
        }
        if (res.descriptionPt) {
          this.product.description = res.descriptionPt;
        }
        this.isGeneratingDescription = false;
      },
      error: (err) => {
        console.error('AI description error (edit product)', err);
        this.descriptionError = 'Erro ao gerar descrição automática.';
        this.isGeneratingDescription = false;
      }
    });
  }


}
