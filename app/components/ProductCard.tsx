import { Frame } from '@react95/core';
import Link from 'next/link';
import { formatPrice, hasDiscount } from '@/lib/utils';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string };
    originalPrice: { toString(): string };
    manufacturer?: string | null;
    year?: number | null;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className={styles.productLink}>
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
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {hasDiscount(product.price, product.originalPrice) && (
              <span className={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
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
  );
}
