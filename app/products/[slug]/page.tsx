import { Frame, Button, List } from '@react95/core';
import { Computer, Back } from '@react95/icons';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@/app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { getCurrentUser } from '@/lib/auth';
import TopBar from '@/app/components/TopBar';
import ImageCarousel from '@/app/components/ImageCarousel';
import styles from './page.module.css';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Parsear las especificaciones
  const specs = product.specifications as Record<string, string> | null;

  return (
    <div className={styles.container}>
      <TopBar user={user ? { name: user.name, email: user.email } : null} />
      
      <div className={styles.main}>
        <Link href="/" className={styles.backLink}>
          <Button>
            <Back variant="16x16_4" />
            Volver a productos
          </Button>
        </Link>

        <Frame className={styles.productFrame}>
          <div className={styles.productHeader}>
            <Computer variant="32x32_4" />
            <div>
              <h1 className={styles.productTitle}>{product.name}</h1>
              {product.manufacturer && (
                <p className={styles.manufacturer}>
                  Fabricante: {product.manufacturer}
                </p>
              )}
              {product.year && (
                <p className={styles.year}>
                  Año de lanzamiento: {product.year}
                </p>
              )}
            </div>
          </div>

          <div className={styles.productLayout}>
            <div className={styles.leftColumn}>
              <ImageCarousel images={product.images} productName={product.name} />
              
              {product.description && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Descripcion</h2>
                  <p className={styles.description}>{product.description}</p>
                </div>
              )}
            </div>

            <div className={styles.rightColumn}>
              <Frame className={styles.infoCard}>
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Precio</h2>
                  <div className={styles.priceSection}>
                    <span className={styles.price}>${product.price.toString()}</span>
                    {product.originalPrice.toString() !== product.price.toString() && (
                      <span className={styles.originalPrice}>
                        ${product.originalPrice.toString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Disponibilidad</h2>
                  <p className={styles.stock}>
                    {product.stock > 0 
                      ? `${product.stock} unidades disponibles` 
                      : 'Sin stock'}
                  </p>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Categoria</h2>
                  <p className={styles.category}>{product.category.name}</p>
                </div>

                {product.stock > 0 && (
                  <div className={styles.cardActions}>
                    <Frame className={styles.addToCartFrame}>
                      <Button className={styles.addToCartButton}>
                        Agregar al carrito
                      </Button>
                    </Frame>
                  </div>
                )}
              </Frame>
            </div>
          </div>

          {specs && Object.keys(specs).length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Especificaciones Técnicas</h2>
              <Frame className={styles.specsFrame}>
                <ul className={styles.specsList}>
                  {Object.entries(specs).map(([key, value]) => (
                    <li key={key} className={styles.specItem}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </Frame>
            </div>
          )}
        </Frame>
      </div>
    </div>
  );
}
