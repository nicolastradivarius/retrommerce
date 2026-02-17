import { Frame, TitleBar, Cursor, Button } from "@react95/core";
import { Textchat } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import { getReviewsByUserId } from "@/lib/reviews";
import BottomNav from "@/components/BottomNav";
import UserReviewItem from "@/components/UserReviewItem";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import styles from "./page.module.css";

const PAGE_SIZE = 10;

export default async function UserReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const { page: pageParam } = await searchParams;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const { reviews, total } = await getReviewsByUserId(
    user.sub,
    currentPage,
    PAGE_SIZE,
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  // Serialize dates for client components
  const serializedReviews = reviews.map((review) => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }));

  const reviewDict = dict.reviews;
  const myReviewsDict = dict.myReviews;

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<Textchat variant="16x16_4" />}
            title={myReviewsDict.title}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>

          <Frame className={styles.windowContent}>
            {serializedReviews.length === 0 ? (
              <p className={styles.empty}>{myReviewsDict.empty}</p>
            ) : (
              <>
                <div className={styles.reviewsList}>
                  {serializedReviews.map((review) => (
                    <UserReviewItem
                      key={review.id}
                      review={review}
                      lang={lang}
                      dict={{
                        delete: reviewDict.delete,
                        confirmDelete: reviewDict.confirmDelete,
                        cancel: reviewDict.cancel,
                        edited: reviewDict.edited,
                        onProduct: myReviewsDict.onProduct,
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    {safePage > 1 ? (
                      <Link
                        href={`/${lang}/user/reviews?page=${safePage - 1}`}
                        className={`${styles.pageButton} ${Cursor.Pointer}`}
                      >
                        <Button>{myReviewsDict.previous}</Button>
                      </Link>
                    ) : (
                      <Button disabled className={styles.pageButtonDisabled}>
                        {myReviewsDict.previous}
                      </Button>
                    )}

                    <span className={styles.pageInfo}>
                      {myReviewsDict.page} {safePage} {myReviewsDict.of}{" "}
                      {totalPages}
                    </span>

                    {safePage < totalPages ? (
                      <Link
                        href={`/${lang}/user/reviews?page=${safePage + 1}`}
                        className={`${styles.pageButton} ${Cursor.Pointer}`}
                      >
                        <Button>{myReviewsDict.next}</Button>
                      </Link>
                    ) : (
                      <Button disabled className={styles.pageButtonDisabled}>
                        {myReviewsDict.next}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            <Link
              href={`/${lang}/user`}
              className={`${styles.backLink} ${Cursor.Pointer}`}
            >
              {myReviewsDict.backToUserPanel}
            </Link>
          </Frame>
        </div>
      </div>
    </div>
  );
}
