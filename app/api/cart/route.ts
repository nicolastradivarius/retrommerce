import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCartWithItems, addToCart } from "@/lib/cart";

/**
 * GET /api/cart
 * Obtiene el carrito del usuario autenticado con todos los items
 */
export async function GET() {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getCartWithItems(userPayload.sub);

    // Si no hay carrito, retornar carrito vacío
    if (!cart) {
      return NextResponse.json({
        cart: {
          items: [],
          subtotal: "0.00",
          itemCount: 0,
        },
      });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Error fetching cart" }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Agrega un producto al carrito
 * Body: { productId: string, quantity: number }
 */
export async function POST(request: NextRequest) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    // Validar datos de entrada
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 },
      );
    }

    // Agregar al carrito
    const cart = await addToCart(userPayload.sub, productId, qty);

    if (!cart) {
      return NextResponse.json(
        { error: "Error adding to cart" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error: unknown) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Error adding to cart" },
      { status: 500 },
    );
  }
}
