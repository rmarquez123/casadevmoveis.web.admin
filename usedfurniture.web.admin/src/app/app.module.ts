// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppComponent } from './app.component';
import { ProductsListComponent } from './productlist/productslist.component';
import { CommonModule } from '@angular/common';
import { EditProductComponent } from './editproduct/editproduct.component';
import { CreateProductComponent } from './createproduct/createproduct.component';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
  ],  
  bootstrap: [] // No bootstrap component here
})
export class AppModule {}
  