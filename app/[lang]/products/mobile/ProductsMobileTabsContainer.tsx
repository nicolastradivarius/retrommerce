// ============================================================================
// COMPONENTE: ProductsMobileTabsContainer
// ============================================================================
// Propósito: Contenedor de pestañas para la vista mobile (<768px)
//
// Características:
// - Dos pestañas: "Catalog" (por defecto) y "Filters"
// - Pestaña Catalog: grid de productos (2 columnas) + paginación
// - Pestaña Filters: panel de filtros sin marco adicional
// - Mantiene consistencia con estilo Windows 95
// - Totalmente responsivo
//
// Flujo de datos:
// page.tsx → ProductsMobileTabsContainer → ProductCard / ProductFilters
// ============================================================================

"use client";

import { Frame, TitleBar, Tabs, Tab, Cursor } from "@react95/core";
import { Computer } from "@react95/icons";
import Link from "next/link";
import type { Locale } from "../../dictionaries";
import type { ProductListItem } from "@/lib/products";
import ProductCard from "../../components/ProductCard";
import ProductFilters from "../ProductFilters";
import styles from "../page.module.css";

/**
 * Tipo para productos con precios ya serializados a strings
 * Como los Client Components solo aceptan datos serializables, y Prisma devuelve Decimal para precios,
 * entonces page.tsx serializa los datos antes de pasar a este componente
 *
 * ## Estructura:
 * - Mantiene todas las propiedades de ProductListItem
 * - EXCEPTO: reemplaza Decimal price/originalPrice con strings
 *
 * ## Ejemplo:
 * Antes: { price: Decimal("99.99"), ...}
 * Después: { price: "99.99", ... }
 */
type SerializedProduct = Omit<ProductListItem, "price" | "originalPrice"> & {
  price: string;
  originalPrice: string;
};

/**
 * Interfaz que representa una categoría
 *
 * @property id - ID único en base de datos (para queries)
 * @property name - Nombre mostrable (ej: "Electronics")
 * @property slug - URL-friendly identifier (ej: "electronics")
 */
interface Category {
  id: string;
  name: string;
  slug: string;
}

/**
 * Diccionario para etiquetas del ProductCard
 *
 * Estas son las etiquetas que se muestran dentro de cada tarjeta de producto
 * en el grid (año, stock, botón de favoritos, etc)
 */
interface ProductCardDict {
  year: string;
  stock: string;
  units: string;
  outOfStock: string;
  addToFavorites: string;
  removeFromFavorites: string;
  loginToFavorite: string;
}

/**
 * Props del componente ProductsMobileTabsContainer
 *
 * Este componente recibe todos los datos necesarios para renderizar:
 * - La pestaña de catálogo (productos + paginación)
 * - La pestaña de filtros (ProductFilters component)
 *
 * Nota: Los productos ya vienen serializados (sin Decimal objects)
 */
