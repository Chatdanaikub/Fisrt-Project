# IG342 Workshop - Web Application Development
**วิชา IG342 การพัฒนาแอปพลิเคชันบนอุปกรณ์เคลื่อนที่**  
**อาจารย์ผู้สอน:** อ.ณพล ศิริภิบาล  
**ผู้จัดทำ:** นายฉัตรดนัย สัตยากูล (รหัสนักศึกษา 66111059)  
**URL เผยแพร่ (GitHub Pages):** [https://chatdanaikub.github.io/Fisrt-Project/](https://chatdanaikub.github.io/Fisrt-Project/)

---

## 📌 อัปเดต Week 7: Local Storage & IndexedDB (Dexie)

ในสัปดาห์ที่ 7 นี้ ได้ทำการพัฒนาและ Upgrade แอปพลิเคชันด้วยระบบจดจำข้อมูล 2 รูปแบบตามสไลด์การเรียนการสอน:

### 1. IndexedDB (Dexie.js) — ระบบคลังสินค้า (Inventory Database)
- **ไฟล์โครงสร้างฐานข้อมูล:** `src/components/db.js`
  ```javascript
  import Dexie from 'dexie';

  export const db = new Dexie('InventoryDatabase');

  db.version(1).stores({
    items: '++id, name, quantity'
  });
  ```
- **การทำงาน:**
  - เพิ่มข้อมูลสินค้าด้วยคำสั่ง `db.items.add({ name, quantity })`
  - ลบข้อมูลสินค้าด้วยคำสั่ง `db.items.delete(id)`
  - ปรับปรุง/อัปเดตจำนวนสินค้าด้วย `db.items.update(id, { quantity })`
  - ดึงข้อมูลแบบ Reactive ทันทีด้วย `useLiveQuery(() => db.items.toArray())` จาก `dexie-react-hooks`
  - ตรวจสอบตารางและข้อมูลจริงได้ผ่าน Chrome DevTools -> Application -> Storage -> IndexedDB -> `InventoryDatabase`

### 2. Local Storage — ระบบบันทึกงาน (myTask)
- **การทำงาน:**
  - โหลดข้อมูลสิ่งที่ต้องทำเมื่อเปิดเว็บ: `JSON.parse(localStorage.getItem('tasks'))`
  - บันทึกการเปลี่ยนแปลงถาวร: `localStorage.setItem('tasks', JSON.stringify(tasks))`
  - มีฟังก์ชันเพิ่มงาน, กาถูกเมื่องานเสร็จสิ้น (Toggle done), ลบงาน, และกรองสถานะงาน

### 3. Developer Tools Storage Inspector
- แสดงข้อมูลดิบ (Live JSON preview) ของทั้ง Local Storage และ IndexedDB ภายในหน้าเว็บ
- ตารางเปรียบเทียบคุณสมบัติระหว่าง Local Storage (~5MB, Sync, String) กับ IndexedDB (Large Storage, Async, Complex Objects)

---

## 🎮 หน้าจออื่นๆ ในแอปพลิเคชัน
- **Home:** หน้าหลักสรุปภาพรวมและเส้นทางนำทาง (SPA Routing)
- **Week 7:** Workshop จัดการข้อมูลถาวร Local Storage & IndexedDB (Dexie)
- **Page 2:** Cyber Strike (3D FPS Combat Game ด้วย Three.js + Web Audio API)
- **Page 3:** Turbo Drift Racer (Car Racing Game ด้วย Three.js)
- **Page 4:** Titanium 16 Pro (3D Scroll Showcase Interactive Experience)

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. รันโหมด Development
npm run dev

# 3. Build สำหรับ Production
npm run build
```

---

## 📦 การนำขึ้น GitHub และ GitHub Pages
โปรเจกต์นี้ตั้งค่า GitHub Actions ไว้ที่ `.github/workflows/deploy.yml` เมื่อทำการ Push โค้ดขึ้น branch `main` ระบบจะทำการ Build และ Deploy ไปยัง GitHub Pages อัตโนมัติที่:
`https://chatdanaikub.github.io/Fisrt-Project/`
