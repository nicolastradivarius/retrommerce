import { Frame, TitleBar, Button, Cursor } from "@react95/core";
import { Folder, Computer } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";
import BottomNav from "@/components/layout/BottomNav";
import CartItem from "@/components/cart/CartItem";
import ClearCartButton from "@/components/cart/ClearCartButton";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { formatPrice } from "@/lib/utils";
import styles from "./page.module.css";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";

export default async function CartPage({
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

  const cart = await getCartWithItems(user.sub);

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <Frame className={styles.cartFrame}>
          <TitleBar
            active
            icon={<Folder variant="16x16_4" />}
            title={dict.cart.title}
          >
            <TitleBarClassicOptions />
          </TitleBar>

          <div className={styles.frameBody}>
            {isEmpty ? (
              <div className={styles.emptyCart}>
                <Computer variant="32x32_4" />
                <h2 className={styles.emptyTitle}>{dict.cart.empty}</h2>
                <p className={styles.emptyDescription}>
                  {dict.cart.emptyDescription}
                </p>
                <Link href={`/${lang}/products`}>
                  <Button
                    className={`${styles.continueButton} ${Cursor.Pointer}`}
                  >
                    {dict.cart.continueShopping}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className={styles.cartContent}>
                <div className={styles.itemsSection}>
                  <h2 className={styles.sectionTitle}>
                    {dict.cart.itemsInCart.replace(
                      "{count}",
                      String(cart.itemCount),
                    )}
                  </h2>

                  <div className={styles.itemsList}>
                    {cart.items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        lang={lang}
                        dict={{
                          quantity: dict.cart.quantity,
                          price: dict.cart.price,
                          itemTotal: dict.cart.itemTotal,
                          removeFromCart: dict.cart.removeFromCart,
                          outOfStock: dict.cart.outOfStock,
                          maxQuantity: dict.cart.maxQuantity,
                        }}
                      />
                    ))}
                  </div>

                  <div className={styles.cartActions}>
                    <Link href={`/${lang}/products`}>
                      <Button
                        className={`${styles.actionButton} ${Cursor.Pointer}`}
                      >
                        {dict.cart.continueShopping}
                      </Button>
                    </Link>

                    <ClearCartButton
                      dict={{
                        clearCart: dict.cart.clearCart,
                        clearCartConfirm: dict.cart.clearCartConfirm,
                        confirm: dict.common.confirm,
                        cancel: dict.common.cancel,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.summarySection}>
                  <Frame className={styles.summaryFrame}>
                    <h3 className={styles.summaryTitle}>{dict.cart.title}</h3>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        {dict.cart.subtotal}:
                      </span>
                      <span className={styles.summaryValue}>
                        {formatPrice(cart.subtotal)}
                      </span>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        {dict.cart.shipping}:
                      </span>
                      <span className={styles.summaryValue}>
                        {dict.cart.shippingTbd}
                      </span>
                    </div>

                    <div className={styles.separator} />

                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span className={styles.totalLabel}>
                        {dict.cart.total}:
                      </span>
                      <span className={styles.totalValue}>
                        {formatPrice(cart.subtotal)}
                      </span>
                    </div>

                    <Link href={`/${lang}/cart/checkout`}>
                      <Button
                        className={`${styles.checkoutButton} ${Cursor.Pointer}`}
                      >
                        {dict.cart.proceedToCheckout}
                      </Button>
                    </Link>
                  </Frame>
                </div>
              </div>
            )}
          </div>
        </Frame>
      </div>
    </div>
  );
}
