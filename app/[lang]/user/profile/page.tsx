import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  // Pasar solo los subdiccionarios necesarios a ProfileForm
  return (
    <ProfileForm
      lang={lang}
      dict={{
        common: dict.common,
        auth: dict.auth,
        navigation: dict.navigation,
        user: dict.user,
      }}
    />
  );
}
