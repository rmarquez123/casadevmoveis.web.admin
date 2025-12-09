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




  private _loadProductPhotos(products: Product[]) {
    this.products = products;
    this.filteredProducts = products;
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
    if (this.selectedCategoryId === null) {
      this.filteredProducts = this.products; // Show all products
    } else {

      this.filteredProducts = this.products.filter((p) => {
        const result = p.category == this.selectedCategoryId
        console.log('Product Category:', p.category, 'Selected Category ID:', this.selectedCategoryId);
        console.log('Result:', result);
        return result;
      });
    }
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
  
  
  formatCode(int:number):string {
    return int.toString().padStart(4, '0');
  }
}