interface ProductsMobileTabsContainerProps {
  lang: Locale;
  products: SerializedProduct[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  // Filtros activos (para construir URLs de paginación)
  // Nota: Se pasan aquí para mantener filtros al paginar
  search?: string;
  categorySlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  // Set de IDs de productos que el usuario ha marcado como favoritos
  favoriteIds: Set<string>;

  // Si el usuario puede agregar a favoritos (está logueado)
  canFavorite: boolean;

  dict: {
    // Diccionario para ProductFilters
    filters: {
      title: string;
      search: string;
      searchPlaceholder: string;
      categories: string;
      allCategories: string;
      priceRange: string;
      minPrice: string;
      maxPrice: string;
      yearRange: string;
      minYear: string;
      maxYear: string;
      applyFilters: string;
      clearFilters: string;
    };

    // Etiquetas generales
    allProducts: string;
    pageOf: string;
    previous: string;
    next: string;
    noResults: string;

    // Diccionario para ProductCard
    productCard: ProductCardDict;
  };
}

/**
 * Componente ProductsMobileTabsContainer
 *
 * Renderiza una ventana con dos pestañas para mobile:
 * 1. "Catalog": Grid de productos (2 columnas) + paginación
 * 2. "Filters": Panel de filtros (ProductFilters component)
 */
export default function ProductsMobileTabsContainer({
  lang,
  products,
  categories,
  totalPages,
  currentPage,
  favoriteIds,
  canFavorite,
  search,
  categorySlugs,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
  dict,
}: ProductsMobileTabsContainerProps) {
  /**
   * Construye URLs para links de paginación manteniendo filtros activos
   *
   * ## Lógica:
   * 1. Crear URLSearchParams vacío
   * 2. Establecer número de página
   * 3. Agregar filtros activos (si existen)
   * 4. Unir todo en una URL válida
   *
   * @param pageNum - Número de página a construir
   * @returns URL válida para Link href
   */
  const buildPaginationUrl = (pageNum: number) => {
    return `/${lang}/products?${new URLSearchParams({
      // Siempre incluir número de página
      page: String(pageNum),

      // Incluir búsqueda solo si existe
      ...(search && { search }),

      // Incluir categorías solo si existen (unidas por comas)
      ...(categorySlugs && { categories: categorySlugs.join(",") }),

      // Incluir rango de precio solo si existen
      ...(minPrice !== undefined && { minPrice: String(minPrice) }),
      ...(maxPrice !== undefined && { maxPrice: String(maxPrice) }),

      // Incluir rango de año solo si existen
      ...(minYear !== undefined && { minYear: String(minYear) }),
      ...(maxYear !== undefined && { maxYear: String(maxYear) }),
    }).toString()}`;
  };

  return (
    <div className={styles.window}>
      <TitleBar
        active
        icon={<Computer variant="16x16_4" />}
        title={dict.allProducts}
      >
        <TitleBar.OptionsBox>
          <TitleBar.Minimize />
          <TitleBar.Restore />
          <TitleBar.Close />
        </TitleBar.OptionsBox>
      </TitleBar>

      <Frame className={styles.windowContent}>
        <Tabs defaultActiveTab="Catalog">
          {/* Catalog Tab */}
          <Tab title="Catalog">
            <div className={styles.mobileTabContent}>
              {products.length === 0 ? (
                <div className={styles.noResults}>
                  <p>{dict.noResults}</p>
                </div>
              ) : (
                <>
                  <div className={styles.productGrid}>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        lang={lang}
                        dict={dict.productCard}
                        isFavorite={favoriteIds.has(product.id)}
                        canFavorite={canFavorite}
                        fromPage="products"
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <span className={styles.pageInfo}>
                        {dict.pageOf
                          .replace("{page}", String(currentPage))
                          .replace("{total}", String(totalPages))}
                      </span>

                      <div className={styles.paginationControls}>
                        {currentPage > 1 && (
                          <Link
                            href={buildPaginationUrl(currentPage - 1)}
                            className={`${styles.pageButton} ${Cursor.Pointer}`}
                          >
                            {dict.previous}
                          </Link>
                        )}

                        <div className={styles.pageNumbers}>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((pageNum) => (
                            <Link
                              key={pageNum}
                              href={buildPaginationUrl(pageNum)}
                              className={`${styles.pageNumber} ${pageNum === currentPage ? styles.pageNumberActive : ""} ${Cursor.Pointer}`}
                            >
                              {pageNum}
                            </Link>
                          ))}
                        </div>

                        {currentPage < totalPages && (
                          <Link
                            href={buildPaginationUrl(currentPage + 1)}
                            className={`${styles.pageButton} ${Cursor.Pointer}`}
                          >
                            {dict.next}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Tab>

          {/* Filters Tab */}
          <Tab title="Filters">
            <div className={styles.mobileTabContent}>
              <ProductFilters
                lang={lang}
                categories={categories}
                dict={dict.filters}
                isMobileTab={true}
              />
            </div>
          </Tab>
        </Tabs>
      </Frame>
    </div>
  );
}
