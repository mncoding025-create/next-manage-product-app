import prisma from "@/lib/prisma";

// ค่า id ที่อยู่ใน URL เช่น /api/products/3 (params ต้อง await ก่อนใช้)
type Context = { params: Promise<{ id: string }> };

// Handle การดึงข้อมูลแบบมีเงื่อนไข PK-id (GET -> Read)
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //ดึงข้อมูลสินค้า 1 รายการจาก id (ต้องแปลง id จากข้อความเป็นตัวเลขก่อน)
    const result = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    //ตรวจสอบผลลัพธ์ว่ามีข้อมูลหรือไม่
    if (!result) {
      return Response.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
    }

    //ดึงข้อมูลเรียบร้อยแล้วส่งผลการทำงานกลับไปยัง client/user
    return Response.json(result, { status: 200 });
  } catch (error) {
    //เกิดข้อผิดพลาดในการดึงข้อมูล
    console.error("Failed for: ", error);
    return Response.json(
      { message: "พบข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}

// Handle การแก้ไขข้อมูลแบบมีเงื่อนไข PK-id (PUT -> Update)
export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  //แตกข้อมูลที่ส่งมาจาก client ซึ่งเป็น JSON มาเป็น Object เพื่อใช้ในงานต่อไป
  const body = await request.json();

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //แก้ไขข้อมูลในตารางตาม id
    const result = await prisma.product.update({
      where: { id: Number(id) },
      // เอาข้อมูลใน body กำหนดให้กับแต่ละ column ในตาราง
      data: {
        proName: body.proName,
        proPrice: body.proPrice,
        proQuantity: body.proQuantity,
        proDescription: body.proDescription,
      },
    });

    //แก้ไขข้อมูลเรียบร้อยแล้วส่งผลการทำงานกลับไปยัง client/user
    return Response.json(result, { status: 200 });
  } catch (error) {
    //เกิดข้อผิดพลาดในการแก้ไขข้อมูล
    console.error("Failed for: ", error);
    return Response.json(
      { message: "พบข้อผิดพลาดในการแก้ไขข้อมูล" },
      { status: 500 },
    );
  }
}

// Handle การลบข้อมูลแบบมีเงื่อนไข PK-id (DELETE)
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //ลบข้อมูลในตารางตาม id (ได้ข้อมูลของแถวที่ถูกลบกลับมา)
    const result = await prisma.product.delete({
      where: { id: Number(id) },
    });

    //ลบข้อมูลเรียบร้อยแล้วส่งผลการทำงานกลับไปยัง client/user
    return Response.json(result, { status: 200 });
  } catch (error) {
    //เกิดข้อผิดพลาดในการลบข้อมูล
    console.error("Failed for: ", error);
    return Response.json(
      { message: "พบข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 },
    );
  }
}
