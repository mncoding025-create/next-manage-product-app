"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

//กำหนดชนิดข้อมูลของสินค้า 1 รายการ (ตรงกับ column ในตาราง Product)
type Product = {
  id: number;
  proName: string;
  proPrice: number;
  proQuantity: number;
  proDescription: string;
};

//ดึงข้อมูลสินค้าทั้งหมดจาก API (ใช้ทั้งตอนเปิดหน้าและตอนลบเสร็จ)
async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");

  //API ตอบ 404 เมื่อยังไม่มีสินค้าในตาราง ให้ถือว่าเป็นรายการว่าง ไม่ใช่ error
  if (res.status === 404) {
    return [];
  }

  //ตรวจสอบว่าดึงข้อมูลสำเร็จหรือไม่
  if (!res.ok) {
    throw new Error("พบข้อผิดพลาดในการดึงข้อมูล");
  }

  return res.json();
}

export default function Home() {
  //สร้าง state เก็บรายการสินค้า และสถานะการโหลดข้อมูล
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  //สร้าง state เก็บข้อความ error (null = ไม่มี error)
  const [error, setError] = useState<string | null>(null);

  //ดึงข้อมูลสินค้าครั้งแรกตอนเปิดหน้า
  useEffect(() => {
    async function fetchProducts() {
      // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        //เกิดข้อผิดพลาดในการดึงข้อมูล ให้เก็บข้อความไว้แสดงบนหน้า
        console.error("Failed for: ", error);
        setError(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${error}`);
      } finally {
        //โหลดเสร็จแล้ว (ไม่ว่าจะสำเร็จหรือไม่) ให้เลิกแสดงข้อความกำลังโหลด
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  //ลบสินค้าตาม id แล้วโหลดรายการใหม่
  async function handleDelete(id: number) {
    //ถามยืนยันก่อนลบ
    if (!confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) {
      return;
    }

    // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

      //ตรวจสอบผลการลบข้อมูล
      if (!res.ok) {
        alert("พบข้อผิดพลาดในการลบข้อมูล");
        return;
      }

      alert("ลบสินค้าเรียบร้อยแล้ว");

      //โหลดรายการสินค้าใหม่หลังลบเสร็จ
      setProducts(await getProducts());
    } catch (error) {
      console.error("Failed for: ", error);
      alert("พบข้อผิดพลาดในการลบข้อมูล");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Show All Product</h1>

        {/* ปุ่มไปหน้าเพิ่มสินค้า */}
        <Link
          href="/products/add"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          เพิ่มสินค้า
        </Link>
      </div>

      {/* แสดงข้อความ error เมื่อมีค่า */}
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* แสดงข้อความระหว่างโหลดข้อมูล ถ้าโหลดเสร็จแล้วแสดงตารางสินค้า */}
      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 px-3 py-2">รหัส</th>
                <th className="border border-gray-300 px-3 py-2">ชื่อ</th>
                <th className="border border-gray-300 px-3 py-2 text-right">ราคา</th>
                <th className="border border-gray-300 px-3 py-2 text-right">จำนวน</th>
                <th className="border border-gray-300 px-3 py-2">รายละเอียด</th>
                <th className="border border-gray-300 px-3 py-2 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {/* ถ้ายังไม่มีสินค้า ให้แสดงข้อความแจ้ง */}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                    ยังไม่มีสินค้า
                  </td>
                </tr>
              )}

              {/* วนแสดงสินค้าทีละแถว */}
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="border border-gray-300 px-3 py-2">{product.id}</td>
                  <td className="border border-gray-300 px-3 py-2">{product.proName}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {product.proPrice.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {product.proQuantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {product.proDescription}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="flex justify-center gap-2">
                      {/* ลิงก์ไปหน้าแก้ไขสินค้าตาม id */}
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                      >
                        แก้ไข
                      </Link>
                      {/* ปุ่มลบสินค้า */}
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
