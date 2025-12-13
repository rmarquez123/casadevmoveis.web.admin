// src\app\productlist\productslist.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Photo, Product } from '../../services/product.model';
import { ProductsService } from '../../services/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-products-list',
  templateUrl: './productslist.component.html',
  styleUrls: ['./productslist.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class ProductsListComponent implements OnInit {

  products: Product[] = [];

  photos: { [key: number]: Photo[] } = {};

  categories: { categoryId: number; name: string }[] = [];
  isGridView = false;
  selectedCategoryId: number | null = null;
  filteredProducts: Product[] = [];

  removing: { [productId: number]: boolean } = {};
  confirmRemoveProduct: Product | null = null;

  filterName: string = '';

  filterId: number | null = null;

  /* tri-state: null = all, true/false filters */
  filterAvailable: boolean | null = null;
  filterSiteVisible: boolean | null = null;
  filtersOpen = false;


  constructor(private productsService: ProductsService, private router: Router) { }

  // Function Update: Fetch products on init
  ngOnInit() {
    this.productsService.getCategories().subscribe((categories) => {
      this.categories = categories;

    });

    this.productsService.getProducts().subscribe((products) => {
      this._loadProductPhotos(products);
    });

  }

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  closeFilters() {
    this.filtersOpen = false;
  }

  clearFilters() {
    this.filterName = '';
    this.filterId = null;
    this.filterAvailable = null;
    this.filterSiteVisible = null;
    this.selectedCategoryId = null;
    this.filterProducts();
  }

  getActiveFilterCount(): number {
    let n = 0;
    if ((this.filterName || '').trim().length > 0) n++;
    if (this.filterId !== null && this.filterId !== undefined) n++;
    if (this.filterAvailable !== null) n++;
    if (this.filterSiteVisible !== null) n++;
    if (this.selectedCategoryId !== null) n++;
    return n;
  }


  private _loadProductPhotos(products: Product[]) {
    this.products = products;

    // Keep whatever filters are currently set
    this.filterProducts();

    const productIds: number[] = products.map((product) => product.id!);
    const requested_width = 50;
    const requested_height = 50;

    this.productsService.getPhotos(productIds, requested_width, requested_height).subscribe((photos) => {
      this.photos = photos;
    });
  }



  // Function Update: Navigate to edit component
  onEdit(product: Product) {
    this.router.navigate(['/edit-product', product.id]);
  }


  // Function Update: Ask for confirmation before removing
  onRemove(product: Product) {
    this.confirmRemoveProduct = product;
  }

  cancelRemove() {
    this.confirmRemoveProduct = null;
  }


  confirmRemove() {
    if (!this.confirmRemoveProduct || this.confirmRemoveProduct.id == null) {
      return;
    }

    const productId = this.confirmRemoveProduct.id;

    // Avoid duplicate clicks while already processing
    if (this.removing[productId]) {
      return;
    }

    this.removing[productId] = true;

    this.productsService.removeProduct(productId).subscribe({
      next: (success) => {
        if (success) {
          // Refresh products + photos and keep filters in sync
          this.productsService.getProducts().subscribe((products) => {
            this._loadProductPhotos(products);
            this.filterProducts();
          });
        }
      },
      error: (err) => {
        console.error('Error removing product', err);
        // You can optionally show a toast/alert here
      },
      complete: () => {
        this.removing[productId] = false;
        this.confirmRemoveProduct = null;
      },
    });
  }


  // Function Update: Remove a product from the list


  // Function Update: Navigate to create product component
  onCreateNew() {
    this.router.navigate(['/create-product']);
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  filterProducts() {
    const nameNeedle = (this.filterName || '').trim().toLowerCase();
    const idNeedle = this.filterId;

    this.filteredProducts = this.products.filter((p) => {
      /* Category */
      if (this.selectedCategoryId !== null && p.category !== this.selectedCategoryId) {
        return false;
      }

      /* Available (tri-state) */
      if (this.filterAvailable !== null && p.available !== this.filterAvailable) {
        return false;
      }

      /* Site visible (tri-state)
         Treat undefined as false by default (common for legacy rows). */
      if (this.filterSiteVisible !== null) {
        const siteVisible = (p.siteVisible ?? false);
        if (siteVisible !== this.filterSiteVisible) {
          return false;
        }
      }

      /* Name contains */
      if (nameNeedle.length > 0) {
        const hay = (p.name || '').toLowerCase();
        if (!hay.includes(nameNeedle)) {
          return false;
        }
      }

      /* ID exact match */
      if (idNeedle !== null && idNeedle !== undefined) {
        if (p.id !== idNeedle) {
          return false;
        }
      }

      return true;
    });
  }

  formatPrice(price: number): string {
    if (price < 1) {
      return "";
    }
    // Format the price with no decimal places in Brazilian Reals. 
    return price.toLocaleString('pt-BR', {
      style: 'currency', // 
      currency: 'BRL', //
      minimumFractionDigits: 0 //
    });
  }


  formatCode(int: number): string {
    return int.toString().padStart(4, '0');
  }
}
