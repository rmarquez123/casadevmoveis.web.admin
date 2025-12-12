// src\services\product.model.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  available: boolean;
  dateReceived: Date;
  dateSold?: Date;
  category: number;
  pictures?: string[];
  categoryName: string;
  depth: number;
  height: number;
  length: number;
  price: number;
  siteVisible?: boolean;
  socialMediaVisible?: boolean;
}


export interface Photo {
  photoId: number,
  src: string
}