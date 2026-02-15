import { Frame, TitleBar, Cursor, Button } from "@react95/core";
import { FolderOpen } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { getProductsByUser } from "@/lib/products";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";

export default async function UserProductsPage({
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

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const products = await getProductsByUser(user.sub);

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<FolderOpen variant="16x16_4" />}
            title={dict.myProducts.title}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>

          <Frame className={styles.windowContent}>
            <div className={styles.actions}>
              <Link href={`/${lang}/user/products/new`}>
                <Button className={`${styles.addButton} ${Cursor.Pointer}`}>
                  {dict.myProducts.addProduct}
                </Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <p className={styles.empty}>{dict.myProducts.empty}</p>
            ) : (
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    dict={dict.productCard}
                    canFavorite={false}
                    fromPage="user-products"
                  />
                ))}
              </div>
            )}

            <Link
              href={`/${lang}/user`}
              className={`${styles.backLink} ${Cursor.Pointer}`}
            >
              {dict.myProducts.backToUserPanel}
            </Link>
          </Frame>
        </div>
      </div>
    </div>
  );
}
