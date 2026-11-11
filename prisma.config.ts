import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// ไฟล์ตั้งค่าของ Prisma CLI (migrate, generate, db pull ...)
// ที่อยู่ฐานข้อมูลอ่านมาจาก DATABASE_URL ในไฟล์ .env
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
