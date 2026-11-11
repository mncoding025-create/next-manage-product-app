import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบจัดการสินค้า",
  description: "แอปจัดการสินค้า (เพิ่ม แก้ไข ลบ) ด้วย Next.js และ MySQL",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
