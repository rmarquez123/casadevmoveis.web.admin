// furniture.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FurnitureService {
  // New function to fetch hard-coded items
  getItems() {
    return [
      { 
        title: 'Sturdy Wooden Chair',
        price: 11.80,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0054.jpg'
        ,category: 'Outras'
      },
      { 
        title: 'Beautiful Wooden Cabinet',
        price: 12.90,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0045.jpg',
        category: 'Cocina'
      },
      { 
        title: 'Elegant Dining Set',
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0047.jpg',
        category: 'Quartos'
      },
      { 
        title: 'Sturdy Wooden Chair',
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0048.jpg',
        category: 'Sala'
      }, 
      { 
        title: 'Beautiful Wooden Cabinet',
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0049.jpg'
        ,category: 'Cocina'
      },
      { 
        title: 'Elegant Dining Set',
        price: 19.80,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0050.jpg'
        ,category: 'Cocina'
      },
      { 
        title: 'Sturdy Wooden Chair',
        price: 11.80,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0051.jpg'
        ,category: 'Cocina'
      },
      {   
        title: 'Beautiful Wooden Cabinet',
        price: 12.90,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0052.jpg'
        ,category: 'Cocina'
      },
      { 
        title: 'Elegant Dining Set',
        price: 19.80,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0053.jpg'
        ,category: 'Outras'
      },
      { 
        title: 'Sturdy Wooden Chair',
        price: 11.80,
        recieved: '01-01-2024',
        image: 'images/IMG-20241213-WA0054.jpg'
        ,category: 'Outras'
      },
      
    ];
  }
}
