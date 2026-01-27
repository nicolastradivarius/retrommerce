import 'server-only';

import { prisma } from "@/lib/prisma";

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
    console.error("Error fetching favorite product ids for user", userId, error);
    return new Set();
  }
}
