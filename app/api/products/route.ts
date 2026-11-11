import prisma from "@/lib/prisma";

// Handle การเพิ่มข้อมูลลงตาราง (POST -> Create)
export async function POST(request: Request) {
  //แตกข้อมูลที่ส่งมาจาก client ซึ่งเป็น JSON มาเป็น Object เพื่อใช้ในงานต่อไป
  const body = await request.json();

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //เพิ่มข้อมูลลงตารางในฐานข้อมูล
    const result = await prisma.product.create({
      // เอาข้อมูลใน body กำหนดให้กับแต่ละ column ในตาราง
      data: {
        proName: body.proName,
        proPrice: body.proPrice,
        proQuantity: body.proQuantity,
        proDescription: body.proDescription,
      },
    });

    //เพิ่มข้อมูลเรียบร้อยแล้วส่งผลการทำงานกลับไปยัง client/user
    return Response.json(result, { status: 201 });
  } catch (error) {
    //เกิดข้อผิดพลาดในการเพิ่มข้อมูล
    console.error("Failed for: ", error);
    return Response.json(
      { message: "พบข้อผิดพลาดในการเพิ่มข้อมูล" },
      { status: 500 },
    );
  }
}

// Handle การดึงข้อมูลทั้งหมดจากตาราง (GET -> Read) แต่มีเงื่อนไขด้วย
export async function GET(request: Request) {
  //สร้างตัวแปรเก็บข้อมูล query string ที่ส่งมา
  const url = new URL(request.url);
  const proName = url.searchParams.get("proName")?.trim();
  const proDescription = url.searchParams.get("proDescription")?.trim();

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //เพิ่มเงื่อนไขในการตรวจสอบเพื่อ ดึงข้อมูล
    //โดยตรวจสอบว่า proName หรือ proDescription มีค่าหรือไม่
    if (proName || proDescription) {
      //ดึงข้อมูลแบบมีเงื่อนไข ที่ไม่ใช่ PK-id (ชื่อสินค้ามีคำค้น และ/หรือ รายละเอียดมีคำค้น)
      //ถ้าไม่ได้ส่งคำค้นตัวไหนมา ให้ใช้ {} ซึ่งหมายถึงไม่มีเงื่อนไขสำหรับตัวนั้น
      const result = await prisma.product.findMany({
        where: {
          AND: [
            proName ? { proName: { contains: proName } } : {},
            proDescription ? { proDescription: { contains: proDescription } } : {},
          ],
        },
        orderBy: { proName: "asc" },
      });

      //ตรวจสอบผลลัพธ์ว่ามีข้อมูลหรือไม่
      if (result.length === 0) {
        return Response.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
      }

      //ดึงข้อมูลเรียบร้อยแล้วส่งผลการทำงานกลับไปยัง client/user
      return Response.json(result, { status: 200 });
    }

    //ดึงข้อมูลทั้งหมดจากตาราง (ไม่มีเงื่อนไขในการดึง) เรียงตามชื่อสินค้า
    const result = await prisma.product.findMany({
      orderBy: { proName: "asc" },
    });

    //ตรวจสอบผลลัพธ์ว่ามีข้อมูลหรือไม่
    if (result.length === 0) {
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

// Handle การแก้ไขข้อมูลแบบมีเงื่อนไข ที่ไม่ใช่ PK-id (PUT -> Update)
export async function PUT(request: Request) {
  //สร้างตัวแปรเก็บข้อมูล query string ที่ส่งมา
  const url = new URL(request.url);
  const proName = url.searchParams.get("proName")?.trim();

  //ต้องระบุ proName เสมอ ถ้าไม่มีจะไม่แก้ไขข้อมูล (กันแก้ข้อมูลทั้งตาราง)
  if (!proName) {
    return Response.json({ message: "ต้องระบุ proName" }, { status: 400 });
  }

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //แตกข้อมูลที่ส่งมาจาก client ซึ่งเป็น JSON มาเป็น Object เพื่อใช้ในงานต่อไป
    const body = await request.json();

    //แก้ไขข้อมูลทุกแถวที่ชื่อสินค้าตรงกับ proName
    const result = await prisma.product.updateMany({
      where: { proName },
      // เอาข้อมูลใน body กำหนดให้กับแต่ละ column ในตาราง
      data: {
        proPrice: body.proPrice,
        proQuantity: body.proQuantity,
        proDescription: body.proDescription,
      },
    });

    //ตรวจสอบผลลัพธ์ว่ามีข้อมูลถูกแก้ไขหรือไม่ (count คือจำนวนแถวที่ถูกแก้ไข)
    if (result.count === 0) {
      return Response.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
    }

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

// Handle การลบข้อมูลแบบมีเงื่อนไข ที่ไม่ใช่ PK-id (DELETE)
export async function DELETE(request: Request) {
  //สร้างตัวแปรเก็บข้อมูล query string ที่ส่งมา
  const url = new URL(request.url);
  const proName = url.searchParams.get("proName")?.trim();

  //ต้องระบุ proName เสมอ ถ้าไม่มีจะไม่ลบข้อมูล (กันลบข้อมูลทั้งตาราง)
  if (!proName) {
    return Response.json({ message: "ต้องระบุ proName" }, { status: 400 });
  }

  // handle ข้อผิดพลาดที่อาจจะเกิดขึ้นในการทำงาน
  try {
    //ลบข้อมูลทุกแถวที่ชื่อสินค้าตรงกับ proName
    const result = await prisma.product.deleteMany({
      where: { proName },
    });

    //ตรวจสอบผลลัพธ์ว่ามีข้อมูลถูกลบหรือไม่ (count คือจำนวนแถวที่ถูกลบ)
    if (result.count === 0) {
      return Response.json({ message: "ไม่พบข้อมูล" }, { status: 404 });
    }

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
