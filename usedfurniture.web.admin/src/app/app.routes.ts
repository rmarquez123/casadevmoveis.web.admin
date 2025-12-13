// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { ProductsListComponent } from './productlist/productslist.component';
import { EditProductComponent } from './editproduct/editproduct.component';
import { CreateProductComponent } from './createproduct/createproduct.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'products-list', component: ProductsListComponent, canActivate: [authGuard] },
  { path: 'edit-product/:id', component: EditProductComponent, canActivate: [authGuard] },
  { path: 'create-product', component: CreateProductComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'products-list', pathMatch: 'full' },
];

