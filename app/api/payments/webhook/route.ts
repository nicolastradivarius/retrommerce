import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Payment } from "mercadopago";
import { mp } from "@/lib/mercadopago";
import { mapMPStatus } from "@/lib/mercadopago-utils";
import { prisma } from "@/lib/prisma";

// ── Signature validation ──────────────────────────────────────────────────────

/**
 * Validates the MercadoPago webhook signature.
 * Docs: https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks#validarsignaturanotificaciones
 */
function isValidSignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // Skip in local dev when secret is not configured

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const dataId = new URL(request.url).searchParams.get("data.id");

  if (!xSignature || !xRequestId) return false;

  // Extract ts and v1 from the x-signature header (format: "ts=<ts>,v1=<hash>")
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => part.split("=") as [string, string]),
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  // Build the manifest string used for signing
  // MP signs: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
  const manifest = [
    dataId ? `id:${dataId}` : null,
    `request-id:${xRequestId}`,
    `ts:${ts}`,
  ]
    .filter(Boolean)
    .join(";")
    .concat(";");

  const hash = createHmac("sha256", secret).update(manifest).digest("hex");

  return hash === v1;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Read raw body (needed for signature validation)
  let rawBody: string;
  let payload: { type?: string; data?: { id?: string } };

  try {
    rawBody = await request.text();
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // 2. Validate signature
  if (!isValidSignature(request, rawBody)) {
    console.warn("[webhook] Invalid MP signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. Only handle payment notifications
  // MP also sends "test", "merchant_order", etc. — we ignore those.
  if (payload.type !== "payment") {
    return NextResponse.json({ received: true });
  }

  const mpPaymentId = payload.data?.id;
  if (!mpPaymentId) {
    return NextResponse.json({ error: "Missing data.id" }, { status: 400 });
  }

  // 4. Fetch the up-to-date payment from MP
  let mpPayment;
  try {
    const paymentClient = new Payment(mp);
    mpPayment = await paymentClient.get({ id: mpPaymentId });
  } catch (err) {
    console.error("[webhook] Failed to fetch payment from MP:", err);
    return NextResponse.json(
      { error: "Could not retrieve payment" },
      { status: 502 },
    );
  }

  // 5. Find the matching order using the external_reference (our orderNumber)
  const orderNumber = mpPayment.external_reference;
  if (!orderNumber) {
    // Payment not created by this app — ignore silently
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber },
    select: { id: true, paymentStatus: true },
  });

  if (!order) {
    console.warn(`[webhook] Order not found for orderNumber: ${orderNumber}`);
    // Return 200 so MP does not keep retrying
    return NextResponse.json({ received: true });
  }

  // 6. Update order only if the status actually changed to avoid noise
  const { orderStatus, paymentStatus } = mapMPStatus(mpPayment.status);

  if (order.paymentStatus !== paymentStatus) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus,
      },
    });

    console.info(
      `[webhook] Order ${orderNumber} updated → status=${orderStatus}, paymentStatus=${paymentStatus}`,
    );
  }

  // 7. Always return 200 — MP retries on any non-2xx response
  return NextResponse.json({ received: true });
}
