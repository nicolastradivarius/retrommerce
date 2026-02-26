import { Frame, TitleBar } from "@react95/core";
import { Notepad } from "@react95/icons";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithAvatar } from "@/lib/auth";
import BottomNav from "@/components/layout/BottomNav";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import TitleBarClassicOptions from "@/components/ui/TitleBarClassicOptions";
import ProfileForm from "@/components/profile/ProfileForm";
import AddressManager from "@/components/profile/AddressManager";
import styles from "./page.module.css";

export default async function ProfileInfoPage({
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

  // Calculate days until next avatar change
  const daysUntilNextChange = user.avatarUpdatedAt
    ? Math.max(
        0,
        30 -
          Math.floor(
            (new Date().getTime() - new Date(user.avatarUpdatedAt).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
      )
    : undefined;

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={user} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<Notepad variant="16x16_4" />}
            title={dict.user.profileInfo}
          >
            <TitleBarClassicOptions />
          </TitleBar>

          <Frame className={styles.windowContent}>
            <ProfileForm
              lang={lang}
              initialValues={{
                name: user.name || "",
                email: user.email,
                phone: user.phone || "",
                avatar: user.avatar,
              }}
              daysUntilNextChange={daysUntilNextChange}
              dict={{
                user: {
                  changeProfilePhoto: dict.user.changeProfilePhoto,
                  selectImage: dict.user.selectImage,
                  uploading: dict.user.uploading,
                  uploadSuccess: dict.user.uploadSuccess,
                  uploadError: dict.user.uploadError,
                  canChangeIn: dict.user.canChangeIn,
                  days: dict.user.days,
                  day: dict.user.day,
                  editPersonalInfo: dict.user.editPersonalInfo,
                  name: dict.user.name,
                  namePlaceholder: dict.user.namePlaceholder,
                  email: dict.user.email,
                  phone: dict.user.phone,
                  phonePlaceholder: dict.user.phonePlaceholder,
                  profileUpdated: dict.user.profileUpdated,
                  profileUpdateError: dict.user.profileUpdateError,
                },
                common: {
                  save: dict.common.save,
                  saving: dict.common.saving,
                  cancel: dict.common.cancel,
                },
                profile: {
                  unsavedChanges: dict.profile.unsavedChanges,
                  emailChangeNotice: dict.profile.emailChangeNotice,
                },
              }}
            />

            <div className={styles.separator} />

            <div className={styles.addressSection}>
              <h3 className={styles.sectionTitle}>
                {dict.user.shippingAddresses}
              </h3>

              <AddressManager
                dict={{
                  ...dict.addresses,
                  noAddresses: dict.user.noAddresses,
                  confirm: dict.common.confirm,
                  cancel: dict.common.cancel,
                  loading: dict.common.loading,
                }}
              />
            </div>

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
