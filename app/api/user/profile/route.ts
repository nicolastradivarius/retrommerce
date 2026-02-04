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
    let avatar: string | null | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const rawName = formData.get("name");
      if (typeof rawName === "string") {
        const trimmed = rawName.trim();
        name = trimmed.length > 0 ? trimmed : null;
      }

      const avatarFile = formData.get("avatar");
      if (avatarFile instanceof File) {
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
      avatar = body?.avatar;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.sub },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        name: true,
        avatar: true,
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
