"use client";

import { useState } from "react";
import { Cursor } from "@react95/core";
import styles from "./ChangePasswordForm.module.css";

interface ChangePasswordFormProps {
  dict: {
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    currentPasswordPlaceholder: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    updatePassword: string;
    passwordUpdated: string;
    passwordUpdateError: string;
    passwordRequired: string;
    newPasswordRequired: string;
    passwordTooShort: string;
    passwordSameAsCurrent: string;
    passwordMismatch: string;
  };
  commonDict: {
    cancel: string;
    saving: string;
  };
}

export default function ChangePasswordForm({
  dict,
  commonDict,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  };

  const validate = (): string | null => {
    if (!currentPassword) return dict.passwordRequired;
    if (!newPassword) return dict.newPasswordRequired;
    if (newPassword.length < 6) return dict.passwordTooShort;
    if (newPassword === currentPassword) return dict.passwordSameAsCurrent;
    if (newPassword !== confirmPassword) return dict.passwordMismatch;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || dict.passwordUpdateError);
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(dict.passwordUpdateError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmpty = !currentPassword && !newPassword && !confirmPassword;

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>{dict.changePassword}</h3>

      {success && (
        <div className={styles.successBanner}>
          <span>✓</span>
          <span>{dict.passwordUpdated}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.label}>
            {dict.currentPassword}
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder={dict.currentPasswordPlaceholder}
            className={`${styles.input} ${Cursor.Text}`}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            {dict.newPassword}
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder={dict.newPasswordPlaceholder}
            className={`${styles.input} ${Cursor.Text}`}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            {dict.confirmPassword}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);

              setSuccess(false);
            }}
            placeholder={dict.confirmPasswordPlaceholder}
            className={`${styles.input} ${Cursor.Text}`}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={isSubmitting || isEmpty}
            className={`${styles.saveButton} ${Cursor.Pointer}`}
          >
            {isSubmitting ? commonDict.saving : dict.updatePassword}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={isSubmitting}
            className={`${styles.cancelButton} ${Cursor.Pointer}`}
          >
            {commonDict.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
