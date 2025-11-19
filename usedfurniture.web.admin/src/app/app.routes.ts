// app.routes.ts

import { Routes } from '@angular/router';
import { ProductsListComponent } from './productlist/productslist.component';
import { EditProductComponent } from './editproduct/editproduct.component';
import { CreateProductComponent } from './createproduct/createproduct.component';

export const routes: Routes = [
  { path: 'products-list', component: ProductsListComponent },
  { path: 'edit-product/:id', component: EditProductComponent } , 
  { path: 'create-product', component: CreateProductComponent },  
  { path: '', redirectTo: 'products-list', pathMatch: 'full' }
];
