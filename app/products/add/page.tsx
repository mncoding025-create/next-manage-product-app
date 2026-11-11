"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateProductInput } from "@/lib/products";

export default function AddProductPage() {
  //ใช้ router สำหรับเปลี่ยนหน้าหลังบันทึกเสร็จ
  const router = useRouter();

  //สร้าง state เก็บค่าในฟอร์ม (เก็บเป็นข้อความก่อน แล้วค่อยแปลงเป็นตัวเลขตอนบันทึก)
  const [proName, setProName] = useState<string>("");
  const [proPrice, setProPrice] = useState<string>("");
  const [proQuantity, setProQuantity] = useState<string>("");
  const [proDescription, setProDescription] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  //บันทึกสินค้าใหม่ (POST -> Create)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    //ตรวจสอบข้อมูลในฟอร์มก่อนส่งไปยัง API
    const checked = validateProductInput({
      proName,
      proPrice,
      proQuantity,
      proDescription,
    });
    if (!checked.ok) {
      setError(checked.error);
      return;
    }

    setSaving(true);

    // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
    try {
      //ส่งข้อมูลไปเพิ่มในตาราง โดยแปลงเป็น JSON
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.data),
      });

      //ตรวจสอบผลการเพิ่มข้อมูล
      if (res.status !== 201) {
        const data = await res.json();
        setError(data.message ?? "พบข้อผิดพลาดในการเพิ่มข้อมูล");
        return;
      }

      //เพิ่มข้อมูลเรียบร้อยแล้วกลับไปหน้าแสดงสินค้าทั้งหมด
      alert("เพิ่มสินค้าเรียบร้อยแล้ว");
      router.push("/");
    } catch (error) {
      console.error("Failed for: ", error);
      setError("พบข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">เพิ่มสินค้า</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-medium">ชื่อสินค้า</span>
          <input
            type="text"
            value={proName}
            onChange={(e) => setProName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">ราคา</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={proPrice}
            onChange={(e) => setProPrice(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">จำนวน</span>
          <input
            type="number"
            min="0"
            step="1"
            value={proQuantity}
            onChange={(e) => setProQuantity(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">รายละเอียด</span>
          <textarea
            value={proDescription}
            onChange={(e) => setProDescription(e.target.value)}
            rows={3}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </label>

        {/* แสดงข้อความเมื่อเกิดข้อผิดพลาด */}
        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <Link
            href="/"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </form>
    </main>
  );
}
