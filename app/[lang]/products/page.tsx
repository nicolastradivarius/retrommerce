import { Frame, TitleBar, Cursor } from "@react95/core";
import { Computer, Warning } from "@react95/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import {
  getProducts,
  getProductsCount,
  getCategories,
  type ProductListItem,
} from "@/lib/products";
import { getFavoriteProductIdsByUser } from "@/lib/favorites";
import BottomNav from "@/components/layout/BottomNav";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import ProductsMobileTabsContainer from "./_mobile/ProductsMobileTabsContainer";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import styles from "./page.module.css";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { getCurrentUserWithAvatar } from "@/lib/auth";

/**
 * Genera una descripción de los filtros aplicados
 */
function generateFilterDescription(
  categorySlugs: string[] | undefined,
  categories: Array<{ id: string; name: string; slug: string }>,
  minPrice: number | undefined,
  maxPrice: number | undefined,
  minYear: number | undefined,
  maxYear: number | undefined,
  dict: {
    showingProducts: string;
    priceRange: string;
    priceFrom: string;
    priceUpTo: string;
    yearRange: string;
    yearFrom: string;
    yearUpTo: string;
    category: string;
  },
): string | null {
  const filters: string[] = [];

  // Agregar categorías
  if (categorySlugs && categorySlugs.length > 0) {
    const categoryNames = categorySlugs
      .map((slug) => categories.find((cat) => cat.slug === slug)?.name)
      .filter(Boolean);

    if (categoryNames.length > 0) {
      filters.push(
        ...categoryNames.map((name) =>
          dict.category.replace("{category}", name!),
        ),
      );
    }
  }

  // Agregar rango de precio
  if (minPrice !== undefined && maxPrice !== undefined) {
    filters.push(
      dict.priceRange
        .replace("${min}", minPrice.toString())
        .replace("${max}", maxPrice.toString()),
    );
  } else if (minPrice !== undefined) {
    filters.push(dict.priceFrom.replace("${min}", minPrice.toString()));
  } else if (maxPrice !== undefined) {
    filters.push(dict.priceUpTo.replace("${max}", maxPrice.toString()));
  }

  // Agregar rango de año
  if (minYear !== undefined && maxYear !== undefined) {
    filters.push(
      dict.yearRange
        .replace("{min}", minYear.toString())
        .replace("{max}", maxYear.toString()),
    );
  } else if (minYear !== undefined) {
    filters.push(dict.yearFrom.replace("{min}", minYear.toString()));
  } else if (maxYear !== undefined) {
    filters.push(dict.yearUpTo.replace("{max}", maxYear.toString()));
  }

  if (filters.length === 0) {
    return null;
  }

  return `${dict.showingProducts} ${filters.join(", ")}.`;
}

/**
 * Página principal de productos
 *
 * Este Server Component maneja:
 * - Obtención de productos desde la base de datos
 * - Aplicación de filtros (búsqueda, categorías, precio, año)
 * - Paginación de resultados
 * - Renderizado responsivo (desktop con sidebar vs mobile con pestañas)
 * - Serialización de datos Prisma para Client Components
 */
