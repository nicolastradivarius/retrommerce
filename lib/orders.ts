import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/**
 * Shape of an order as returned by getOrderById.
 * Includes line items with product info and the full shipping address.
 */
export type OrderResult = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            images: true;
          };
        };
      };
    };
    address: true;
  };
}>;

/**
 * Fetches a single order by ID, verifying it belongs to the given user.
 * Returns null if the order does not exist or belongs to a different user.
 *
 * @param orderId - The order's primary key
 * @param userId  - The authenticated user's ID (used as ownership guard)
 */
export async function getOrderById(
  orderId: string,
  userId: string,
): Promise<OrderResult | null> {
  try {
    return await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true },
            },
          },
        },
        address: true,
      },
    });
  } catch (error) {
    console.error("Error fetching order", orderId, error);
    return null;
  }
}

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
