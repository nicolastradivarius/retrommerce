import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/reviews
 * Crea una nueva reseña o respuesta a una reseña existente.
 * Body: { productId: string, content: string, parentId?: string }
 *
 * - Requiere autenticación (JWT)
 * - Si tiene parentId, valida que el padre exista y que NO sea ya una respuesta
 *   (para evitar respuestas anidadas de más de un nivel)
 */
export async function POST(request: NextRequest) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, content, parentId } = body;

    // Validar campos requeridos
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId es requerido" },
        { status: 400 },
      );
    }

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

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Si es una respuesta, validar que el padre exista y no sea ya una respuesta
    if (parentId) {
      const parentReview = await prisma.review.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true, productId: true },
      });

      if (!parentReview) {
        return NextResponse.json(
          { error: "Reseña padre no encontrada" },
          { status: 404 },
        );
      }

      // No permitir respuestas a respuestas (un solo nivel de profundidad)
      if (parentReview.parentId !== null) {
        return NextResponse.json(
          { error: "No se puede responder a una respuesta" },
          { status: 400 },
        );
      }

      // Verificar que la respuesta sea para el mismo producto que la reseña padre
      if (parentReview.productId !== productId) {
        return NextResponse.json(
          { error: "La respuesta debe pertenecer al mismo producto que la reseña" },
          { status: 400 },
        );
      }
    }

    // Crear la reseña o respuesta
    const review = await prisma.review.create({
      data: {
        productId,
        userId: userPayload.sub,
        content: content.trim(),
        ...(parentId && { parentId }),
      },
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

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Error al crear la reseña" },
      { status: 500 },
    );
  }
}
