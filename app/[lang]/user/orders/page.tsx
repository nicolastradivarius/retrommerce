import { Frame, TitleBar, Cursor, Button } from "@react95/core";
import { Folder, FaxWarning } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { getOrdersByUserId } from "@/lib/orders";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import BottomNav from "@/components/layout/BottomNav";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import { formatPrice } from "@/lib/utils";
import styles from "./page.module.css";

const PAGE_SIZE = 10;

export default async function UserOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const { page: pageParam } = await searchParams;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  const { orders, total } = await getOrdersByUserId(
    user.sub,
    currentPage,
    PAGE_SIZE,
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const d = dict.myOrders;

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar active icon={<Folder variant="16x16_4" />} title={d.title}>
            <TitleBarClassicOptions />
          </TitleBar>

          <Frame className={styles.windowContent}>
            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <FaxWarning variant="32x32_4" />
                <p className={styles.emptyText}>{d.empty}</p>
                <Link
                  href={`/${lang}/home`}
                  className={`${styles.shopLink} ${Cursor.Pointer}`}
                >
                  {d.continueShopping}
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.orderList}>
                  {orders.map((order) => {
                    const isPaid = order.paymentStatus === "PAID";
                    const isPending = order.paymentStatus === "PENDING";

                    return (
                      <div key={order.id} className={styles.orderCard}>
                        {/* ── Header ── */}
                        <div className={styles.orderHeader}>
                          <div className={styles.orderMeta}>
                            <span className={styles.orderNumber}>
                              {d.orderNumber}: {order.orderNumber}
                            </span>
                            <span className={styles.orderDate}>
                              {new Date(order.createdAt).toLocaleDateString(
                                lang === "es" ? "es-AR" : "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <div className={styles.badges}>
                            {/* Payment status badge */}
                            <span
                              className={`${styles.badge} ${
                                isPaid
                                  ? styles.badgePaid
                                  : isPending
                                    ? styles.badgePending
                                    : styles.badgeFailed
                              }`}
                            >
                              {isPaid
                                ? d.paid
                                : isPending
                                  ? d.pending
                                  : d.failed}
                            </span>

                            {/* Order status badge */}
                            <span
                              className={`${styles.badge} ${styles.badgeOrder}`}
                            >
                              {d.statuses[order.status] ?? order.status}
                            </span>
                          </div>
                        </div>

                        {/* ── Items ── */}
                        <div className={styles.itemList}>
                          {order.items.map((item) => (
                            <div key={item.id} className={styles.item}>
                              <span className={styles.itemName}>
                                <Link
                                  href={`/${lang}/products/${item.product.slug}`}
                                  className={styles.itemLink}
                                  prefetch={false}
                                >
                                  {item.product.name}
                                </Link>
                                <span className={styles.itemQty}>
                                  {" "}
                                  ×{item.quantity}
                                </span>
                              </span>
                              <span className={styles.itemPrice}>
                                {formatPrice(
                                  (
                                    parseFloat(item.price.toString()) *
                                    item.quantity
                                  ).toFixed(2),
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* ── Footer ── */}
                        <div className={styles.orderFooter}>
                          <span className={styles.addressSummary}>
                            {order.address.fullName} — {order.address.street},{" "}
                            {order.address.city}
                          </span>
                          <span className={styles.orderTotal}>
                            {d.total}:{" "}
                            <strong>
                              {formatPrice(order.total.toString())}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    {safePage > 1 ? (
                      <Link
                        href={`/${lang}/user/orders?page=${safePage - 1}`}
                        className={`${styles.pageButton} ${Cursor.Pointer}`}
                      >
                        <Button>{d.previous}</Button>
                      </Link>
                    ) : (
                      <Button disabled>{d.previous}</Button>
                    )}

                    <span className={styles.pageInfo}>
                      {d.page} {safePage} {d.of} {totalPages}
                    </span>

                    {safePage < totalPages ? (
                      <Link
                        href={`/${lang}/user/orders?page=${safePage + 1}`}
                        className={`${styles.pageButton} ${Cursor.Pointer}`}
                      >
                        <Button>{d.next}</Button>
                      </Link>
                    ) : (
                      <Button disabled>{d.next}</Button>
                    )}
                  </div>
                )}
              </>
            )}

            <Link
              href={`/${lang}/user`}
              className={`${styles.backLink} ${Cursor.Pointer}`}
            >
              {dict.common.backToUserPanel}
            </Link>
          </Frame>
        </div>
      </div>
    </div>
  );
}
