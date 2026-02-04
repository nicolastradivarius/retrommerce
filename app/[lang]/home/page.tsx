import { Frame, TitleBar, Button, Cursor, Avatar } from "@react95/core";
import {
  Computer,
  Mmsys120,
  Progman36,
  Wmsui322225,
  Msnstart1,
} from "@react95/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedProducts from "../components/FeaturedProducts";
import BottomNav from "../components/BottomNav";
import styles from "./page.module.css";
import { getDictionary, hasLocale } from "../dictionaries";
import { getCurrentUserWithAvatar } from "@/lib/auth";

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
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>
          <Frame className={styles.heroContent}>
            <div className={styles.heroInner}>
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
              <Link href={`/${lang}/products`}>
                <Button className={`${styles.ctaButton} ${Cursor.Pointer}`}>
                  <Msnstart1 variant="32x32_8" />
                  {dict.landing.viewCatalog}
                </Button>
              </Link>
            </div>
          </Frame>
        </div>

        <FeaturedProducts lang={lang} fromPage="home" />

        {/* Features Section */}
        <div className={styles.featuresWindow}>
          <TitleBar
            active
            icon={<Wmsui322225 variant="16x16_4" />}
            title={dict.landing.features.title}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
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
