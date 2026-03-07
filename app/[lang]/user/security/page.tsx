import { TitleBar } from "@react95/core";
import { FolderSettings } from "@react95/icons";
import { Frame } from "@react95/core";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import styles from "./page.module.css";

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const user = await getCurrentUserWithAvatar();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<FolderSettings variant="16x16_4" />}
            title={dict.user.security}
          >
            <TitleBarClassicOptions />
          </TitleBar>

          <Frame className={styles.windowContent}>
            <ChangePasswordForm
              dict={{
                changePassword: dict.user.changePassword,
                currentPassword: dict.user.currentPassword,
                newPassword: dict.user.newPassword,
                confirmPassword: dict.user.confirmPassword,
                currentPasswordPlaceholder:
                  dict.user.currentPasswordPlaceholder,
                newPasswordPlaceholder: dict.user.newPasswordPlaceholder,
                confirmPasswordPlaceholder:
                  dict.user.confirmPasswordPlaceholder,
                updatePassword: dict.user.updatePassword,
                passwordUpdated: dict.user.passwordUpdated,
                passwordUpdateError: dict.user.passwordUpdateError,
                passwordRequired: dict.user.passwordRequired,
                newPasswordRequired: dict.user.newPasswordRequired,
                passwordTooShort: dict.user.passwordTooShort,
                passwordSameAsCurrent: dict.user.passwordSameAsCurrent,
                passwordMismatch: dict.user.passwordMismatch,
              }}
              commonDict={{
                cancel: dict.common.cancel,
                saving: dict.common.saving,
              }}
            />

            <div className={styles.backLink}>
              <Link href={`/${lang}/user`} className={styles.link}>
                ← {dict.common.backToUserPanel}
              </Link>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
