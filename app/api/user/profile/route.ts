import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import sharp from "sharp";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        avatarUpdatedAt: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    let name: string | null | undefined;
    let email: string | undefined;
    let phone: string | null | undefined;
    let avatar: string | null | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const rawName = formData.get("name");
      if (typeof rawName === "string") {
        const trimmed = rawName.trim();
        name = trimmed.length > 0 ? trimmed : null;
      }

      const rawEmail = formData.get("email");
      if (typeof rawEmail === "string") {
        const trimmed = rawEmail.trim();
        if (trimmed.length > 0) {
          email = trimmed;
        }
      }

      const rawPhone = formData.get("phone");
      if (typeof rawPhone === "string") {
        const trimmed = rawPhone.trim();
        phone = trimmed.length > 0 ? trimmed : null;
      }

      const avatarFile = formData.get("avatar");
      if (avatarFile instanceof File) {
        // Check 30-day avatar change limit
        const currentUser = await prisma.user.findUnique({
          where: { id: userPayload.sub },
          select: { avatarUpdatedAt: true },
        });

        if (currentUser?.avatarUpdatedAt) {
          const lastChangeDate = new Date(currentUser.avatarUpdatedAt);
          const now = new Date();
          const daysSinceLastChange = Math.floor(
            (now.getTime() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceLastChange < 30) {
            const daysRemaining = 30 - daysSinceLastChange;
            return NextResponse.json(
              {
                error: `Puedes cambiar tu foto de perfil en ${daysRemaining} día(s)`,
                daysRemaining,
              },
              { status: 429 },
            );
          }
        }

        if (!avatarFile.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "El archivo debe ser una imagen" },
            { status: 400 },
          );
        }

        // 5MB safety limit
        const maxBytes = 5 * 1024 * 1024;
        if (avatarFile.size > maxBytes) {
          return NextResponse.json(
            { error: "La imagen es demasiado grande (máx 5MB)" },
            { status: 400 },
          );
        }

        const arrayBuffer = await avatarFile.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        const optimizedBuffer = await sharp(inputBuffer)
          .rotate()
          .resize(256, 256, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        const upload = await uploadAvatarToCloudinary({
          buffer: optimizedBuffer,
          userId: userPayload.sub,
        });

        avatar = upload.url;
      }
    } else {
      const body = await request.json();
      name = body?.name;
      email = body?.email;
      phone = body?.phone;
      avatar = body?.avatar;
    }

    // If email is being changed, check it's not already taken by another user
    if (email !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== userPayload.sub) {
        return NextResponse.json(
          { error: "Este email ya está en uso por otro usuario" },
          { status: 409 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.sub },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar, avatarUpdatedAt: new Date() }),
      },
      select: {
        name: true,
        email: true,
        phone: true,
        avatar: true,
        avatarUpdatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfil" },
      { status: 500 },
    );
  }
}
