import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/addresses — lista las direcciones del usuario autenticado
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(addresses);
}

// POST /api/user/addresses — crea una nueva dirección
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fullName, street, city, state, zipCode, country, phone, isDefault } =
    body;

  if (!fullName || !street || !city || !state || !zipCode || !country) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Si la nueva dirección es default, quitarle el default a las demás
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.sub },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.sub,
      fullName,
      street,
      city,
      state,
      zipCode,
      country,
      phone: phone ?? null,
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(address, { status: 201 });
}
