"use client";

import { useState, useRef } from "react";
import { Avatar, Cursor } from "@react95/core";
import { Awfxcg321303 } from "@react95/icons";
import styles from "./AvatarUploader.module.css";

interface AvatarUploaderProps {
  currentAvatar: string | null;
  previewUrl: string | null;
  userName: string;
  daysUntilNextChange?: number;
  onAvatarChange: (file: File, previewUrl: string) => void;
  dict: {
    changeProfilePhoto: string;
    selectImage: string;
    uploading: string;
    uploadSuccess: string;
    uploadError: string;
    canChangeIn: string;
    days: string;
    day: string;
  };
}

export default function AvatarUploader({
  currentAvatar,
  previewUrl,
  userName,
  daysUntilNextChange,
  onAvatarChange,
  dict,
}: AvatarUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled =
    daysUntilNextChange !== undefined && daysUntilNextChange > 0;

  const displayAvatar = previewUrl || currentAvatar;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError(dict.uploadError);
      return;
    }

    // 5MB client-side check
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(dict.uploadError);
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    onAvatarChange(file, localPreviewUrl);

    // Reset file input so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!isDisabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarDisplay}>
          {displayAvatar ? (
            <Avatar src={displayAvatar} alt={userName} size="96px" />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <Awfxcg321303 variant="32x32_4" />
            </div>
          )}
        </div>

        <div className={styles.uploadSection}>
          <h4 className={styles.title}>{dict.changeProfilePhoto}</h4>

          {isDisabled && daysUntilNextChange !== undefined && (
            <p className={styles.disabledMessage}>
              {dict.canChangeIn}{" "}
              <strong>
                {daysUntilNextChange}{" "}
                {daysUntilNextChange === 1 ? dict.day : dict.days}
              </strong>
            </p>
          )}

          {error && <p className={styles.errorMessage}>{error}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isDisabled}
            className={styles.fileInput}
            aria-label={dict.selectImage}
          />

          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`${styles.uploadButton} ${Cursor.Pointer}`}
            type="button"
          >
            {dict.selectImage}
          </button>
        </div>
      </div>
    </div>
  );
}
