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

  return <ProfileForm lang={lang} dict={dict} />;
}
