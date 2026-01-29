// ============================================================================
// COMPONENTE: ProductCard
// ============================================================================
// Propósito: Tarjeta individual de producto en el grid
//
// Características:
// - Muestra información del producto (nombre, año, precio, stock)
// - Botón para agregar/quitar favoritos
// - Acepta precios serializados (siempre strings, nunca Decimal)
// ============================================================================

import { Frame, Cursor } from "@react95/core";
import Link from "next/link";
import { formatPrice, hasDiscount } from "@/lib/utils";
import type { Locale } from "../dictionaries";
import FavoriteButton from "./FavoriteButton";
import styles from "./ProductCard.module.css";

/**
 * Props del componente ProductCard
 *
 * Nota: Todos los productos son serializados en page.tsx ANTES de pasarlos
 * tanto a desktop como a mobile, por lo que aquí siempre reciben strings.
 */
export interface ProductCardProps {
  product: {
    // Identificadores
    id: string; // ID único del producto
    name: string; // Nombre del producto
    slug: string; // URL-friendly identifier (usado en links)

    /**
     * Precio actual del producto (siempre string)
     *
     * Se serializa en page.tsx antes de pasar a este componente.
     * La función formatPrice() parsea el string a número para formateo.
     */
    price: string;

    // Precio original (antes de descuento, siempre string)
    originalPrice: string;

    // Información adicional
    manufacturer?: string | null;
    year?: number | null;
    stock: number;
  };

  // Idioma e internacionalización
  lang: Locale; // Idioma actual (es/en)

  // Diccionario multiidioma para etiquetas
  dict: {
    year: string;
    stock: string;
    units: string;
    outOfStock: string;
    addToFavorites: string;
    removeFromFavorites: string;
    loginToFavorite: string;
  };

  // Estado de favoritos
  isFavorite?: boolean; // Si el usuario ya lo marcó como favorito
  canFavorite?: boolean; // Si el usuario puede agregar a favoritos (debe estar logueado)

  // Contexto de navegación
  fromPage?: string; // De dónde viene (ej: "products", "favorites")
}

/**
 * Componente ProductCard
 *
 * Renderiza una tarjeta de producto individual con:
 * - Imagen placeholder
 * - Nombre y fabricante
 * - Año de lanzamiento
 * - Precio (con descuento si aplica)
 * - Stock disponible
 * - Botón de favoritos
 *
 * ## Flujo de datos:
 * page.tsx / ProductsMobileTabsContainer
 *   → ProductCard (producto serializado)
 *   → Link a página de detalle del producto
 */
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
            dict={dict}
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
              {dict.year}: {product.year}
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
              ? `${dict.stock}: ${product.stock} ${dict.units}`
              : dict.outOfStock}
          </p>
        </div>
      </Frame>
    </Link>
  );
}
