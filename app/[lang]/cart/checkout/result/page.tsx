import { notFound, redirect } from "next/navigation";
import { Frame, TitleBar } from "@react95/core";
import { FaxWarning, HelpBook, Msrating106 } from "@react95/icons";
import Link from "next/link";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import BottomNav from "@/components/layout/BottomNav";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import { formatPrice } from "@/lib/utils";
import styles from "./page.module.css";

export default async function CheckoutResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { lang } = await params;
  const { orderId } = await searchParams;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  if (!orderId) {
    redirect(`/${lang}/cart`);
  }

  // Fetch the order, verifying it belongs to the authenticated user
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.sub },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, images: true },
          },
        },
      },
      address: true,
    },
  });

  if (!order) {
    return (
      <div className={styles.container}>
        <BottomNav lang={lang} dict={dict.navigation} user={user} />
        <div className={styles.main}>
          <div className={styles.window}>
            <TitleBar
              active
              icon={<FaxWarning variant="16x16_4" />}
              title={dict.checkoutResult.notFound}
            >
              <TitleBarClassicOptions />
            </TitleBar>
            <Frame className={styles.windowContent}>
              <div className={styles.statusBox}>
                <p className={styles.statusMessage}>
                  {dict.checkoutResult.notFoundMessage}
                </p>
                <Link href={`/${lang}/home`} className={styles.actionButton}>
                  {dict.checkoutResult.continueShopping}
                </Link>
              </div>
            </Frame>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = order.paymentStatus === "PAID";
  const isPending = order.paymentStatus === "PENDING";

  // Pick title, message and icon based on payment status
  let title: string;
  let message: string;
  let statusClass: string;

  if (isApproved) {
    title = dict.checkoutResult.approvedTitle;
    message = dict.checkoutResult.approvedMessage;
    statusClass = styles.statusApproved;
  } else if (isPending) {
    title = dict.checkoutResult.pendingTitle;
    message = dict.checkoutResult.pendingMessage;
    statusClass = styles.statusPending;
  } else {
    title = dict.checkoutResult.failedTitle;
    message = dict.checkoutResult.failedMessage;
    statusClass = styles.statusFailed;
  }

  const windowIcon = isApproved ? (
    <Msrating106 variant="16x16_4" />
  ) : isPending ? (
    <HelpBook variant="16x16_4" />
  ) : (
    <FaxWarning variant="16x16_4" />
  );

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar active icon={windowIcon} title={title}>
            <TitleBarClassicOptions />
          </TitleBar>

          <Frame className={styles.windowContent}>
            {/* ── Status banner ── */}
            <div className={`${styles.statusBanner} ${statusClass}`}>
              <span className={styles.statusIcon}>
                {isApproved ? "✔" : isPending ? "⏳" : "✖"}
              </span>
              <div className={styles.statusText}>
                <strong className={styles.statusTitle}>{title}</strong>
                <p className={styles.statusMessage}>{message}</p>
              </div>
            </div>

            {/* ── Order details ── */}
            <div className={styles.details}>
              {/* Order number + total */}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  {dict.checkoutResult.orderNumber}:
                </span>
                <span className={styles.metaValue}>{order.orderNumber}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  {dict.checkoutResult.total}:
                </span>
                <span className={styles.metaValue}>
                  {formatPrice(order.total.toString())}
                </span>
              </div>

              <div className={styles.separator} />

              {/* Items */}
              <div className={styles.itemList}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <span className={styles.itemName}>
                      {item.product.name}
                      <span className={styles.itemQty}> ×{item.quantity}</span>
                    </span>
                    <span className={styles.itemPrice}>
                      {formatPrice(
                        (
                          parseFloat(item.price.toString()) * item.quantity
                        ).toFixed(2),
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.separator} />

              {/* Shipping address */}
              <div className={styles.addressBlock}>
                <p className={styles.addressLine}>{order.address.fullName}</p>
                <p className={styles.addressLine}>{order.address.street}</p>
                <p className={styles.addressLine}>
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.zipCode}
                </p>
                <p className={styles.addressLine}>{order.address.country}</p>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className={styles.actions}>
              <Link
                href={`/${lang}/user/orders`}
                className={styles.actionButton}
              >
                {dict.checkoutResult.viewOrders}
              </Link>
              <Link
                href={`/${lang}/home`}
                className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
              >
                {dict.checkoutResult.continueShopping}
              </Link>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
