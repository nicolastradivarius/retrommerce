import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Tipo para un item del carrito con información del producto.
 * Los precios se serializan a strings para compatibilidad con el frontend.
 */
export type CartItemWithProduct = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    originalPrice: string;
    stock: number;
    images: string[];
    manufacturer: string | null;
  };
};

/**
 * Tipo para el carrito completo con items y totales calculados.
 */
export type CartWithItems = {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  subtotal: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Obtiene o crea el carrito de un usuario.
 * Si el usuario no tiene carrito, se crea uno nuevo.
 *
 * @param userId - ID del usuario
 * @returns El carrito del usuario
 */
export async function getOrCreateCart(userId: string) {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  } catch (error) {
    console.error("Error getting or creating cart for user", userId, error);
    throw new Error("Failed to get or create cart");
  }
}

/**
 * Obtiene el carrito del usuario con todos los items y productos.
 * Calcula el subtotal automáticamente.
 *
 * @param userId - ID del usuario
 * @returns El carrito completo con items y totales, o null si no existe
 */
export async function getCartWithItems(
  userId: string,
): Promise<CartWithItems | null> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                stock: true,
                images: true,
                manufacturer: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      return null;
    }

    // Serializar precios y calcular subtotal
    const items: CartItemWithProduct[] = cart.items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price.toString(),
        originalPrice: item.product.originalPrice.toString(),
        stock: item.product.stock,
        images: item.product.images,
        manufacturer: item.product.manufacturer,
      },
    }));

    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = parseFloat(item.product.price);
      return sum + itemPrice * item.quantity;
    }, 0);

    // Calcular cantidad total de items
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal: subtotal.toFixed(2),
      itemCount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching cart with items for user", userId, error);
    return null;
  }
}

/**
 * Agrega un producto al carrito del usuario.
 * Si el producto ya existe en el carrito, suma la cantidad.
 * Valida que hay stock suficiente.
 *
 * @param userId - ID del usuario
 * @param productId - ID del producto a agregar
 * @param quantity - Cantidad a agregar (default: 1)
 * @returns El carrito actualizado o null si hay error
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
): Promise<CartWithItems | null> {
  try {
    // Validar cantidad
    if (quantity <= 0) {
      return null;
    }

    // Verificar que el producto existe y tiene stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      return null;
    }

    // Obtener o crear carrito
    const cart = await getOrCreateCart(userId);

    // Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      // Calcular nueva cantidad total
      const newQuantity = existingItem.quantity + quantity;

      // Validar stock
      if (newQuantity > product.stock) {
        return null;
      }

      // Actualizar cantidad
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Validar stock para nuevo item
      if (quantity > product.stock) {
        return null;
      }

      // Crear nuevo item en el carrito
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    // Retornar carrito actualizado
    return await getCartWithItems(userId);
  } catch (error) {
    console.error(
      "Error adding to cart",
      { userId, productId, quantity },
      error,
    );
    throw error;
  }
}

/**
 * Actualiza la cantidad de un item en el carrito.
 * Si la cantidad es 0 o menor, elimina el item.
 * Valida que hay stock suficiente.
 *
 * @param userId - ID del usuario (para validación)
 * @param cartItemId - ID del item del carrito a actualizar
 * @param quantity - Nueva cantidad
 * @returns El carrito actualizado o null si hay error
 */
export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number,
): Promise<CartWithItems | null> {
  try {
    // Obtener el item con su producto para validar
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: {
          select: { stock: true },
        },
      },
    });

    if (!cartItem) {
      return null;
    }

    // Validar que el item pertenece al usuario
    if (cartItem.cart.userId !== userId) {
      return null;
    }

    // Si la cantidad es 0 o menor, eliminar el item
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
      return await getCartWithItems(userId);
    }

    // Validar stock
    if (quantity > cartItem.product.stock) {
      return null;
    }

    // Actualizar cantidad
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    // Retornar carrito actualizado
    return await getCartWithItems(userId);
  } catch (error) {
    console.error(
      "Error updating cart item quantity",
      { userId, cartItemId, quantity },
      error,
    );
    throw error;
  }
}

/**
 * Elimina un item específico del carrito.
 *
 * @param userId - ID del usuario (para validación)
 * @param cartItemId - ID del item a eliminar
 * @returns El carrito actualizado o null si hay error
 */
export async function removeFromCart(
  userId: string,
  cartItemId: string,
): Promise<CartWithItems | null> {
  try {
    // Verificar que el item existe y pertenece al usuario
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return null;
    }

    if (cartItem.cart.userId !== userId) {
      return null;
    }

    // Eliminar el item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    // Retornar carrito actualizado
    return await getCartWithItems(userId);
  } catch (error) {
    console.error("Error removing from cart", { userId, cartItemId }, error);
    throw error;
  }
}

/**
 * Vacía el carrito del usuario eliminando todos los items.
 *
 * @param userId - ID del usuario
 * @returns true si se vació correctamente
 */
export async function clearCart(userId: string): Promise<boolean> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return true; // No hay carrito, nada que limpiar
    }

    // Eliminar todos los items del carrito
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return true;
  } catch (error) {
    console.error("Error clearing cart for user", userId, error);
    return false;
  }
}

/**
 * Obtiene el número total de items en el carrito del usuario.
 * Útil para mostrar el badge en la navegación.
 *
 * @param userId - ID del usuario
 * @returns Número total de items (suma de cantidades)
 */
export async function getCartItemCount(userId: string): Promise<number> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          select: { quantity: true },
        },
      },
    });

    if (!cart) {
      return 0;
    }

    // Sumar todas las cantidades
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart item count for user", userId, error);
    return 0;
  }
}
