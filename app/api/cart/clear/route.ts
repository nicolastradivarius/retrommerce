import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { clearCart } from "@/lib/cart";

/**
 * POST /api/cart/clear
 * Vacía el carrito del usuario eliminando todos los items
 */
export async function POST() {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await clearCart(userPayload.sub);

    if (!success) {
      return NextResponse.json(
        { error: "Error clearing cart" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json({ error: "Error clearing cart" }, { status: 500 });
  }
}
