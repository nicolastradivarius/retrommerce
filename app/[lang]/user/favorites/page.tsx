import { Frame, TitleBar } from "@react95/core";
import { FolderOpen } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "../../components/BottomNav";
import ProductCard from "../../components/ProductCard";
import { getDictionary, hasLocale } from "../../dictionaries";
import styles from "./page.module.css";

export default async function FavoritesPage({
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

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.sub },
        orderBy: { createdAt: "desc" },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    price: true,
                    originalPrice: true,
                    year: true,
                    manufacturer: true,
                    stock: true,
                    images: true,
                    featured: true,
                },
            },
        },
    });

    const products = favorites.map((favorite) => favorite.product);

    return (
        <div className={styles.container}>
            <BottomNav lang={lang} dict={dict.navigation} user={user} />

            <div className={styles.main}>
                <div className={styles.window}>
                    <TitleBar
                        active
                        icon={<FolderOpen variant="16x16_4" />}
                        title={dict.favorites.title}
                    >
                        <TitleBar.OptionsBox>
                            <TitleBar.Minimize />
                            <TitleBar.Restore />
                            <TitleBar.Close />
                        </TitleBar.OptionsBox>
                    </TitleBar>

                    <Frame className={styles.windowContent}>
                        {products.length === 0 ? (
                            <p className={styles.empty}>{dict.favorites.empty}</p>
                        ) : (
                            <div className={styles.grid}>
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        lang={lang}
                                        dict={dict}
                                        isFavorite
                                        canFavorite
                                        fromPage="favorites"
                                    />
                                ))}
                            </div>
                        )}

                        <Link href={`/${lang}/products`} className={styles.backLink}>
                            {dict.favorites.backToProducts}
                        </Link>
                    </Frame>
                </div>
            </div>
        </div>
    );
}