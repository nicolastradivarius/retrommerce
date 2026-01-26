"use client";

import { useState, useEffect } from "react";
import { Frame, Button, TitleBar, Cursor } from "@react95/core";
import { User, Notepad } from "@react95/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Locale } from "../../dictionaries";
import type { UserWithAvatar } from "@/lib/auth";
import BottomNav from "../../components/BottomNav";
import styles from "./page.module.css";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
}

interface ProfileFormProps {
  lang: Locale;
  dict: {
    common: {
      save: string;
      saving: string;
    };
    auth: {
      login: string;
    };
    navigation: {
      start: string;
      products: string;
      myProfile: string;
      userPanel: string;
      login: string;
      favorites: string;
    };
    topBar: {
      hello: string;
    };
    user: {
      myProfile: string;
      editPersonalInfo: string;
      profilePhoto: string;
      name: string;
      namePlaceholder: string;
      email: string;
      emailCannotChange: string;
      uploadImage: string;
      memberSince: string;
      profileUpdated: string;
      profileUpdateError: string;
      loadingProfile: string;
      profileLoadError: string;
      preview: string;
    };
  };
}

interface Message {
  type: "success" | "error";
  text: string;
}

export default function ProfileForm({ lang, dict }: ProfileFormProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");

        if (response.status === 401) {
          router.push(`/${lang}/login`);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setName(data.user.name || "");
          setAvatarFile(null);
          setAvatarPreviewUrl(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, lang]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("name", name);
      if (avatarFile) {
        formData.set("avatar", avatarFile);
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUser((prev) =>
          prev
            ? { ...prev, name: data.user.name, avatar: data.user.avatar }
            : null,
        );
        setAvatarFile(null);
        setAvatarPreviewUrl(null);
        setMessage({ type: "success", text: dict.user.profileUpdated });
      } else {
        setMessage({ type: "error", text: dict.user.profileUpdateError });
      }
    } catch {
      setMessage({ type: "error", text: dict.user.profileUpdateError });
    } finally {
      setSaving(false);
    }
  };

  // Formatear fecha según el idioma
  const formatDate = (dateString: string) => {
    const locale = lang === "es" ? "es-ES" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Convertir user a UserWithAvatar para BottomNav
  const userWithAvatar: UserWithAvatar | null = user
    ? {
        sub: user.id,
        email: user.email,
        role: user.role as "USER" | "ADMIN",
        name: user.name || "",
        avatar: user.avatar,
      }
    : null;

  const renderWindow = (content: React.ReactNode) => (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={userWithAvatar} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<Notepad variant="16x16_4" />}
            title={dict.user.myProfile}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>
          <Frame className={styles.windowContent}>{content}</Frame>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderWindow(<p>{dict.user.loadingProfile}</p>);
  }

  if (!user) {
    return renderWindow(
      <>
        <p>{dict.user.profileLoadError}</p>
        <Button
          onClick={() => router.push(`/${lang}/login`)}
          className={Cursor.Pointer}
        >
          {dict.auth.login}
        </Button>
      </>,
    );
  }

  return (
    <div className={styles.container}>
      <BottomNav lang={lang} dict={dict.navigation} user={userWithAvatar} />

      <div className={styles.main}>
        <div className={styles.window}>
          <TitleBar
            active
            icon={<Notepad variant="16x16_4" />}
            title={dict.user.myProfile}
          >
            <TitleBar.OptionsBox>
              <TitleBar.Minimize />
              <TitleBar.Restore />
              <TitleBar.Close />
            </TitleBar.OptionsBox>
          </TitleBar>
          <Frame className={styles.windowContent}>
            <div className={styles.header}>
              <User variant="32x32_4" />
              <div>
                <h1 className={styles.title}>{dict.user.editPersonalInfo}</h1>
              </div>
            </div>

            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                {avatarPreviewUrl ? (
                  <Image
                    src={avatarPreviewUrl}
                    alt={dict.user.preview}
                    fill
                    sizes="150px"
                    className={styles.avatarImage}
                  />
                ) : user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={dict.user.profilePhoto}
                    fill
                    sizes="150px"
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <User variant="32x32_4" />
                  </div>
                )}
              </div>
              <p className={styles.avatarHint}>{dict.user.profilePhoto}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.user.email}</label>
                <Frame className={styles.inputFrame}>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className={styles.inputDisabled}
                  />
                </Frame>
                <p className={styles.hint}>{dict.user.emailCannotChange}</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.user.name}</label>
                <Frame className={styles.inputFrame}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={dict.user.namePlaceholder}
                    className={styles.input}
                  />
                </Frame>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.user.profilePhoto}</label>
                <Frame className={styles.inputFrame}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    className={styles.input}
                  />
                </Frame>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.user.memberSince}</label>
                <p className={styles.memberSinceText}>
                  {formatDate(user.createdAt)}
                </p>
              </div>

              {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.actions}>
                <Button
                  type="submit"
                  disabled={saving}
                  className={styles.saveButton}
                >
                  {saving ? dict.common.saving : dict.common.save}
                </Button>
              </div>
            </form>
          </Frame>
        </div>
      </div>
    </div>
  );
}
