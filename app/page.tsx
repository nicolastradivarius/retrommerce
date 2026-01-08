import { Frame } from '@react95/core';
import { Computer, Star } from '@react95/icons';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { getCurrentUserWithAvatar } from '@/lib/auth';
import TopBar from './components/TopBar';
import ProductCard from './components/ProductCard';
import FeaturedProductCard from './components/FeaturedProductCard';
import styles from './page.module.css';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const user = await getCurrentUserWithAvatar();

  // Obtener productos destacados (siempre se muestran)
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      manufacturer: true,
      images: true,
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
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <TopBar user={user ? { name: user.name, email: user.email, avatar: user.avatar } : null} />
      
      <div className={styles.main}>
        <div className={styles.header}>
          <Computer variant="32x32_4" />
          <div>
            <h1 className={styles.title}>Retrommerce</h1>
            <p className={styles.subtitle}>
              Tu tienda de tecnologia vintage de los 90s y 2000s
            </p>
          </div>
        </div>

        {/* Panel de productos destacados */}
        {featuredProducts.length > 0 && (
          <Frame className={styles.featuredFrame}>
            <div className={styles.featuredHeader}>
              <Star variant="16x16_4" />
              <h2 className={styles.featuredTitle}>Productos Destacados</h2>
            </div>
            <div className={styles.featuredScroll}>
              <div className={styles.featuredGrid}>
                {featuredProducts.map((product) => (
                  <FeaturedProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </Frame>
        )}

        {/* Grid de productos con paginación */}
        <Frame className={styles.productsFrame}>
          <h2 className={styles.sectionTitle}>Todos los Productos</h2>
          
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {page > 1 && (
                <Link href={`/?page=${page - 1}`} className={styles.pageButton}>
                  ← Anterior
                </Link>
              )}
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/?page=${pageNum}`}
                    className={`${styles.pageNumber} ${pageNum === page ? styles.pageNumberActive : ''}`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>
              
              <span className={styles.pageInfo}>
                Página {page} de {totalPages}
              </span>
              
              {page < totalPages && (
                <Link href={`/?page=${page + 1}`} className={styles.pageButton}>
                  Siguiente →
                </Link>
              )}
            </div>
          )}
        </Frame>
      </div>
    </div>
  );
}

