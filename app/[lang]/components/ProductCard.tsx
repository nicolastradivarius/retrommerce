import { Frame, Cursor } from "@react95/core";
import Link from "next/link";
import { formatPrice, hasDiscount } from "@/lib/utils";
import type { Locale } from "../dictionaries";
import FavoriteButton from "./FavoriteButton";
import styles from "./ProductCard.module.css";

export interface ProductCardProps {
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
  lang: Locale;
  dict: {
    productCard: {
      year: string;
      stock: string;
      units: string;
      outOfStock: string;
      addToFavorites: string;
      removeFromFavorites: string;
      loginToFavorite: string;
    };
  };
  isFavorite?: boolean;
  canFavorite?: boolean;
  fromPage?: string;
}

export default function ProductCard({
  product,
  lang,
  dict,
  isFavorite = false,
  canFavorite = false,
  fromPage = "products",
}: ProductCardProps) {
  return (
    <Link
      href={`/${lang}/products/${product.slug}?from=${fromPage}`}
      className={`${styles.productLink} ${Cursor.Pointer}`}
    >
      <Frame className={styles.productCard}>
        <div className={styles.productImagePlaceholder}>{product.name}</div>
        <div className={styles.favoriteButtonContainer}>
          <FavoriteButton
            productId={product.id}
            initialIsFavorite={isFavorite}
            canFavorite={canFavorite}
            lang={lang}
            dict={dict.productCard}
            className={styles.favoriteButtonIcon}
          />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          {product.manufacturer && (
            <p className={styles.manufacturer}>{product.manufacturer}</p>
          )}
          {product.year && (
            <p className={styles.year}>
              {dict.productCard.year}: {product.year}
            </p>
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
              ? `${dict.productCard.stock}: ${product.stock} ${dict.productCard.units}`
              : dict.productCard.outOfStock}
          </p>
        </div>
      </Frame>
    </Link>
  );
}
