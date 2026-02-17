"use client";

import { useEffect, useRef, useCallback } from "react";
import { Frame } from "@react95/core";
import { Textchat } from "@react95/icons";
import { useRouter } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import ReviewItem from "@/components/ReviewItem";
import styles from "./ReviewSection.module.css";

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

interface ReviewSectionProps {
  reviews: ReviewData[];
  productId: string;
  productSlug: string;
  currentUserId?: string;
  currentUserRole?: string;
  lang: string;
  dict: {
    title: string;
    writeReview: string;
    writeReply: string;
    placeholder: string;
    replyPlaceholder: string;
    publish: string;
    publishing: string;
    edit: string;
    delete: string;
    share: string;
    reply: string;
    confirmDelete: string;
    confirmDeleteReply: string;
    linkCopied: string;
    loginToReview: string;
    noReviews: string;
    edited: string;
    save: string;
    cancel: string;
    reviewCount: string;
  };
  reviewIdToScroll?: string;
}

export default function ReviewSection({
  reviews,
  productId,
  productSlug,
  currentUserId,
  currentUserRole,
  lang,
  dict,
  reviewIdToScroll,
}: ReviewSectionProps) {
  const router = useRouter();
  const hasScrolled = useRef(false);

  const handleUpdated = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!reviewIdToScroll || hasScrolled.current) return;

    // Small delay to ensure DOM is fully rendered
    const timeout = setTimeout(() => {
      const element = document.getElementById(`review-${reviewIdToScroll}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Add highlight class
        const frame = element.querySelector(`.${styles.highlightTarget}`) || element;
        frame.classList.add(styles.highlighted);
        setTimeout(() => {
          frame.classList.remove(styles.highlighted);
        }, 3000);

        hasScrolled.current = true;
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [reviewIdToScroll]);

  const totalCount = reviews.reduce(
    (acc, review) => acc + 1 + (review.replies?.length || 0),
    0,
  );

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <Textchat variant="16x16_4" />
        <h2 className={styles.title}>{dict.title}</h2>
        <span className={styles.count}>
          {dict.reviewCount.replace("{count}", String(totalCount))}
        </span>
      </div>

      {currentUserId ? (
        <Frame className={styles.formFrame}>
          <ReviewForm
            productId={productId}
            onSubmitted={handleUpdated}
            dict={dict}
          />
        </Frame>
      ) : (
        <Frame className={styles.loginPrompt}>
          <p className={styles.loginText}>{dict.loginToReview}</p>
        </Frame>
      )}

      {reviews.length === 0 ? (
        <Frame className={styles.emptyFrame}>
          <p className={styles.emptyText}>{dict.noReviews}</p>
        </Frame>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div
              key={review.id}
              id={`review-${review.id}`}
              className={styles.highlightTarget}
            >
              <ReviewItem
                review={review}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                productId={productId}
                productSlug={productSlug}
                lang={lang}
                dict={dict}
                onUpdated={handleUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
