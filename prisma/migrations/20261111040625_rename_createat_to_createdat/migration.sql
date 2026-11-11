-- เปลี่ยนชื่อคอลัมน์ createAt เป็น createdAt โดยไม่ลบข้อมูล
ALTER TABLE `Product` CHANGE COLUMN `createAt` `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
