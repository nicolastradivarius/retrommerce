import type { OrderStatus, PaymentStatus } from "@/app/generated/prisma";

/**
 * Translates a MercadoPago payment status string into the DB enum values
 * used by the Order model.
 *
 * MP statuses: approved | pending | in_process | rejected | cancelled | refunded | charged_back
 */
export function mapMPStatus(mpStatus: string | undefined): {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
} {
  switch (mpStatus) {
    case "approved":
      return { orderStatus: "CONFIRMED", paymentStatus: "PAID" };
    case "pending":
    case "in_process":
      return { orderStatus: "PENDING", paymentStatus: "PENDING" };
    default:
      return { orderStatus: "CANCELLED", paymentStatus: "FAILED" };
  }
}
