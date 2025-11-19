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
    isGridView = false; // Add this variable
    selectedCategoryId: number | null = null; // Track selected category
    filteredProducts: Product[] = []; // Filtered list of products

    constructor(private productsService: ProductsService, private router: Router) { }

    // Function Update: Fetch products on init
    ngOnInit() {
        this.productsService.getCategories().subscribe((categories) => {
            this.categories = categories;

        });

        this.productsService.getProducts().subscribe((products) => {
            this.products = products;
            this.filteredProducts = products;
            const productIds: number[] = products.map((product) => product.id!);
            this.productsService.getPhotos(productIds, 140, 180).subscribe((photos) => {
                this.photos = photos;
            });
        });
    }

    // Function Update: Navigate to edit component
    onEdit(product: Product) {
        this.router.navigate(['/edit-product', product.id]);
    }

    // Function Update: Remove a product from the list
    onRemove(productId: number) {
        this.productsService.removeProduct(productId).subscribe((success) => {
            if (success) {
                // Refresh product list
                this.productsService.getProducts().subscribe(data => this.products = data);
                this.filterProducts();
            }
        });
    }

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
}
