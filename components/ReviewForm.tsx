"use client";

import { useState } from "react";
import { Button, Cursor } from "@react95/core";
import { Notepad } from "@react95/icons";
import styles from "./ReviewForm.module.css";

interface ReviewFormProps {
  productId: string;
  parentId?: string;
  onSubmitted: () => void;
  onCancel?: () => void;
  dict: {
    writeReview: string;
    writeReply: string;
    placeholder: string;
    replyPlaceholder: string;
    publish: string;
    publishing: string;
    cancel: string;
  };
  isReply?: boolean;
}

export default function ReviewForm({
  productId,
  parentId,
  onSubmitted,
  onCancel,
  dict,
  isReply = false,
}: ReviewFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          content: trimmed,
          ...(parentId && { parentId }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al publicar");
      }

      setContent("");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${styles.container} ${isReply ? styles.replyContainer : ""}`}
    >
      <label className={styles.label}>
        {isReply ? dict.writeReply : dict.writeReview}
      </label>
      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReply ? dict.replyPlaceholder : dict.placeholder}
        rows={isReply ? 2 : 3}
        maxLength={2000}
        disabled={isSubmitting}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || content.trim().length === 0}
          className={`${styles.submitButton} ${Cursor.Pointer}`}
        >
          <Notepad variant="16x16_4" />
          {isSubmitting ? dict.publishing : dict.publish}
        </Button>
        {isReply && onCancel && (
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            className={`${styles.cancelButton} ${Cursor.Pointer}`}
          >
            {dict.cancel}
          </Button>
        )}
      </div>
    </div>
  );
}
