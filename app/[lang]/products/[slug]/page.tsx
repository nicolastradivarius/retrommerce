import { Frame, TitleBar } from "@react95/core";
import { Computer } from "@react95/icons";
import BackToButton from "@/components/layout/BackToButton";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import { notFound } from "next/navigation";
import { formatPrice, hasDiscount } from "@/lib/utils";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { getProductBySlug } from "@/lib/products";
import { getReviewsByProductId } from "@/lib/reviews";
import { isProductFavorite } from "@/lib/favorites";
import BottomNav from "@/components/layout/BottomNav";
import ImageCarousel from "@/components/product/ImageCarousel";
import FavoriteButton from "@/components/ui/FavoriteButton";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ReviewSection from "@/components/review/ReviewSection";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ from?: string; reviewId?: string }>;
}) {
  const { lang, slug } = await params;
  const { from = "products", reviewId } = await searchParams;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [isFavorite, reviews] = await Promise.all([
    isProductFavorite(user?.sub, product.id),
    getReviewsByProductId(product.id),
  ]);

  // Serialize dates for client components (Date objects can't cross the server/client boundary)
  const serializedReviews = reviews.map((review) => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    replies: review.replies.map((reply) => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
    })),
  }));

  const backUrl =
    from === "home"
      ? `/${lang}/home`
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
            <TitleBarClassicOptions />
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
                {product.user && (
                  <p className={styles.publishedBy}>
                    {dict.product.publishedBy}:{" "}
                    {product.user.name || product.user.email}
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
                      initialIsFavorite={isFavorite}
                      canFavorite={Boolean(user)}
                      lang={lang}
                      dict={dict.product}
                      showLabel={true}
                    />
                  </div>

                  {product.stock > 0 && (
                    <div className={styles.cardActions}>
                      <AddToCartButton
                        productId={product.id}
                        stock={product.stock}
                        lang={lang}
                        dict={{
                          addToCart: dict.product.addToCart,
                          quantity: dict.product.quantity,
                        }}
                      />
                    </div>
                  )}
                </Frame>
              </div>
            </div>

            {product.description && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {dict.product.description}
                </h2>
                <p className={styles.description}>{product.description}</p>
              </div>
            )}

            <ReviewSection
              reviews={serializedReviews}
              productId={product.id}
              productSlug={product.slug}
              currentUserId={user?.sub}
              currentUserRole={user?.role}
              lang={lang}
              dict={dict.reviews}
              reviewIdToScroll={reviewId}
            />
          </div>
        </Frame>
      </div>
    </div>
  );
}
