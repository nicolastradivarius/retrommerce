"use client";

import { useState } from "react";
import { Button, Cursor } from "@react95/core";
import { useRouter } from "next/navigation";
import styles from "./ClearCartButton.module.css";

interface ClearCartButtonProps {
  dict: {
    clearCart: string;
    clearCartConfirm: string;
  };
}

export default function ClearCartButton({ dict }: ClearCartButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClearCart = async () => {
    const confirmed = window.confirm(dict.clearCartConfirm);

    if (!confirmed) {
      return;
    }

    setIsClearing(true);

    try {
      const response = await fetch("/api/cart/clear", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      // Disparar evento para actualizar el badge
      window.dispatchEvent(new Event("cartUpdated"));

      // Recargar la página para mostrar el carrito vacío
      router.refresh();
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Error clearing cart");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      onClick={handleClearCart}
      disabled={isClearing}
      className={`${styles.clearButton} ${Cursor.Pointer}`}
    >
      {isClearing ? "..." : dict.clearCart}
    </Button>
  );
}
