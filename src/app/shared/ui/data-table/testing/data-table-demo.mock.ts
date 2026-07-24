import { TableColumn } from '../models/table-column.model';

/**
 * Generic demo dataset used only to exercise/validate the Data Table component in
 * isolation (unit tests, future Storybook-style demos). Deliberately unrelated to any
 * real feature/domain (e.g. Dealer Ledger) — this table is completely generic.
 */
export interface DemoProduct extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

export const DEMO_PRODUCT_COLUMNS: TableColumn<DemoProduct>[] = [
  { key: 'name', header: 'Product Name', sortable: true },
  { key: 'category', header: 'Category', sortable: true },
  { key: 'price', header: 'Price', sortable: true, align: 'end' },
  { key: 'stock', header: 'Stock', sortable: true, align: 'end' },
  { key: 'status', header: 'Status', sortable: true },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 'p-1', name: 'Wireless Mouse', category: 'Accessories', price: 25.99, stock: 120, status: 'In Stock' },
  { id: 'p-2', name: 'Mechanical Keyboard', category: 'Accessories', price: 89.5, stock: 45, status: 'In Stock' },
  { id: 'p-3', name: '27" Monitor', category: 'Displays', price: 249.0, stock: 12, status: 'Low Stock' },
  { id: 'p-4', name: 'USB-C Hub', category: 'Accessories', price: 39.99, stock: 200, status: 'In Stock' },
  { id: 'p-5', name: 'Laptop Stand', category: 'Accessories', price: 29.0, stock: 0, status: 'Out of Stock' },
  { id: 'p-6', name: '4K Webcam', category: 'Peripherals', price: 79.99, stock: 60, status: 'In Stock' },
  { id: 'p-7', name: 'Noise-Cancelling Headset', category: 'Peripherals', price: 149.99, stock: 8, status: 'Low Stock' },
  { id: 'p-8', name: 'Desk Lamp', category: 'Office', price: 19.5, stock: 300, status: 'In Stock' },
  { id: 'p-9', name: 'Ergonomic Chair', category: 'Office', price: 349.0, stock: 5, status: 'Low Stock' },
  { id: 'p-10', name: 'Standing Desk', category: 'Office', price: 499.0, stock: 3, status: 'Low Stock' },
  { id: 'p-11', name: 'External SSD 1TB', category: 'Storage', price: 109.99, stock: 75, status: 'In Stock' },
  { id: 'p-12', name: 'Wireless Charger', category: 'Accessories', price: 22.0, stock: 0, status: 'Out of Stock' },
  { id: 'p-13', name: 'Bluetooth Speaker', category: 'Peripherals', price: 59.99, stock: 40, status: 'In Stock' },
  { id: 'p-14', name: 'Graphics Tablet', category: 'Peripherals', price: 199.0, stock: 15, status: 'In Stock' },
  { id: 'p-15', name: 'Cable Organizer', category: 'Office', price: 9.99, stock: 500, status: 'In Stock' },
  { id: 'p-16', name: 'Docking Station', category: 'Accessories', price: 129.0, stock: 22, status: 'In Stock' },
  { id: 'p-17', name: 'Portable Monitor', category: 'Displays', price: 179.0, stock: 0, status: 'Out of Stock' },
  { id: 'p-18', name: 'Mesh Wi-Fi Router', category: 'Networking', price: 149.0, stock: 30, status: 'In Stock' },
  { id: 'p-19', name: 'Smart Plug', category: 'Networking', price: 14.99, stock: 90, status: 'In Stock' },
  { id: 'p-20', name: 'Surge Protector', category: 'Office', price: 24.99, stock: 150, status: 'In Stock' },
  { id: 'p-21', name: 'Laptop Sleeve', category: 'Accessories', price: 17.5, stock: 80, status: 'In Stock' },
  { id: 'p-22', name: 'Ring Light', category: 'Peripherals', price: 34.0, stock: 6, status: 'Low Stock' },
  { id: 'p-23', name: 'Whiteboard', category: 'Office', price: 45.0, stock: 10, status: 'Low Stock' },
  { id: 'p-24', name: 'HDMI Cable', category: 'Accessories', price: 8.99, stock: 400, status: 'In Stock' },
  { id: 'p-25', name: 'Portable SSD Enclosure', category: 'Storage', price: 15.99, stock: 55, status: 'In Stock' },
];
