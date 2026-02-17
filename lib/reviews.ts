import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/**
 * Shape of a user review as returned by getReviewsByUserId.
 * Includes the product the review belongs to.
 */
export type UserReviewWithProduct = Prisma.ReviewGetPayload<{
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
    product: {
      select: {
        id: true;
        name: true;
        slug: true;
        images: true;
      };
    };
  };
}>;

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
 * Obtiene todas las reseñas de un usuario, paginadas.
 * Incluye datos del producto asociado (nombre, slug, imagen).
 * Ordenadas por fecha de creación descendente.
 *
 * @param userId - ID del usuario
 * @param page - Número de página (1-based)
 * @param pageSize - Cantidad de reseñas por página
 */
export async function getReviewsByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<{ reviews: UserReviewWithProduct[]; total: number }> {
  try {
    const skip = (page - 1) * pageSize;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          userId,
          parentId: null, // Solo reseñas raíz, no respuestas
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
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
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: {
          userId,
          parentId: null,
        },
      }),
    ]);

    return { reviews, total };
  } catch (error) {
    console.error("Error fetching reviews for user", userId, error);
    return { reviews: [], total: 0 };
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
