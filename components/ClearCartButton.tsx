"use client";

import { useState } from "react";
import { Button, Cursor } from "@react95/core";
import { useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import styles from "./ClearCartButton.module.css";

interface ClearCartButtonProps {
  dict: {
    clearCart: string;
    clearCartConfirm: string;
    confirm: string;
    cancel: string;
  };
}

export default function ClearCartButton({ dict }: ClearCartButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmClear = async () => {
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
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        disabled={isClearing}
        className={`${styles.clearButton} ${Cursor.Pointer}`}
      >
        {dict.clearCart}
      </Button>

      <ConfirmModal
        isOpen={isModalOpen}
        title={dict.clearCart}
        message={dict.clearCartConfirm}
        confirmText={dict.confirm}
        cancelText={dict.cancel}
        onConfirm={handleConfirmClear}
        onCancel={handleCloseModal}
        isDangerous
        isLoading={isClearing}
      />
    </>
  );
}
