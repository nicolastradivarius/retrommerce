import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Tipo para un producto en la lista de favoritos.
 * Los precios se serializan a strings para que sean compatibles con el frontend.
 */
export type FavoriteProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  originalPrice: string;
  year: number | null;
  manufacturer: string | null;
  stock: number;
  images: string[];
  featured: boolean;
};

/**
 * Obtiene los ids de producto marcados como favoritos por un usuario.
 * Retorna un `Set<string>` con los `productId` (vacío si no hay userId o en caso de error).
 *
 * @param userId - ID del usuario (puede ser undefined/null)
 */
export async function getFavoriteProductIdsByUser(
  userId?: string | null,
): Promise<Set<string>> {
  if (!userId) return new Set();

  try {
    const rows = await prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });

    return new Set(rows.map((r) => String(r.productId)));
  } catch (error) {
    // Log y retorno seguro para que la aplicación no rompa la carga de la página
    console.error(
      "Error fetching favorite product ids for user",
      userId,
      error,
    );
    return new Set();
  }
}

/**
 * Verifica si un producto está marcado como favorito por un usuario.
 * Retorna `true` si el usuario tiene el producto en favoritos, `false` en caso contrario.
 *
 * @param userId - ID del usuario (puede ser undefined/null)
 * @param productId - ID del producto
 */
export async function isProductFavorite(
  userId?: string | null,
  productId?: string,
): Promise<boolean> {
  if (!userId || !productId) return false;

  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: { id: true },
    });

    return Boolean(favorite);
  } catch (error) {
    console.error(
      "Error checking favorite status for user",
      userId,
      "product",
      productId,
      error,
    );
    return false;
  }
}

/**
 * Obtiene los productos favoritos de un usuario con precios serializados a strings.
 *
 * @param userId - ID del usuario
 * @returns Array de productos favoritos con precios como strings (compatibles con ProductCard)
 */
export async function getFavoriteProductsByUser(
  userId: string,
): Promise<FavoriteProduct[]> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            originalPrice: true,
            year: true,
            manufacturer: true,
            stock: true,
            images: true,
            featured: true,
          },
        },
      },
    });

    // Serializar los precios Decimal a strings
    return favorites.map((favorite) => ({
      ...favorite.product,
      price: favorite.product.price.toString(),
      originalPrice: favorite.product.originalPrice.toString(),
    }));
  } catch (error) {
    console.error("Error fetching favorite products for user", userId, error);
    return [];
  }
}
