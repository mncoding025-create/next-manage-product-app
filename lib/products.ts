// ชนิดข้อมูลที่ API ส่งให้หน้าเว็บ (วันที่จะถูกแปลงเป็น string ตอนส่งเป็น JSON)
export type Product = {
  id: number;
  proName: string;
  proPrice: number;
  proQuantity: number;
  proDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  proName: string;
  proPrice: number;
  proQuantity: number;
  proDescription: string;
};

type ValidationResult =
  | { ok: true; data: ProductInput }
  | { ok: false; error: string };

// String ใน Prisma + MySQL คือ VARCHAR(191) จึงจำกัดความยาวไว้ที่ 191 ตัวอักษร
const MAX_LENGTH = 191;

// ตรวจสอบข้อมูลที่ส่งมาจากฟอร์มก่อนบันทึกลงฐานข้อมูล
export function validateProductInput(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "รูปแบบข้อมูลไม่ถูกต้อง" };
  }

  const { proName, proPrice, proQuantity, proDescription } = body as Record<
    string,
    unknown
  >;

  const name = typeof proName === "string" ? proName.trim() : "";
  if (!name) return { ok: false, error: "กรุณากรอกชื่อสินค้า" };
  if (name.length > MAX_LENGTH) {
    return { ok: false, error: `ชื่อสินค้ายาวเกินไป (สูงสุด ${MAX_LENGTH} ตัวอักษร)` };
  }

  const description = typeof proDescription === "string" ? proDescription.trim() : "";
  if (description.length > MAX_LENGTH) {
    return { ok: false, error: `รายละเอียดยาวเกินไป (สูงสุด ${MAX_LENGTH} ตัวอักษร)` };
  }

  const price = Number(proPrice);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "ราคาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป" };
  }

  const quantity = Number(proQuantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: "จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป" };
  }

  return {
    ok: true,
    data: {
      proName: name,
      proPrice: Math.round(price * 100) / 100,
      proQuantity: quantity,
      proDescription: description,
    },
  };
}

// แปลง id จาก URL ให้เป็นจำนวนเต็มบวก ถ้าไม่ถูกต้องจะคืน null
export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
