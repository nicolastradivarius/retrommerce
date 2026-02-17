"use client";

import { useState } from "react";
import { Button, Cursor } from "@react95/core";
import { Computer } from "@react95/icons";
import type { Locale } from "@/app/[lang]/dictionaries";
import styles from "./AddToCartButton.module.css";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  lang: Locale;
  dict: {
    addToCart: string;
    quantity: string;
  };
}

type ButtonState = "idle" | "loading" | "success" | "error";

export default function AddToCartButton({
  productId,
  stock,
  dict,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > stock) {
      setQuantity(stock);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    setButtonState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error adding to cart");
      }

      // Éxito
      setButtonState("success");

      // Disparar evento para actualizar el badge del carrito
      window.dispatchEvent(new Event("cartUpdated"));

      setTimeout(() => {
        setButtonState("idle");
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setButtonState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Error adding to cart",
      );
      setTimeout(() => {
        setButtonState("idle");
        setErrorMessage("");
      }, 3000);
    }
  };

  const getButtonText = () => {
    switch (buttonState) {
      case "loading":
        return "Adding...";
      case "success":
        return "Added!";
      case "error":
        return "Error";
      default:
        return dict.addToCart;
    }
  };

  const isDisabled = buttonState === "loading" || stock === 0;

  return (
    <div className={styles.container}>
      <div className={styles.quantitySelector}>
        <label className={styles.label}>
          {dict.quantity}: {quantity}/{stock}
        </label>
        <div className={styles.quantityControls}>
          <Button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isDisabled}
            className={styles.quantityButton}
          >
            -
          </Button>
          <input
            type="number"
            min="1"
            max={stock}
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            disabled={isDisabled}
            className={styles.quantityInput}
          />
          <Button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= stock || isDisabled}
            className={styles.quantityButton}
          >
            +
          </Button>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`${styles.addButton} ${Cursor.Pointer} ${
          buttonState === "success" ? styles.success : ""
        } ${buttonState === "error" ? styles.error : ""}`}
      >
        <Computer variant="16x16_4" />
        {getButtonText()}
      </Button>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
}
