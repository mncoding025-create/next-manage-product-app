"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/products";

type FormState = {
  proName: string;
  proPrice: string;
  proQuantity: string;
  proDescription: string;
};

const emptyForm: FormState = {
  proName: "",
  proPrice: "",
  proQuantity: "",
  proDescription: "",
};

const baht = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900";

export default function ProductManager() {
  const [allProducts, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ค้นหาโดยกรองจากรายการที่โหลดมาแล้ว (ตามชื่อหรือรายละเอียด)
  const keyword = search.trim().toLowerCase();
  const products = keyword
    ? allProducts.filter(
        (p) =>
          p.proName.toLowerCase().includes(keyword) ||
          p.proDescription.toLowerCase().includes(keyword),
      )
    : allProducts;

  // โหลดรายการสินค้าทั้งหมดจาก GET /api/products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      // API ตอบ 404 เมื่อยังไม่มีสินค้าเลย ให้แสดงเป็นรายการว่าง
      if (res.status === 404) {
        setProducts([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "โหลดข้อมูลไม่สำเร็จ");
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดรายการสินค้าครั้งแรกตอนเปิดหน้า
  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      proName: p.proName,
      proPrice: String(p.proPrice),
      proQuantity: String(p.proQuantity),
      proDescription: p.proDescription,
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const isEdit = editingId !== null;
    try {
      const res = await fetch(
        isEdit ? `/api/products/${editingId}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proName: form.proName.trim(),
            proPrice: Number(form.proPrice),
            proQuantity: Number(form.proQuantity),
            proDescription: form.proDescription.trim(),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "บันทึกไม่สำเร็จ");

      resetForm();
      await loadProducts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!window.confirm(`ต้องการลบ "${p.proName}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "ลบไม่สำเร็จ");

      if (editingId === p.id) resetForm();
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    }
  }

  const totalValue = products.reduce(
    (sum, p) => sum + p.proPrice * p.proQuantity,
    0,
  );

  return (
    <div className="space-y-8">
      {/* ฟอร์มเพิ่ม / แก้ไขสินค้า */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId !== null ? `แก้ไขสินค้า (รหัส ${editingId})` : "เพิ่มสินค้าใหม่"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">ชื่อสินค้า *</span>
            <input
              className={inputClass}
              value={form.proName}
              onChange={(e) => setForm({ ...form, proName: e.target.value })}
              placeholder="เช่น เมาส์ไร้สาย"
              maxLength={191}
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">ราคา (บาท) *</span>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.proPrice}
              onChange={(e) => setForm({ ...form, proPrice: e.target.value })}
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">จำนวน *</span>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={form.proQuantity}
              onChange={(e) => setForm({ ...form, proQuantity: e.target.value })}
              required
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">รายละเอียด</span>
            <textarea
              className={inputClass}
              rows={3}
              value={form.proDescription}
              onChange={(e) => setForm({ ...form, proDescription: e.target.value })}
              placeholder="รายละเอียดสินค้า (ไม่เกิน 191 ตัวอักษร)"
              maxLength={191}
            />
          </label>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 dark:bg-red-950 dark:text-red-300">
              {formError}
            </p>
          )}

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : editingId !== null ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </section>

      {/* รายการสินค้า */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">รายการสินค้า</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {products.length} รายการ · มูลค่าสต็อกรวม {baht.format(totalValue)}
            </p>
          </div>
          <input
            className={`${inputClass} sm:max-w-xs`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหรือรายละเอียดสินค้า..."
          />
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-3 py-2 font-medium">รหัส</th>
                <th className="px-3 py-2 font-medium">ชื่อสินค้า</th>
                <th className="px-3 py-2 font-medium">รายละเอียด</th>
                <th className="px-3 py-2 text-right font-medium">ราคา</th>
                <th className="px-3 py-2 text-right font-medium">จำนวน</th>
                <th className="px-3 py-2 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading && allProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    {search ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้า ลองเพิ่มสินค้าจากฟอร์มด้านบน"}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-3 py-2 text-slate-500">{p.id}</td>
                    <td className="px-3 py-2 font-medium">{p.proName}</td>
                    <td className="max-w-xs truncate px-3 py-2" title={p.proDescription}>
                      {p.proDescription || "-"}
                    </td>
                    <td className="px-3 py-2 text-right">{baht.format(p.proPrice)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={
                          p.proQuantity === 0
                            ? "font-medium text-red-600"
                            : p.proQuantity < 10
                              ? "font-medium text-amber-600"
                              : ""
                        }
                      >
                        {p.proQuantity}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(p)}
                        className="mr-3 text-blue-600 hover:underline"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-red-600 hover:underline"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
