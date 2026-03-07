import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "La contraseña actual es requerida" },
        { status: 400 },
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "La nueva contraseña es requerida" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña debe ser diferente a la actual" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.sub },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 },
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Error al actualizar la contraseña" },
      { status: 500 },
    );
  }
}
