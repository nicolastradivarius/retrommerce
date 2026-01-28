import { Frame, Button, TitleBar } from "@react95/core";
import { Computer } from "@react95/icons";
import BackToButton from "@/app/[lang]/components/BackToButton";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, hasDiscount } from "@/lib/utils";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/app/[lang]/components/BottomNav";
import ImageCarousel from "@/app/[lang]/components/ImageCarousel";
import FavoriteButton from "@/app/[lang]/components/FavoriteButton";
import { getDictionary, hasLocale } from "../../dictionaries";
import styles from "./page.module.css";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { lang, slug } = await params;
  const { from = "products" } = await searchParams;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

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

  const isFavorite = user
    ? await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: user.sub,
            productId: product.id,
          },
        },
        select: { id: true },
      })
    : null;

  const backUrl =
    from === "home"
      ? `/${lang}`
      : from === "favorites"
        ? `/${lang}/user/favorites`
        : `/${lang}/products`;

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.backLink}>
          <BackToButton href={backUrl} lang={lang} />
        </div>

        <Frame className={styles.productFrame}>
          <TitleBar
            active
            icon={<Computer variant="16x16_4" />}
            title={product.name}
            className={styles.titleBar}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>
          <div className={styles.frameBody}>
            <div className={styles.productHeader}>
              <div>
                {product.manufacturer && (
                  <p className={styles.manufacturer}>
                    {dict.product.manufacturer}: {product.manufacturer}
                  </p>
                )}
                {product.year && (
                  <p className={styles.year}>
                    {dict.product.year}: {product.year}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.productLayout}>
              <div className={styles.leftColumn}>
                <ImageCarousel
                  images={product.images}
                  productName={product.name}
                />

                {product.description && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {dict.product.description}
                    </h2>
                    <p className={styles.description}>{product.description}</p>
                  </div>
                )}
              </div>

              <div className={styles.rightColumn}>
                <Frame className={styles.infoCard}>
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {dict.product.price}
                    </h2>
                    <div className={styles.priceSection}>
                      <span className={styles.price}>
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount(product.price, product.originalPrice) && (
                        <span className={styles.originalPrice}>
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {dict.product.availability}
                    </h2>
                    <p className={styles.stock}>
                      {product.stock > 0
                        ? dict.product.unitsAvailable.replace(
                            "{count}",
                            String(product.stock),
                          )
                        : dict.product.outOfStock}
                    </p>
                  </div>

                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {dict.product.category}
                    </h2>
                    <p className={styles.category}>{product.category.name}</p>
                  </div>

                  <div className={styles.favoriteRow}>
                    <FavoriteButton
                      productId={product.id}
                      initialIsFavorite={Boolean(isFavorite)}
                      canFavorite={Boolean(user)}
                      lang={lang}
                      dict={dict.product}
                      showLabel={true}
                    />
                  </div>

                  {product.stock > 0 && (
                    <div className={styles.cardActions}>
                      <Frame className={styles.addToCartFrame}>
                        <Button className={styles.addToCartButton}>
                          {dict.product.addToCart}
                        </Button>
                      </Frame>
                    </div>
                  )}
                </Frame>
              </div>
            </div>

            {specs && Object.keys(specs).length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {dict.product.technicalSpecs}
                </h2>
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
          </div>
        </Frame>
      </div>
    </div>
  );
}
