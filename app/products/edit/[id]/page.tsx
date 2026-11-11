"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { validateProductInput } from "@/lib/products";

//component ย่อยที่อ่าน id จาก URL และแสดงฟอร์มแก้ไขสินค้า
//(แยกออกมาเพื่อให้ห่อด้วย Suspense ได้ เพราะ useParams ต้องรอค่า id จาก URL)
function EditProductForm() {
  //ดึงค่า id จาก URL เช่น /products/edit/3 (ใน client component ใช้ useParams)
  const { id } = useParams<{ id: string }>();
  //ตรวจสอบว่า id เป็นตัวเลขจำนวนเต็มหรือไม่ (ถ้าไม่ใช่ จะไม่ดึงข้อมูล)
  const isValidId = Number.isInteger(Number(id));
  //ใช้ router สำหรับเปลี่ยนหน้าหลังบันทึกเสร็จ
  const router = useRouter();

  //สร้าง state เก็บค่าในฟอร์ม (เก็บเป็นข้อความก่อน แล้วค่อยแปลงเป็นตัวเลขตอนบันทึก)
  const [proName, setProName] = useState<string>("");
  const [proPrice, setProPrice] = useState<string>("");
  const [proQuantity, setProQuantity] = useState<string>("");
  const [proDescription, setProDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  //สร้าง state เก็บสถานะว่าไม่พบสินค้าตาม id นี้
  const [notFound, setNotFound] = useState<boolean>(false);

  //ดึงข้อมูลสินค้าตาม id มาเติมในฟอร์มตอนเปิดหน้า
  useEffect(() => {
    //ถ้า id ไม่ใช่ตัวเลข ไม่ต้องดึงข้อมูล
    if (!isValidId) return;

    async function fetchProduct() {
      // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
      try {
        const res = await fetch(`/api/products/${id}`);

        //ตรวจสอบว่ามีสินค้านี้หรือไม่
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setError("พบข้อผิดพลาดในการดึงข้อมูล");
          return;
        }

        //เอาข้อมูลที่ได้มาใส่ในฟอร์ม
        const data = await res.json();
        setProName(data.proName);
        setProPrice(String(data.proPrice));
        setProQuantity(String(data.proQuantity));
        setProDescription(data.proDescription);
      } catch (error) {
        console.error("Failed for: ", error);
        setError("พบข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, isValidId]);

  //บันทึกการแก้ไขสินค้า (PUT -> Update)
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
      //ส่งข้อมูลไปแก้ไขในตารางตาม id โดยแปลงเป็น JSON
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.data),
      });

      //ตรวจสอบผลการแก้ไขข้อมูล
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "พบข้อผิดพลาดในการแก้ไขข้อมูล");
        return;
      }

      //แก้ไขข้อมูลเรียบร้อยแล้วกลับไปหน้าแสดงสินค้าทั้งหมด
      alert("แก้ไขสินค้าเรียบร้อยแล้ว");
      router.push("/");
    } catch (error) {
      console.error("Failed for: ", error);
      setError("พบข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">แก้ไขสินค้า (รหัส {id})</h1>

      {/* ถ้า id ไม่ใช่ตัวเลขหรือไม่พบสินค้า ให้แสดงข้อความและซ่อนฟอร์ม */}
      {/* ถ้ากำลังโหลดแสดงข้อความกำลังโหลด ถ้าโหลดเสร็จแล้วแสดงฟอร์ม */}
      {!isValidId || notFound ? (
        <div className="flex flex-col items-start gap-4">
          <p className="text-red-600">ไม่พบข้อมูลสินค้า</p>
          <Link
            href="/"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            กลับหน้าแรก
          </Link>
        </div>
      ) : loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : (
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
              {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
            <Link
              href="/"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}

//หน้าแก้ไขสินค้า: ห่อฟอร์มด้วย Suspense และแสดงข้อความกำลังโหลดระหว่างรอ
export default function EditProductPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">กำลังโหลด...</p>}>
      <EditProductForm />
    </Suspense>
  );
}
