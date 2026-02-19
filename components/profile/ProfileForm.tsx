"use client";

import { useState, useCallback, useMemo } from "react";
import { Cursor } from "@react95/core";
import Link from "next/link";
import AvatarUploader from "@/components/profile/AvatarUploader";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  lang: string;
  initialValues: {
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  daysUntilNextChange?: number;
  dict: {
    user: {
      changeProfilePhoto: string;
      selectImage: string;
      uploading: string;
      uploadSuccess: string;
      uploadError: string;
      canChangeIn: string;
      days: string;
      day: string;
      editPersonalInfo: string;
      name: string;
      namePlaceholder: string;
      email: string;
      phone: string;
      phonePlaceholder: string;
      profileUpdated: string;
      profileUpdateError: string;
    };
    common: {
      save: string;
      saving: string;
      cancel: string;
    };
    profile: {
      unsavedChanges: string;
      emailChangeNotice: string;
    };
  };
}

export default function ProfileForm({
  lang,
  initialValues,
  daysUntilNextChange,
  dict,
}: ProfileFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    return (
      name !== initialValues.name ||
      email !== initialValues.email ||
      phone !== initialValues.phone ||
      avatarFile !== null
    );
  }, [name, email, phone, avatarFile, initialValues]);

  const handleAvatarChange = useCallback((file: File, previewUrl: string) => {
    setAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
    setSaveError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setSaveError(data.error || dict.user.profileUpdateError);
        setIsSaving(false);
        return;
      }

      // Success — reload to reflect all changes server-side
      window.location.reload();
    } catch {
      setSaveError(dict.user.profileUpdateError);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formWrapper}>
      {/* Pending changes banner */}
      {hasChanges && (
        <div className={styles.pendingBanner}>
          <span className={styles.pendingIcon}>⚠</span>
          <span>{dict.profile.unsavedChanges}</span>
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className={styles.errorBanner}>
          <span>{saveError}</span>
        </div>
      )}

      {/* Avatar section */}
      <div className={styles.avatarSection}>
        <AvatarUploader
          currentAvatar={initialValues.avatar}
          previewUrl={avatarPreviewUrl}
          userName={name || email}
          daysUntilNextChange={daysUntilNextChange}
          onAvatarChange={handleAvatarChange}
          dict={{
            changeProfilePhoto: dict.user.changeProfilePhoto,
            selectImage: dict.user.selectImage,
            uploading: dict.user.uploading,
            uploadSuccess: dict.user.uploadSuccess,
            uploadError: dict.user.uploadError,
            canChangeIn: dict.user.canChangeIn,
            days: dict.user.days,
            day: dict.user.day,
          }}
        />
      </div>

      {/* Form fields */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{dict.user.editPersonalInfo}</h3>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              {dict.user.name}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaveError(null);
              }}
              placeholder={dict.user.namePlaceholder}
              className={`${styles.input} ${Cursor.Text}`}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              {dict.user.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaveError(null);
              }}
              className={`${styles.input} ${Cursor.Text}`}
            />
            <p className={styles.hint}>{dict.profile.emailChangeNotice}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              {dict.user.phone}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaveError(null);
              }}
              placeholder={dict.user.phonePlaceholder}
              className={`${styles.input} ${Cursor.Text}`}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={!hasChanges || isSaving}
              className={`${styles.saveButton} ${Cursor.Pointer}`}
            >
              {isSaving ? dict.common.saving : dict.common.save}
            </button>
            <Link
              href={`/${lang}/user`}
              className={`${styles.cancelButton} ${Cursor.Pointer}`}
            >
              {dict.common.cancel}
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
