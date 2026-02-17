"use client";

import { Frame, TitleBar, Button, Cursor } from "@react95/core";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <TitleBar active title={title}>
          <TitleBar.OptionsBox>
            <TitleBar.Close onClick={onCancel} />
          </TitleBar.OptionsBox>
        </TitleBar>

        <Frame className={styles.content}>
          <p id="modal-title" className={styles.message}>
            {message}
          </p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${styles.confirmButton} ${isDangerous ? styles.dangerous : ""} ${Cursor.Pointer}`}
            >
              {isLoading ? "..." : confirmText}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isLoading}
              className={`${styles.cancelButton} ${Cursor.Pointer}`}
            >
              {cancelText}
            </Button>
          </div>
        </Frame>
      </div>
    </div>
  );
}
