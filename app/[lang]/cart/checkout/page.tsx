import { redirect, notFound } from "next/navigation";
import { Frame, TitleBar } from "@react95/core";
import { Mspaint } from "@react95/icons";
import Link from "next/link";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import BottomNav from "@/components/layout/BottomNav";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import CheckoutForm from "@/components/cart/CheckoutForm";
import styles from "./page.module.css";

export default async function CheckoutPage({
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
    redirect(`/${lang}/login?redirect=/${lang}/cart/checkout`);
  }

  const cart = await getCartWithItems(user.sub);

  // Empty cart — send back to cart page
  if (!cart || cart.items.length === 0) {
    redirect(`/${lang}/cart`);
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      street: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      phone: true,
      isDefault: true,
    },
  });

  const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<Mspaint variant="16x16_4" />}
            title={dict.checkout.title}
          >
            <TitleBarClassicOptions />
          </TitleBar>

          <Frame className={styles.windowContent}>
            {/* Back link */}
            <div className={styles.backRow}>
              <Link href={`/${lang}/cart`} className={styles.backLink}>
                {dict.checkout.backToCart}
              </Link>
            </div>

            {/* No addresses — nudge user to add one */}
            {addresses.length === 0 ? (
              <div className={styles.noAddresses}>
                <p className={styles.noAddressesText}>
                  {dict.checkout.noAddresses}
                </p>
                <Link
                  href={`/${lang}/user/profile-info`}
                  className={styles.addAddressLink}
                >
                  {dict.checkout.addAddressFirst}
                </Link>
              </div>
            ) : (
              <CheckoutForm
                addresses={addresses}
                cart={cart}
                lang={lang}
                mpPublicKey={mpPublicKey}
                dict={dict.checkout}
              />
            )}
          </Frame>
        </div>
      </div>
    </div>
  );
}
