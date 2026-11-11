// ไฟล์นี้เป็นตัวกลางระหว่างการทำงานของ Next กับ MySQL ผ่าน Prisma
// ค่าเชื่อมต่ออ่านจากไฟล์ .env (DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME)
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  return new PrismaClient({ adapter });
}

// เก็บ client ไว้ที่ globalThis เพื่อไม่ให้สร้างใหม่ทุกครั้งที่ hot reload ตอน dev
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
