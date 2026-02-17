import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * PUT /api/reviews/[id]
 * Edita el contenido de una reseña existente.
 * Body: { content: string }
 *
 * Permisos:
 * - El autor de la reseña puede editarla
 * - Un usuario con rol ADMIN puede editar cualquier reseña
 * - El publicador del producto NO tiene privilegios especiales
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { content } = body;

    // Validar contenido
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "El contenido de la reseña es requerido" },
        { status: 400 },
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: "El contenido no puede superar los 2000 caracteres" },
        { status: 400 },
      );
    }

    // Buscar la reseña existente
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Reseña no encontrada" },
        { status: 404 },
      );
    }

    // Verificar permisos: solo el autor o un admin pueden editar
    const isAuthor = existingReview.userId === userPayload.sub;
    const isAdmin = userPayload.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para editar esta reseña" },
        { status: 403 },
      );
    }

    // Actualizar la reseña
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reseña" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Elimina una reseña existente.
 * Si la reseña es raíz y tiene respuestas, las respuestas se eliminan en cascada
 * (definido en el schema de Prisma con onDelete: Cascade).
 *
 * Permisos:
 * - El autor de la reseña puede eliminarla
 * - Un usuario con rol ADMIN puede eliminar cualquier reseña
 * - El publicador del producto NO tiene privilegios especiales
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar la reseña existente
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Reseña no encontrada" },
        { status: 404 },
      );
    }

    // Verificar permisos: solo el autor o un admin pueden eliminar
    const isAuthor = existingReview.userId === userPayload.sub;
    const isAdmin = userPayload.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta reseña" },
        { status: 403 },
      );
    }

    // Eliminar la reseña (las respuestas se eliminan en cascada)
    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Error al eliminar la reseña" },
      { status: 500 },
    );
  }
}
