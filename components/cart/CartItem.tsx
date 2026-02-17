"use client";

import { useState } from "react";
import { Frame, Button, Cursor } from "@react95/core";
import { Computer } from "@react95/icons";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import type { Locale } from "@/app/[lang]/dictionaries";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: {
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
  lang: Locale;
  dict: {
    quantity: string;
    price: string;
    itemTotal: string;
    removeFromCart: string;
    outOfStock: string;
    maxQuantity: string;
  };
}

export default function CartItem({ item, lang, dict }: CartItemProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const itemPrice = parseFloat(item.product.price);
  const itemTotal = itemPrice * quantity;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock || isUpdating) {
      return;
    }

    setIsUpdating(true);
    setQuantity(newQuantity);

    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Disparar evento para actualizar el badge
      window.dispatchEvent(new Event("cartUpdated"));

      // Recargar la página para actualizar el carrito
      router.refresh();
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revertir cantidad en caso de error
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);

    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      // Disparar evento para actualizar el badge
      window.dispatchEvent(new Event("cartUpdated"));

      // Recargar la página para actualizar el carrito
      router.refresh();
    } catch (error) {
      console.error("Error removing item:", error);
      setIsRemoving(false);
    }
  };

  const imageUrl = item.product.images[0] || "/placeholder.png";

  return (
    <Frame className={styles.cartItem}>
      <div className={styles.itemContent}>
        {/* Imagen del producto */}
        <div className={styles.imageContainer}>
          <Link href={`/${lang}/products/${item.product.slug}`}>
            <Image
              src={imageUrl}
              alt={item.product.name}
              width={80}
              height={80}
              className={styles.productImage}
            />
          </Link>
        </div>

        {/* Información del producto */}
        <div className={styles.productInfo}>
          <Link
            href={`/${lang}/products/${item.product.slug}`}
            className={`${styles.productName} ${Cursor.Pointer}`}
          >
            <Computer variant="16x16_4" />
            {item.product.name}
          </Link>
          {item.product.manufacturer && (
            <p className={styles.manufacturer}>{item.product.manufacturer}</p>
          )}
          <p className={styles.price}>
            {dict.price}: {formatPrice(item.product.price)}
          </p>
        </div>

        {/* Controles de cantidad */}
        <div className={styles.quantitySection}>
          <label className={styles.label}>
            {dict.quantity}: {quantity}/{item.product.stock}
          </label>
          <div className={styles.quantityControls}>
            <Button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating || isRemoving}
              className={styles.quantityButton}
            >
              -
            </Button>
            <span className={styles.quantityDisplay}>{quantity}</span>
            <Button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={
                quantity >= item.product.stock || isUpdating || isRemoving
              }
              className={styles.quantityButton}
            >
              +
            </Button>
          </div>
        </div>

        {/* Total del item */}
        <div className={styles.totalSection}>
          <p className={styles.label}>{dict.itemTotal}</p>
          <p className={styles.total}>{formatPrice(itemTotal.toFixed(2))}</p>
        </div>

        {/* Botón de eliminar */}
        <div className={styles.removeSection}>
          <Button
            onClick={handleRemove}
            disabled={isRemoving || isUpdating}
            className={`${styles.removeButton} ${Cursor.Pointer}`}
          >
            {isRemoving ? "..." : dict.removeFromCart}
          </Button>
        </div>
      </div>
    </Frame>
  );
}
