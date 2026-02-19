import { Frame, TitleBar, Button, Cursor, Avatar } from "@react95/core";
import {
  Computer,
  Mmsys120,
  Progman36,
  Wmsui322225,
  Msnstart1,
  FolderExe,
} from "@react95/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedProducts from "@/components/product/FeaturedProducts";
import BottomNav from "@/components/layout/BottomNav";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import styles from "./page.module.css";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import {
  getHomepageFeaturedProduct,
  getCategoriesWithCount,
} from "@/lib/products";
import Image from "next/image";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();
  const dealOfTheDay = await getHomepageFeaturedProduct();
  const categories = await getCategoriesWithCount();

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        {/* Hero Section */}
        <div className={styles.heroWindow}>
          <TitleBar
            active
            icon={<Computer variant="16x16_4" />}
            title="Retrommerce.exe"
          >
            <TitleBarClassicOptions />
          </TitleBar>
          <Frame className={styles.heroContent}>
            <div className={styles.heroInner}>
              <div className={styles.heroLeft}>
                {user && user.avatar ? (
                  <div className={styles.heroAvatarContainer}>
                    <Avatar
                      src={user.avatar}
                      alt={user.name || user.email}
                      size="64px"
                    />
                  </div>
                ) : (
                  <div className={styles.heroIcon}>
                    <Computer variant="32x32_4" />
                  </div>
                )}
                <h1 className={styles.heroTitle}>
                  {user
                    ? dict.landing.welcomeUser.replace(
                        "{username}",
                        user.name || user.email,
                      )
                    : dict.landing.welcome}
                </h1>
                <p className={styles.heroTagline}>{dict.landing.tagline}</p>
                <p className={styles.heroDescription}>
                  {dict.landing.description}
                </p>
                <Link href={`/${lang}/products`} className={Cursor.Pointer}>
                  <Button className={`${styles.ctaButton} ${Cursor.Pointer}`}>
                    <Msnstart1 variant="32x32_8" />
                    {dict.landing.viewCatalog}
                  </Button>
                </Link>
              </div>

              {dealOfTheDay && (
                <div className={styles.heroRight}>
                  <Frame className={styles.dealFrame}>
                    <div className={styles.dealHeader}>
                      <Msnstart1 variant="16x16_4" />
                      <h2 className={styles.dealTitle}>
                        {dict.landing.dealOfTheDay}
                      </h2>
                    </div>
                    <div className={styles.dealContent}>
                      {dealOfTheDay.images[0] && (
                        <div className={styles.dealImage}>
                          <Image
                            src={dealOfTheDay.images[0]}
                            alt={dealOfTheDay.name}
                            width={200}
                            height={200}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      )}
                      <h3 className={styles.dealProductName}>
                        {dealOfTheDay.name}
                      </h3>
                      {dealOfTheDay.manufacturer && (
                        <p className={styles.dealManufacturer}>
                          {dealOfTheDay.manufacturer}
                        </p>
                      )}
                      {dealOfTheDay.year && (
                        <p className={styles.dealYear}>{dealOfTheDay.year}</p>
                      )}
                      <div className={styles.dealPricing}>
                        <span className={styles.dealOriginalPrice}>
                          ${dealOfTheDay.originalPrice.toString()}
                        </span>
                        <span className={styles.dealPrice}>
                          ${dealOfTheDay.price.toString()}
                        </span>
                      </div>
                      <Link
                        href={`/${lang}/products/${dealOfTheDay.slug}`}
                        className={Cursor.Pointer}
                      >
                        <Button
                          className={`${styles.dealButton} ${Cursor.Pointer}`}
                        >
                          {dict.landing.viewProduct}
                        </Button>
                      </Link>
                    </div>
                  </Frame>
                </div>
              )}
            </div>

            {/* Barra de categorías */}
            {categories.length > 0 && (
              <div className={styles.categoriesBar}>
                <div className={styles.categoriesHeader}>
                  <FolderExe variant="16x16_4" />
                  <span className={styles.categoriesTitle}>
                    {dict.landing.exploreCategories}
                  </span>
                </div>
                <div className={styles.categoriesList}>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${lang}/products?categories=${category.slug}&page=1`}
                      className={`${styles.categoryLink} ${Cursor.Pointer}`}
                    >
                      <Frame className={styles.categoryItem}>
                        <FolderExe variant="16x16_4" />
                        <span className={styles.categoryName}>
                          {category.name}
                        </span>
                        <span className={styles.categoryCount}>
                          ({category.count})
                        </span>
                      </Frame>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Frame>
        </div>

        <FeaturedProducts lang={lang} />

        {/* Features Section */}
        <div className={styles.featuresWindow}>
          <TitleBar
            active
            icon={<Wmsui322225 variant="16x16_4" />}
            title={dict.landing.features.title}
          >
            <TitleBarClassicOptions />
          </TitleBar>
          <Frame className={styles.featuresContent}>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <Frame className={styles.featureFrame}>
                  <div className={styles.featureIcon}>
                    <Computer variant="32x32_4" />
                  </div>
                  <h3 className={styles.featureTitle}>
                    {dict.landing.features.quality}
                  </h3>
                  <p className={styles.featureDescription}>
                    {dict.landing.features.qualityDesc}
                  </p>
                </Frame>
              </div>

              <div className={styles.featureCard}>
                <Frame className={styles.featureFrame}>
                  <div className={styles.featureIcon}>
                    <Progman36 variant="32x32_4" />
                  </div>
                  <h3 className={styles.featureTitle}>
                    {dict.landing.features.shipping}
                  </h3>
                  <p className={styles.featureDescription}>
                    {dict.landing.features.shippingDesc}
                  </p>
                </Frame>
              </div>

              <div className={styles.featureCard}>
                <Frame className={styles.featureFrame}>
                  <div className={styles.featureIcon}>
                    <Mmsys120 variant="32x32_4" />
                  </div>
                  <h3 className={styles.featureTitle}>
                    {dict.landing.features.support}
                  </h3>
                  <p className={styles.featureDescription}>
                    {dict.landing.features.supportDesc}
                  </p>
                </Frame>
              </div>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
