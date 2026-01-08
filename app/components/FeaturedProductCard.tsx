import { Frame } from '@react95/core';
import Link from 'next/link';
import { formatPrice, hasDiscount } from '@/lib/utils';
import styles from './FeaturedProductCard.module.css';

interface FeaturedProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string };
    originalPrice: { toString(): string };
    manufacturer?: string | null;
  };
}

export default function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className={styles.featuredLink}>
      <Frame className={styles.featuredCard}>
        <div className={styles.featuredImagePlaceholder}>
          ⭐ {product.name}
        </div>
        <div className={styles.featuredInfo}>
          <h3 className={styles.featuredName}>{product.name}</h3>
          {product.manufacturer && (
            <p className={styles.featuredManufacturer}>{product.manufacturer}</p>
          )}
          <div className={styles.featuredPriceSection}>
            <span className={styles.featuredPrice}>{formatPrice(product.price)}</span>
            {hasDiscount(product.price, product.originalPrice) && (
              <span className={styles.featuredOriginalPrice}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Frame>
    </Link>
  );
}
