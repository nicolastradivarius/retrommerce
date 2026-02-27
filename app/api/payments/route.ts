import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getCurrentUser } from "@/lib/auth";
import { mp } from "@/lib/mercadopago";
import { mapMPStatus } from "@/lib/mercadopago-utils";
import { prisma } from "@/lib/prisma";
import { getCartWithItems } from "@/lib/cart";
import type { CartItemWithProduct } from "@/lib/cart";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `RMM-${year}${month}${day}-${random}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate request body
  let body: {
    token?: string;
    installments?: number;
    paymentMethodId?: string;
    issuerId?: string;
    addressId?: string;
    identificationType?: string;
    identificationNumber?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const {
    token,
    installments,
    paymentMethodId,
    issuerId,
    addressId,
    identificationType,
    identificationNumber,
  } = body;

  if (!token || !paymentMethodId || !addressId) {
    return NextResponse.json(
      { error: "Missing required fields: token, paymentMethodId, addressId" },
      { status: 400 },
    );
  }

  // 3. Verify the address belongs to the authenticated user
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.sub },
  });

  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  // 4. Load the user's cart
  const cart = await getCartWithItems(user.sub);

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // 5. Validate stock availability for every item in the cart
  const outOfStockItems: string[] = [];

  for (const item of cart.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product || product.stock < item.quantity) {
      outOfStockItems.push(item.product.name);
    }
  }

  if (outOfStockItems.length > 0) {
    return NextResponse.json(
      {
        error: "Some products are out of stock",
        items: outOfStockItems,
      },
      { status: 409 },
    );
  }

  // 6. Create payment in MercadoPago
  // Pre-generate the order number so it can be passed as external_reference.
  // This lets you cross-reference orders between your DB and the MP dashboard.
  const orderNumber = generateOrderNumber();
  const paymentClient = new Payment(mp);
  const transactionAmount = parseFloat(cart.subtotal);

  let mpPayment;
  try {
    mpPayment = await paymentClient.create({
      body: {
        transaction_amount: transactionAmount,
        token,
        description: `Retrommerce — ${cart.itemCount} artículo(s)`,
        external_reference: orderNumber,
        installments: Number(installments) || 1,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId ? Number(issuerId) : undefined,
        payer: {
          email: user.email,
          identification: identificationType && identificationNumber
            ? { type: identificationType, number: identificationNumber }
            : undefined,
        },
      },
      requestOptions: { idempotencyKey: orderNumber },
    });
  } catch (err) {
    console.error("[payments] MercadoPago API error:", err);
    return NextResponse.json(
      { error: "Payment gateway error. Please try again." },
      { status: 502 },
    );
  }

  // 7. Handle rejected payments — do not create an order
  if (mpPayment.status === "rejected") {
    return NextResponse.json(
      {
        error: "Payment rejected",
        // status_detail gives the specific rejection reason (e.g. cc_rejected_insufficient_amount)
        detail: mpPayment.status_detail ?? "rejected",
      },
      { status: 422 },
    );
  }

  // 8. Persist the Order in our DB inside a transaction
  const { orderStatus, paymentStatus } = mapMPStatus(mpPayment.status);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Create the Order with its line items
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.sub,
          addressId,
          subtotal: transactionAmount,
          shipping: 0,
          tax: 0,
          total: transactionAmount,
          status: orderStatus,
          paymentStatus,
          // Store the MP payment ID for reference / reconciliation
          notes: `MP Payment ID: ${mpPayment.id ?? "unknown"}`,
          items: {
            create: cart.items.map((item: CartItemWithProduct) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: parseFloat(item.product.price),
            })),
          },
        },
      });

      // Decrement stock for each purchased product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear the cart
      const userCart = await tx.cart.findUnique({
        where: { userId: user.sub },
        select: { id: true },
      });

      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      return created;
    });
  } catch (err) {
    // The MP payment already went through — log prominently so the team can
    // manually reconcile if the DB write failed.
    console.error(
      "[payments] CRITICAL: MP payment succeeded but DB transaction failed.",
      { mpPaymentId: mpPayment.id, userId: user.sub },
      err,
    );
    return NextResponse.json(
      { error: "Order could not be saved. Please contact support." },
      { status: 500 },
    );
  }

  // 9. Return the result to the frontend
  return NextResponse.json(
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: mpPayment.status,
    },
    { status: 201 },
  );
}
