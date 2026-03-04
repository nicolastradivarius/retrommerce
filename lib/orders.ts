import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/**
 * Shape of an order as returned by getOrdersByUserId.
 * Includes line items with product info and the shipping address.
 */
export type OrderWithItemsAndAddress = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            slug: true;
            images: true;
          };
        };
      };
    };
    address: {
      select: {
        fullName: true;
        street: true;
        city: true;
        state: true;
        zipCode: true;
        country: true;
      };
    };
  };
}>;

/**
 * Obtiene todas las órdenes de un usuario, paginadas.
 * Incluye los items con datos del producto y la dirección de envío.
 * Ordenadas por fecha de creación descendente (más recientes primero).
 *
 * @param userId - ID del usuario
 * @param page - Número de página (1-based)
 * @param pageSize - Cantidad de órdenes por página
 */
export async function getOrdersByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<{ orders: OrderWithItemsAndAddress[]; total: number }> {
  try {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
          address: {
            select: {
              fullName: true,
              street: true,
              city: true,
              state: true,
              zipCode: true,
              country: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total };
  } catch (error) {
    console.error("Error fetching orders for user", userId, error);
    return { orders: [], total: 0 };
  }
}
