import { Frame } from '@react95/core';
import { Computer, Star } from '@react95/icons';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import type { Prisma } from '@/app/generated/prisma';
import TopBar from '../components/TopBar';
import ProductCard from '../components/ProductCard';
import FeaturedProductCard from '../components/FeaturedProductCard';
import styles from './page.module.css';
import { getDictionary, hasLocale } from '../dictionaries';

type ProductListItem = Prisma.ProductGetPayload<{
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

export default async function HomePage({
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
  const page = parseInt(searchParamsResolved.page || '1');
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Obtener productos destacados (siempre se muestran)
const featuredProducts: ProductListItem[] = await prisma.product.findMany({
  where: { featured: true },
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

  // Obtener productos no destacados con paginación
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: { featured: false },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
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
    }),
    prisma.product.count({ where: { featured: false } }),
  ]) as [ProductListItem[], number];

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <TopBar lang={lang} dict={dict} />
      
      <div className={styles.main}>
        <div className={styles.header}>
          <Computer variant="32x32_4" />
          <div>
            <h1 className={styles.title}>{dict.home.title}</h1>
            <p className={styles.subtitle}>
              {dict.home.subtitle}
            </p>
          </div>
        </div>

        {/* Panel de productos destacados */}
        {featuredProducts.length > 0 && (
          <Frame className={styles.featuredFrame}>
            <div className={styles.featuredHeader}>
              <Star variant="16x16_4" />
              <h2 className={styles.featuredTitle}>{dict.home.featuredProducts}</h2>
            </div>
            <div className={styles.featuredScroll}>
              <div className={styles.featuredGrid}>
                {featuredProducts.map((product) => (
                  <FeaturedProductCard key={product.id} product={product} lang={lang} />
                ))}
              </div>
            </div>
          </Frame>
        )}

        {/* Grid de productos con paginación */}
        <Frame className={styles.productsFrame}>
          <h2 className={styles.sectionTitle}>{dict.home.allProducts}</h2>
          
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} dict={dict} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {page > 1 && (
                <Link href={`/${lang}/products?page=${page - 1}`} className={styles.pageButton}>
                  {dict.home.previous}
                </Link>
              )}
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/${lang}/products?page=${pageNum}`}
                    className={`${styles.pageNumber} ${pageNum === page ? styles.pageNumberActive : ''}`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
              
              <span className={styles.pageInfo}>
                {dict.home.pageOf.replace('{page}', String(page)).replace('{total}', String(totalPages))}
              </span>
              
              {page < totalPages && (
                <Link href={`/${lang}/products?page=${page + 1}`} className={styles.pageButton}>
                  {dict.home.next}
                </Link>
              )}
            </div>
          )}
        </Frame>
      </div>
    </div>
  );
}

