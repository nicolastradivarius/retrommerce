import "server-only";

import { Frame, TitleBar } from "@react95/core";
import { Star } from "@react95/icons";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import FeaturedProductCard from "./FeaturedProductCard";
import { getDictionary, type Locale } from "@/app/[lang]/dictionaries";
import { getFeaturedProducts, type ProductListItem } from "@/lib/products";
import styles from "./FeaturedProducts.module.css";

interface FeaturedProductsProps {
  lang: Locale;
  /**
   * Si se pasan productos desde la página, el componente los renderiza.
   * Si no se pasan, el componente realiza la consulta internamente.
   */
  products?: ProductListItem[];
  /**
   * Límite de productos a mostrar (si el componente hace la consulta).
   */
  limit?: number;
}

/**
 * Componente de servidor reutilizable para mostrar productos destacados.
 *
 */
export default async function FeaturedProducts({
  lang,
  products: initialProducts,
  limit,
}: FeaturedProductsProps) {
  const dict = await getDictionary(lang);

  const products =
    initialProducts ?? (await getFeaturedProducts({ take: limit }));

  if (!products || products.length === 0) {
    return null;
  }

  const defaultTitle =
    dict.home?.featuredProducts ??
    dict.landing?.featuredProductsTitle ??
    "Featured";

  return (
    <div className={styles.window}>
      <TitleBar active icon={<Star variant="16x16_4" />} title={defaultTitle}>
        <TitleBarClassicOptions />
      </TitleBar>

      <Frame className={styles.windowContent}>
        <div className={styles.featuredScroll} role="list">
          <div className={styles.featuredGrid}>
            {products.map((product) => (
              <div key={product.id} role="listitem">
                <FeaturedProductCard product={product} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      </Frame>
    </div>
  );
}
