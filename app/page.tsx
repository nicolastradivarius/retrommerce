import { Frame, List } from '@react95/core';
import { Computer } from '@react95/icons';
import Link from 'next/link';
import { PrismaClient } from '@/app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { getCurrentUser } from '@/lib/auth';
import TopBar from './components/TopBar';
import styles from './page.module.css';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ITEMS_PER_PAGE = 20;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const user = await getCurrentUser();

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
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
    prisma.product.count(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <TopBar user={user ? { name: user.name, email: user.email } : null} />
      
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

        <Frame className={styles.productsFrame}>
          <h2 className={styles.sectionTitle}>Productos Destacados</h2>
          
          <div className={styles.productGrid}>
            {products.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className={styles.productLink}
              >
                <Frame className={styles.productCard}>
                  <div className={styles.productImagePlaceholder}>
                    {product.name}
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    {product.manufacturer && (
                      <p className={styles.manufacturer}>{product.manufacturer}</p>
                    )}
                    {product.year && (
                      <p className={styles.year}>Año: {product.year}</p>
                    )}
                    <div className={styles.priceSection}>
                      <span className={styles.price}>${product.price.toString()}</span>
                      {product.originalPrice.toString() !== product.price.toString() && (
                        <span className={styles.originalPrice}>
                          ${product.originalPrice.toString()}
                        </span>
                      )}
                    </div>
                    <p className={styles.stock}>
                      {product.stock > 0 
                        ? `Stock: ${product.stock} unidades` 
                        : 'Sin stock'}
                    </p>
                  </div>
                </Frame>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {page > 1 && (
                <Link href={`/?page=${page - 1}`} className={styles.pageButton}>
                  Anterior
                </Link>
              )}
              <span className={styles.pageInfo}>
                Pagina {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/?page=${page + 1}`} className={styles.pageButton}>
                  Siguiente
                </Link>
              )}
            </div>
          )}
        </Frame>
      </div>
    </div>
  );
}

