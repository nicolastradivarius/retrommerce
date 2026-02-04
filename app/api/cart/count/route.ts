import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCartItemCount } from "@/lib/cart";

/**
 * GET /api/cart/count
 * Obtiene el número total de items en el carrito del usuario
 */
export async function GET() {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ count: 0 });
    }

    const count = await getCartItemCount(userPayload.sub);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 });
  }
}
