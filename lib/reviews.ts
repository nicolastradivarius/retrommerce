import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/**
 * Shape of a review as returned by the query functions.
 * Includes the user who wrote it and (for root reviews) nested replies.
 */
export type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
        role: true;
      };
    };
    replies: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            avatar: true;
            role: true;
          };
        };
      };
    };
  };
}>;

/**
 * Obtiene todas las reseñas raíz (sin parentId) de un producto,
 * con sus respuestas de un solo nivel y los datos del usuario autor.
 * Ordenadas por fecha de creación descendente.
 *
 * @param productId - ID del producto
 */
export async function getReviewsByProductId(
  productId: string,
): Promise<ReviewWithUser[]> {
  try {
    return await prisma.review.findMany({
      where: {
        productId,
        parentId: null, // Solo reseñas raíz
      },
      orderBy: { createdAt: "desc" },
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
  } catch (error) {
    console.error("Error fetching reviews for product", productId, error);
    return [];
  }
}

/**
 * Obtiene una reseña por su ID, incluyendo el usuario y el producto asociado.
 * Útil para la funcionalidad de compartir (verificar a qué producto pertenece)
 * y para validaciones en la API.
 *
 * @param reviewId - ID de la reseña
 */
export async function getReviewById(reviewId: string) {
  try {
    return await prisma.review.findUnique({
      where: { id: reviewId },
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
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching review", reviewId, error);
    return null;
  }
}
