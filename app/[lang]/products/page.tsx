import { Frame, TitleBar, Cursor } from "@react95/core";
import { Computer } from "@react95/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import {
  getProducts,
  getProductsCount,
  type ProductListItem,
} from "@/lib/products";
import FeaturedProducts from "../components/FeaturedProducts";
import { getFavoriteProductIdsByUser } from "@/lib/favorites";
import BottomNav from "../components/BottomNav";
import ProductCard from "../components/ProductCard";
import styles from "./page.module.css";
import { getDictionary, hasLocale } from "../dictionaries";
import { getCurrentUserWithAvatar } from "@/lib/auth";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
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

  // Featured products are rendered via the reusable server component <FeaturedProducts />

  // Obtener productos no destacados con paginación
  const [products, totalCount] = (await Promise.all([
    getProducts({ skip, take: ITEMS_PER_PAGE }),
    getProductsCount(),
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
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{dict.home.title}</h1>
            <p className={styles.subtitle}>{dict.home.subtitle}</p>
          </div>
        </div>

        <FeaturedProducts lang={lang} fromPage="featured" />

        {/* Grid de productos con paginación */}
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
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  dict={dict}
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
                      href={`/${lang}/products?page=${page - 1}`}
                      className={`${styles.pageButton} ${Cursor.Pointer}`}
                    >
                      {dict.home.previous}
                    </Link>
                  )}

                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={`/${lang}/products?page=${pageNum}`}
                          className={`${styles.pageNumber} ${pageNum === page ? styles.pageNumberActive : ""} ${Cursor.Pointer}`}
                        >
                          {pageNum}
                        </Link>
                      ),
                    )}
                  </div>

                  {page < totalPages && (
                    <Link
                      href={`/${lang}/products?page=${page + 1}`}
                      className={`${styles.pageButton} ${Cursor.Pointer}`}
                    >
                      {dict.home.next}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </Frame>
        </div>
      </div>
    </div>
  );
}
