import { Frame, TitleBar, Cursor } from "@react95/core";
import { Computer } from "@react95/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import {
  getProducts,
  getProductsCount,
  getCategories,
  type ProductListItem,
} from "@/lib/products";
import { getFavoriteProductIdsByUser } from "@/lib/favorites";
import BottomNav from "../components/BottomNav";
import ProductCard from "../components/ProductCard";
import ProductFilters from "./ProductFilters";
import styles from "./page.module.css";
import { getDictionary, hasLocale } from "../dictionaries";
import { getCurrentUserWithAvatar } from "@/lib/auth";

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
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const searchParamsResolved = await searchParams;

  const rawPage = searchParamsResolved.page;
  const page = rawPage ? Number(rawPage) : 1;

  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }

  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Parse filters from URL
  const search = searchParamsResolved.search || undefined;
  const categoryIds = searchParamsResolved.categories
    ? searchParamsResolved.categories.split(",").filter(Boolean)
    : undefined;
  const minPrice = searchParamsResolved.minPrice
    ? parseFloat(searchParamsResolved.minPrice)
    : undefined;
  const maxPrice = searchParamsResolved.maxPrice
    ? parseFloat(searchParamsResolved.maxPrice)
    : undefined;
  const minYear = searchParamsResolved.minYear
    ? parseInt(searchParamsResolved.minYear, 10)
    : undefined;
  const maxYear = searchParamsResolved.maxYear
    ? parseInt(searchParamsResolved.maxYear, 10)
    : undefined;

  // Get categories for filters
  const categories = await getCategories();

  // Get products with filters
  const [products, totalCount] = (await Promise.all([
    getProducts({
      skip,
      take: ITEMS_PER_PAGE,
      search,
      categoryIds,
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const user = await getCurrentUserWithAvatar();

  const favoriteIds = user
    ? await getFavoriteProductIdsByUser(user.sub)
    : new Set<string>();

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        {/* Layout with sidebar and products */}
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
                <TitleBar.OptionsBox>
                  <TitleBar.Minimize />
                  <TitleBar.Restore />
                  <TitleBar.Close />
                </TitleBar.OptionsBox>
              </TitleBar>
              <Frame className={styles.windowContent}>
                {products.length === 0 ? (
                  <div className={styles.noResults}>
                    <p>
                      No se encontraron productos con los filtros seleccionados.
                    </p>
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
                          canFavorite={Boolean(user)}
                          fromPage="products"
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
                                ...(categoryIds && {
                                  categories: categoryIds.join(","),
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
                                  ...(categoryIds && {
                                    categories: categoryIds.join(","),
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
                                ...(categoryIds && {
                                  categories: categoryIds.join(","),
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
}
