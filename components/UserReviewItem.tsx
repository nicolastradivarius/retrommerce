"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Frame, Cursor } from "@react95/core";
import { RecycleFull } from "@react95/icons";
import ConfirmModal from "@/components/ConfirmModal";
import styles from "./UserReviewItem.module.css";

interface ReviewUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
}

interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
}

interface ReviewData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  userId: string;
  parentId: string | null;
  product: ReviewProduct;
}

interface UserReviewItemProps {
  review: ReviewData;
  lang: string;
  dict: {
    delete: string;
    confirmDelete: string;
    cancel: string;
    edited: string;
    onProduct: string;
  };
}

export default function UserReviewItem({
  review,
  lang,
  dict,
}: UserReviewItemProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const wasEdited =
    new Date(review.updatedAt).getTime() -
      new Date(review.createdAt).getTime() >
    1000;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setShowDeleteModal(false);
      router.refresh();
    } catch (err) {
      console.error("Error deleting review:", err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const productImage = review.product.images?.[0] || null;

  return (
    <div className={styles.container}>
      <Frame className={styles.reviewFrame}>
        <div className={styles.layout}>
          <div className={styles.reviewContent}>
            <div className={styles.header}>
              <div className={styles.meta}>
                <span className={styles.date}>
                  {formatDate(review.createdAt)}
                  {wasEdited && (
                    <span className={styles.editedTag}> ({dict.edited})</span>
                  )}
                </span>
              </div>
            </div>

            <p className={styles.content}>{review.content}</p>

            <div className={styles.toolbar}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className={`${styles.toolbarButton} ${styles.deleteButton} ${Cursor.Pointer}`}
                title={dict.delete}
              >
                <RecycleFull variant="16x16_4" />
                <span className={styles.toolbarLabel}>{dict.delete}</span>
              </button>
            </div>
          </div>

          <Link
            href={`/${lang}/products/${review.product.slug}`}
            className={`${styles.productLink} ${Cursor.Pointer}`}
          >
            <div className={styles.productInfo}>
              {productImage ? (
                <Image
                  src={productImage}
                  alt={review.product.name}
                  width={64}
                  height={64}
                  className={styles.productImage}
                />
              ) : (
                <div className={styles.productImagePlaceholder}>?</div>
              )}
              <span className={styles.productName}>{review.product.name}</span>
            </div>
          </Link>
        </div>
      </Frame>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={dict.delete}
        message={dict.confirmDelete}
        confirmText={dict.delete}
        cancelText={dict.cancel}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDangerous
        isLoading={isDeleting}
      />
    </div>
  );
}
