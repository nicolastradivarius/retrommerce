import "server-only";

// Archivo central para consultas de productos y categorías usando Prisma ORM.
// Incluye lógica para filtros dinámicos y paginación, aprovechando el operador spread (...).

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
// Este tipo define la forma base de un producto para listados, reutilizable en toda la app.

/**
 * Obtiene productos marcados como `featured`.
 * Opcionalmente acepta un `take` para limitar la cantidad (útil para landings).
 * Utiliza un filtro simple (featured: true).
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
 * Obtiene productos no destacados con paginación y filtros.
 * - `skip` y `take` permiten paginar (skip = offset).
 * - `search` filtra por nombre de producto (búsqueda parcial).
 * - `categoryIds` filtra por IDs de categorías.
 * - `minPrice` y `maxPrice` filtran por rango de precio.
 * - `minYear` y `maxYear` filtran por rango de año.
 *
 * La construcción del objeto `where` es dinámica usando el operador spread (...):
 * - Solo se agregan los filtros si los parámetros existen.
 * - Esto mantiene el objeto limpio y evita condiciones innecesarias.
 */
export async function getProducts({
  skip = 0,
  take = 10,
  search,
  categoryIds,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
}: {
  skip?: number;
  take?: number;
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
} = {}): Promise<ProductListItem[]> {
  // El objeto `where` se arma dinámicamente. Cada bloque con ... agrega filtros solo si el valor existe.
  // Ejemplo: si search existe, se agrega el filtro de nombre; si no, no se agrega nada.
  const where: Prisma.ProductWhereInput = {
    featured: false,
    // Filtro por nombre (búsqueda parcial, insensible a mayúsculas/minúsculas)
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive" as Prisma.QueryMode,
      },
    }),
    // Filtro por categorías (si se pasan IDs)
    ...(categoryIds &&
      categoryIds.length > 0 && {
        categoryId: {
          in: categoryIds,
        },
      }),
    // Filtro por rango de precio
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    // Filtro por rango de año
    ...((minYear !== undefined || maxYear !== undefined) && {
      year: {
        ...(minYear !== undefined && { gte: minYear }),
        ...(maxYear !== undefined && { lte: maxYear }),
      },
    }),
  };

  return prisma.product.findMany({
    where,
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
 * Soporta los mismos filtros que getProducts.
 *
 * La lógica de filtros es idéntica a getProducts, usando spread para armar el objeto `where` solo con los filtros activos.
 */
export async function getProductsCount({
  search,
  categoryIds,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
}: {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
} = {}): Promise<number> {
  // Igual que en getProducts: solo se agregan filtros si los parámetros existen.
  const where: Prisma.ProductWhereInput = {
    featured: false,
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive" as Prisma.QueryMode,
      },
    }),
    ...(categoryIds &&
      categoryIds.length > 0 && {
        categoryId: {
          in: categoryIds,
        },
      }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...((minYear !== undefined || maxYear !== undefined) && {
      year: {
        ...(minYear !== undefined && { gte: minYear }),
        ...(maxYear !== undefined && { lte: maxYear }),
      },
    }),
  };

  return prisma.product.count({ where });
}

/**
 * Obtiene todas las categorías disponibles.
 * Simple consulta de todas las categorías, ordenadas alfabéticamente.
 */
export async function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });
}
