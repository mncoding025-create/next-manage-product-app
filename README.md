# next-manage-product-app

แอปจัดการสินค้า (เพิ่ม / แก้ไข / ลบ / ค้นหา) ด้วย Next.js (App Router + TypeScript + Tailwind) และ **Prisma** เชื่อมต่อ MySQL ฐานข้อมูล `stock_product_db`

## วิธีรันบน MacBook

1. เปิด **XAMPP** แล้วกด Start ที่ **MySQL Database** (รอจนเป็นสีเขียว)
2. สร้างฐานข้อมูลเปล่า: เปิด `http://localhost/phpmyadmin` > แท็บ **SQL** > รันคำสั่งนี้

```sql
CREATE DATABASE stock_product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

3. ตรวจไฟล์ `.env` ให้ตรงกับเครื่อง (ค่าเริ่มต้นของ XAMPP: user `root`, ไม่มีรหัสผ่าน)

```
# ใช้โดย Prisma CLI
DATABASE_URL="mysql://root:@127.0.0.1:3306/stock_product_db"

# ใช้โดยแอป Next.js (lib/prisma.ts)
DATABASE_HOST="127.0.0.1"
DATABASE_PORT="3306"
DATABASE_USERNAME="root"
DATABASE_PASSWORD=""
DATABASE_NAME="stock_product_db"
```

> ใช้ `127.0.0.1` แทน `localhost` เพราะบางเครื่อง `localhost` ถูกแปลงเป็น IPv6 ทำให้ขึ้น error P1001 (Can't reach database server)

4. ติดตั้งแพ็กเกจ สร้างตาราง และสร้าง Prisma Client

```bash
npm install
npx prisma migrate dev --name create_product_table
npx prisma generate
```

5. รันแอป

```bash
npm run dev
```

6. เปิด `http://localhost:3000`

## Prisma model

ไฟล์ `prisma/schema.prisma`

```prisma
model Product {
  id             Int      @id @default(autoincrement())
  proName        String
  proPrice       Float
  proQuantity    Int
  proDescription String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

> `String` ใน MySQL คือ `VARCHAR(191)` ชื่อและรายละเอียดจึงยาวได้ไม่เกิน 191 ตัวอักษร

## โครงสร้างไฟล์

```
app/
├── page.tsx                    หน้าแรก (เรียกใช้ ProductManager)
├── layout.tsx                  โครงหน้าที่ใช้ร่วมกัน
└── api/products/
    ├── route.ts                GET (รายการ + ค้นหา), POST (เพิ่ม)
    └── [id]/route.ts           GET (1 รายการ), PUT (แก้ไข), DELETE (ลบ) ตาม id
components/
└── ProductManager.tsx          ฟอร์ม + ตารางสินค้า (Client Component)
lib/
├── prisma.ts                   สร้าง Prisma Client (ผ่าน adapter MariaDB/MySQL) อ่านค่าจาก .env
└── products.ts                 ชนิดข้อมูล Product + ตรวจสอบข้อมูลก่อนบันทึก
prisma/
└── schema.prisma               ประกาศโมเดล Product
prisma.config.ts                ตั้งค่า Prisma CLI (อ่าน DATABASE_URL จาก .env)
generated/prisma/               โค้ด Prisma Client (สร้างจาก npx prisma generate)
```

## API

| Method | URL | หน้าที่ |
|---|---|---|
| GET | `/api/products` | รายการสินค้าทั้งหมด (เรียงตามชื่อ) |
| POST | `/api/products` | เพิ่มสินค้า |
| GET | `/api/products/:id` | ดูสินค้า 1 รายการ |
| PUT | `/api/products/:id` | แก้ไขสินค้า |
| DELETE | `/api/products/:id` | ลบสินค้า |

Body ของ POST / PUT:
`{ "proName": "...", "proPrice": 100, "proQuantity": 5, "proDescription": "..." }`

## ปัญหาที่พบบ่อย

- `P1001: Can't reach database server` หรือ `ECONNREFUSED` → MySQL ยังไม่ได้ Start ใน XAMPP หรือ `DATABASE_URL` ใช้ `localhost` ให้เปลี่ยนเป็น `127.0.0.1`
- `Access denied` → แก้ user / รหัสผ่านใน `DATABASE_URL`
- `Unknown database 'stock_product_db'` → ยังไม่ได้สร้างฐานข้อมูล (ข้อ 2)
- `Cannot find module '@/generated/prisma/client'` → ยังไม่ได้รัน `npx prisma generate`
- แก้ `.env` หรือ `schema.prisma` แล้วต้องหยุด (`Ctrl + C`) และรัน `npm run dev` ใหม่