export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    categories?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
  }>;
}) {
  // ============================================================================
  // VALIDACIÓN INICIAL
  // ============================================================================

  const { lang } = await params;

  // Validar que el idioma sea soportado
  if (!hasLocale(lang)) {
    notFound();
  }

  // Obtener diccionarios multiidioma
  const dict = await getDictionary(lang);
  const searchParamsResolved = await searchParams;

  // ============================================================================
  // PAGINACIÓN
  // ============================================================================

  const rawPage = searchParamsResolved.page;
  const page = rawPage ? Number(rawPage) : 1;

  // Validar que la página sea un número positivo válido
  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }

  // Calcular offset para la query (ej: página 2 con 12 items = skip 12)
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // ============================================================================
  // PARSEO DE FILTROS DESDE URL
  // ============================================================================

  // Búsqueda por nombre de producto
  const search = searchParamsResolved.search || undefined;

  // Categorías: parsear slugs separados por coma
  // Ejemplo: "electronics,furniture,games" → ["electronics", "furniture", "games"]
  const categorySlugs = searchParamsResolved.categories
    ? searchParamsResolved.categories.split(",").filter(Boolean)
    : undefined;

  // Rango de precio: convertir string a número
  const minPrice = searchParamsResolved.minPrice
    ? parseFloat(searchParamsResolved.minPrice)
    : undefined;
  const maxPrice = searchParamsResolved.maxPrice
    ? parseFloat(searchParamsResolved.maxPrice)
    : undefined;

  // Rango de año: convertir string a número entero
  const minYear = searchParamsResolved.minYear
    ? parseInt(searchParamsResolved.minYear, 10)
    : undefined;
  const maxYear = searchParamsResolved.maxYear
    ? parseInt(searchParamsResolved.maxYear, 10)
    : undefined;

  // ============================================================================
  // OBTENCIÓN DE DATOS
  // ============================================================================

  // Obtener todas las categorías disponibles (para el panel de filtros)
  const categories = await getCategories();

  /**
   * Convertir slugs de categorías a IDs para la consulta de base de datos
   *
   * Flujo:
   * 1. Mapear cada slug a su ID correspondiente
   * 2. Filtrar null/undefined (en caso de slugs inválidos)
   * 3. Mantener los slugs originales para las URLs (más legibles)
   *
   * Ejemplo:
   * categorySlugs: ["electronics", "furniture"]
   * ↓ (mapeado y filtrado)
   * categoryIds: ["cmk05lv1d0003frry0aohp7ri", "cmk05lv1d0004frry1a98n45t"]
   */
  const categoryIds = categorySlugs
    ? (categorySlugs
        .map((slug) => categories.find((cat) => cat.slug === slug)?.id)
        .filter(Boolean) as string[])
    : undefined;

  /**
   * Obtener productos y contar total con filtros aplicados
   * Se ejecutan ambas queries en paralelo para mejor performance
   */
  const [products, totalCount] = (await Promise.all([
    getProducts({
      skip,
      take: ITEMS_PER_PAGE,
      search,
      categoryIds, // Usar IDs para la query
      minPrice,
      maxPrice,
      minYear,
      maxYear,
    }),
    getProductsCount({
      search,
      categoryIds,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
    }),
  ])) as [ProductListItem[], number];

  // Calcular número total de páginas
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Obtener usuario actual (para verificar favoritos)
  const user = await getCurrentUserWithAvatar();

  // Obtener IDs de productos favoritos del usuario actual
  const favoriteIds = user
    ? await getFavoriteProductIdsByUser(user.sub)
    : new Set<string>();

  // ============================================================================
  // SERIALIZACIÓN DE DATOS PARA CLIENT COMPONENTS
  // ============================================================================

  /**
   * Problema: Prisma devuelve objetos Decimal para precios
   * Los Client Components solo aceptan datos serializables (strings, números, objetos planos)
   *
   * Solución: Convertir Decimal a string en el servidor antes de pasar a Client Components
   */
  const serializeProduct = (product: ProductListItem) => ({
    ...product,
    price: product.price.toString(), // Decimal → string
    originalPrice: product.originalPrice.toString(), // Decimal → string
  });

  // Aplicar serialización a todos los productos
  const serializedProducts = products.map(serializeProduct);

  // ============================================================================
  // GENERAR DESCRIPCIÓN DE FILTROS
  // ============================================================================
  const filterDescription = generateFilterDescription(
    categorySlugs,
    categories,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    {
      showingProducts: dict.home.showingProducts,
      priceRange: dict.home.priceRange,
      priceFrom: dict.home.priceFrom,
      priceUpTo: dict.home.priceUpTo,
      yearRange: dict.home.yearRange,
      yearFrom: dict.home.yearFrom,
      yearUpTo: dict.home.yearUpTo,
      category: dict.home.category,
    },
  );

  // ============================================================================
  // RENDER DESKTOP (≥768px)
  // ============================================================================
  // Layout: Barra lateral con filtros + Grid de productos

  const desktopLayout = (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.contentLayout}>
          {/* Filters sidebar */}
          <aside className={styles.sidebar}>
            <ProductFilters
              lang={lang}
              categories={categories}
              dict={dict.filters}
            />
          </aside>

          {/* Products grid */}
          <div className={styles.productsSection}>
            <div className={styles.window}>
              <TitleBar
                active
                icon={<Computer variant="16x16_4" />}
                title={dict.home.allProducts}
              >
                <TitleBarClassicOptions />
              </TitleBar>
              <Frame className={styles.windowContent}>
                {filterDescription && (
                  <div className={styles.filterDescription}>
                    <p>{filterDescription}</p>
                  </div>
                )}
                {serializedProducts.length === 0 ? (
                  <div className={styles.noResults}>
                    <Warning variant="32x32_4" />
                    <p>{dict.home.noResults}</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.productGrid}>
                      {serializedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          lang={lang}
                          dict={dict.productCard}
                          isFavorite={favoriteIds.has(product.id)}
                          canFavorite={Boolean(user)}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <span className={styles.pageInfo}>
                          {dict.home.pageOf
                            .replace("{page}", String(page))
                            .replace("{total}", String(totalPages))}
                        </span>

                        <div className={styles.paginationControls}>
                          {page > 1 && (
                            <Link
                              href={`/${lang}/products?${new URLSearchParams({
                                page: String(page - 1),
                                ...(search && { search }),
                                ...(categorySlugs && {
                                  categories: categorySlugs.join(","),
                                }),
                                ...(minPrice !== undefined && {
                                  minPrice: String(minPrice),
                                }),
                                ...(maxPrice !== undefined && {
                                  maxPrice: String(maxPrice),
                                }),
                                ...(minYear !== undefined && {
                                  minYear: String(minYear),
                                }),
                                ...(maxYear !== undefined && {
                                  maxYear: String(maxYear),
                                }),
                              }).toString()}`}
                              className={`${styles.pageButton} ${Cursor.Pointer}`}
                            >
                              {dict.home.previous}
                            </Link>
                          )}

                          <div className={styles.pageNumbers}>
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((pageNum) => (
                              <Link
                                key={pageNum}
                                href={`/${lang}/products?${new URLSearchParams({
                                  page: String(pageNum),
                                  ...(search && { search }),
                                  ...(categorySlugs && {
                                    categories: categorySlugs.join(","),
                                  }),
                                  ...(minPrice !== undefined && {
                                    minPrice: String(minPrice),
                                  }),
                                  ...(maxPrice !== undefined && {
                                    maxPrice: String(maxPrice),
                                  }),
                                  ...(minYear !== undefined && {
                                    minYear: String(minYear),
                                  }),
                                  ...(maxYear !== undefined && {
                                    maxYear: String(maxYear),
                                  }),
                                }).toString()}`}
                                className={`${styles.pageNumber} ${pageNum === page ? styles.pageNumberActive : ""} ${Cursor.Pointer}`}
                              >
                                {pageNum}
                              </Link>
                            ))}
                          </div>

                          {page < totalPages && (
                            <Link
                              href={`/${lang}/products?${new URLSearchParams({
                                page: String(page + 1),
                                ...(search && { search }),
                                ...(categorySlugs && {
                                  categories: categorySlugs.join(","),
                                }),
                                ...(minPrice !== undefined && {
                                  minPrice: String(minPrice),
                                }),
                                ...(maxPrice !== undefined && {
                                  maxPrice: String(maxPrice),
                                }),
                                ...(minYear !== undefined && {
                                  minYear: String(minYear),
                                }),
                                ...(maxYear !== undefined && {
                                  maxYear: String(maxYear),
                                }),
                              }).toString()}`}
                              className={`${styles.pageButton} ${Cursor.Pointer}`}
                            >
                              {dict.home.next}
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Frame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER MOBILE (<768px)
  // ============================================================================
  // Layout: Una ventana con dos pestañas (Catalog | Filters)

  const mobileLayout = (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <ProductsMobileTabsContainer
          lang={lang}
          products={serializedProducts}
          categories={categories}
          currentPage={page}
          totalPages={totalPages}
          search={search}
          categorySlugs={categorySlugs}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minYear={minYear}
          maxYear={maxYear}
          favoriteIds={favoriteIds}
          canFavorite={Boolean(user)}
          filterDescription={filterDescription}
          dict={{
            filters: dict.filters,
            allProducts: dict.home.allProducts,
            pageOf: dict.home.pageOf,
            previous: dict.home.previous,
            next: dict.home.next,
            noResults: dict.home.noResults,
            productCard: dict.productCard,
          }}
        />
      </div>
    </div>
  );

  // ============================================================================
  // RENDER FINAL
  // ============================================================================
  // ResponsiveLayout detecta el tamaño del viewport y renderiza el layout apropiado

  return (
    <ResponsiveLayout
      desktopLayout={desktopLayout}
      mobileLayout={mobileLayout}
    />
  );
}
