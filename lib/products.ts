import 'server-only';

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/**
 * Product shape used across the app for product list items.
 * Exported so pages/components can reuse the exact same selection/type.
 */
export type ProductListItem = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    price: true;
    originalPrice: true;
    year: true;
    manufacturer: true;
    stock: true;
    images: true;
    featured: true;
  };
}>;

/**
 * Obtiene productos marcados como `featured`.
 * Opcionalmente acepta un `take` para limitar la cantidad (útil para landings).
 */
export async function getFeaturedProducts({
  take,
}: {
  take?: number;
} = {}): Promise<ProductListItem[]> {
  return prisma.product.findMany({
    where: { featured: true },
    take,
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
  });
}

/**
 * Obtiene productos no destacados con paginación.
 * - `skip` y `take` permiten paginar (skip = offset).
 */
export async function getProducts({
  skip = 0,
  take = 10,
}: {
  skip?: number;
  take?: number;
} = {}): Promise<ProductListItem[]> {
  return prisma.product.findMany({
    where: { featured: false },
    skip,
    take,
    orderBy: { createdAt: "desc" },
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
  });
}

/**
 * Cuenta la cantidad total de productos no destacados (útil para paginación).
 */
export async function getProductsCount(): Promise<number> {
  return prisma.product.count({ where: { featured: false } });
}
