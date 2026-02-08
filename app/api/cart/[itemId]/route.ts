import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateCartItemQuantity, removeFromCart } from "@/lib/cart";

/**
 * PUT /api/cart/[itemId]
 * Actualiza la cantidad de un item en el carrito
 * Body: { quantity: number }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    // Validar cantidad
    const qty = parseInt(quantity);
    if (isNaN(qty)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Actualizar cantidad del item
    const cart = await updateCartItemQuantity(userPayload.sub, itemId, qty);

    if (!cart) {
      return NextResponse.json(
        { error: "Error updating cart" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error: unknown) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Error updating cart" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/[itemId]
 * Elimina un item del carrito
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    // Eliminar item del carrito
    const cart = await removeFromCart(userPayload.sub, itemId);

    if (!cart) {
      return NextResponse.json(
        { error: "Error removing from cart" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error: unknown) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Error removing from cart" },
      { status: 500 },
    );
  }
}
