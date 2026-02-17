"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Frame, Cursor } from "@react95/core";
import { Pen, RecycleFull, Url102, Message } from "@react95/icons";
import ConfirmModal from "@/components/ConfirmModal";
import ReviewForm from "@/components/ReviewForm";
import styles from "./ReviewItem.module.css";

interface ReviewUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
}

interface ReplyData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  userId: string;
  parentId: string | null;
}

interface ReviewData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  userId: string;
  parentId: string | null;
  replies?: ReplyData[];
}

interface ReviewItemProps {
  review: ReviewData;
  currentUserId?: string;
  currentUserRole?: string;
  productId: string;
  productSlug: string;
  lang: string;
  dict: {
    edit: string;
    delete: string;
    share: string;
    reply: string;
    confirmDelete: string;
    confirmDeleteReply: string;
    linkCopied: string;
    edited: string;
    save: string;
    cancel: string;
    writeReview: string;
    writeReply: string;
    placeholder: string;
    replyPlaceholder: string;
    publish: string;
    publishing: string;
  };
  onUpdated: () => void;
  isReply?: boolean;
}

export default function ReviewItem({
  review,
  currentUserId,
  currentUserRole,
  productId,
  productSlug,
  lang,
  dict,
  onUpdated,
  isReply = false,
}: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const isAuthor = currentUserId === review.userId;
  const isAdmin = currentUserRole === "ADMIN";
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;
  const canReply = !!currentUserId;

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

  const handleEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === review.content) {
      setIsEditing(false);
      setEditContent(review.content);
      return;
    }

    setIsSaving(true);
    setEditError("");

    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al editar");
      }

      setIsEditing(false);
      onUpdated();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al editar");
    } finally {
      setIsSaving(false);
    }
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
      onUpdated();
    } catch (err) {
      console.error("Error deleting review:", err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${lang}/products/${productSlug}?reviewId=${review.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleReplySubmitted = () => {
    setShowReplyForm(false);
    onUpdated();
  };

  const displayName = review.user.name || review.user.email;
  const avatarSrc = review.user.avatar;

  return (
    <div
      id={`review-${review.id}`}
      className={`${styles.container} ${isReply ? styles.replyContainer : ""}`}
    >
      <Frame
        className={`${styles.reviewFrame} ${isReply ? styles.replyFrame : ""}`}
      >
        <div className={styles.header}>
          <div className={styles.avatarWrapper}>
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={displayName}
                width={32}
                height={32}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.meta}>
            <span className={styles.userName}>
              {displayName}
              {review.user.role === "ADMIN" && (
                <span className={styles.adminBadge}>ADMIN</span>
              )}
            </span>
            <span className={styles.date}>
              {formatDate(review.createdAt)}
              {wasEdited && (
                <span className={styles.editedTag}> ({dict.edited})</span>
              )}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className={styles.editContainer}>
            <textarea
              className={styles.editTextarea}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={isSaving}
            />
            {editError && <p className={styles.editError}>{editError}</p>}
            <div className={styles.editActions}>
              <Button
                onClick={handleEdit}
                disabled={isSaving || editContent.trim().length === 0}
                className={`${styles.saveButton} ${Cursor.Pointer}`}
              >
                {isSaving ? "..." : dict.save}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(review.content);
                  setEditError("");
                }}
                disabled={isSaving}
                className={`${styles.cancelEditButton} ${Cursor.Pointer}`}
              >
                {dict.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <p className={styles.content}>{review.content}</p>
        )}

        {!isEditing && (
          <div className={styles.toolbar}>
            {canReply && (
              <button
                type="button"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className={`${styles.toolbarButton} ${showReplyForm ? styles.activeToolbarButton : ""} ${Cursor.Pointer}`}
                title={dict.reply}
              >
                <Message variant="16x16_4" />
                <span className={styles.toolbarLabel}>{dict.reply}</span>
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setEditContent(review.content);
                  setIsEditing(true);
                }}
                className={`${styles.toolbarButton} ${Cursor.Pointer}`}
                title={dict.edit}
              >
                <Pen variant="16x16_4" />
                <span className={styles.toolbarLabel}>{dict.edit}</span>
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className={`${styles.toolbarButton} ${styles.deleteButton} ${Cursor.Pointer}`}
                title={dict.delete}
              >
                <RecycleFull variant="16x16_4" />
                <span className={styles.toolbarLabel}>{dict.delete}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className={`${styles.toolbarButton} ${linkCopied ? styles.copiedButton : ""} ${Cursor.Pointer}`}
              title={dict.share}
            >
              <Url102 variant="16x16_4" />
              <span className={styles.toolbarLabel}>
                {linkCopied ? dict.linkCopied : dict.share}
              </span>
            </button>
          </div>
        )}
      </Frame>

      {showReplyForm && (
        <ReviewForm
          productId={productId}
          parentId={isReply ? review.parentId! : review.id}
          onSubmitted={handleReplySubmitted}
          onCancel={() => setShowReplyForm(false)}
          dict={dict}
          isReply
        />
      )}

      {!isReply && review.replies && review.replies.length > 0 && (
        <div className={styles.repliesList}>
          {review.replies.map((reply) => (
            <ReviewItem
              key={reply.id}
              review={reply}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              productId={productId}
              productSlug={productSlug}
              lang={lang}
              dict={dict}
              onUpdated={onUpdated}
              isReply
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title={dict.delete}
        message={isReply ? dict.confirmDeleteReply : dict.confirmDelete}
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
