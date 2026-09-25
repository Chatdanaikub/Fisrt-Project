import Dexie from 'dexie';

// สร้างฐานข้อมูล Dexie ตามสไลด์หน้า 9 ของวิชา IG342 Week 7
export const db = new Dexie('InventoryDatabase');

// กำหนด Schema ของ Table: items
// ++id คือ auto-increment ID
// name คือ ชื่อสินค้า
// quantity คือ จำนวนสินค้า
db.version(1).stores({
  items: '++id, name, quantity'
});
