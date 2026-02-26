"use client";

import { useState, useEffect, useCallback } from "react";
import { Frame, Cursor } from "@react95/core";
import ConfirmModal from "@/components/ui/ConfirmModal";
import styles from "./AddressManager.module.css";

interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

const emptyForm = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone: "",
  isDefault: false,
};

type FormState = typeof emptyForm;

export interface AddressManagerDict {
  fullName: string;
  fullNamePlaceholder: string;
  street: string;
  streetPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  state: string;
  statePlaceholder: string;
  zipCode: string;
  zipCodePlaceholder: string;
  country: string;
  countryPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  setAsDefault: string;
  default: string;
  delete: string;
  addNew: string;
  cancelAdd: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
  deleted: string;
  deleteError: string;
  confirmDelete: string;
  newAddressTitle: string;
  noAddresses: string;
  confirm: string;
  cancel: string;
  loading: string;
}

interface AddressManagerProps {
  dict: AddressManagerDict;
}

export default function AddressManager({ dict }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        await fetchAddresses();
      }
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/user/addresses/${deleteTarget}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMessage(dict.deleted, "success");
        await fetchAddresses();
      } else {
        showMessage(dict.deleteError, "error");
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone.trim() || null,
        }),
      });
      if (res.ok) {
        showMessage(dict.saved, "success");
        setForm(emptyForm);
        setIsFormOpen(false);
        await fetchAddresses();
      } else {
        showMessage(dict.saveError, "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setForm(emptyForm);
  };

  return (
    <div className={styles.wrapper}>
      {/* Feedback message */}
      {message && (
        <div
          className={`${styles.message} ${
            message.type === "error" ? styles.messageError : styles.messageSuccess
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Address list */}
      <div className={styles.list}>
        {isLoading ? (
          <p className={styles.empty}>{dict.loading}</p>
        ) : addresses.length === 0 ? (
          <p className={styles.empty}>{dict.noAddresses}</p>
        ) : (
          addresses.map((addr) => (
            <Frame key={addr.id} className={styles.addressCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardName}>{addr.fullName}</span>
                {addr.isDefault && (
                  <span className={styles.defaultBadge}>{dict.default}</span>
                )}
              </div>
              <p className={styles.cardLine}>{addr.street}</p>
              <p className={styles.cardLine}>
                {addr.city}, {addr.state} {addr.zipCode}
              </p>
              <p className={styles.cardLine}>{addr.country}</p>
              {addr.phone && (
                <p className={styles.cardLine}>{addr.phone}</p>
              )}
              <div className={styles.cardActions}>
                {!addr.isDefault && (
                  <button
                    type="button"
                    disabled={settingDefaultId === addr.id}
                    className={`${styles.actionBtn} ${Cursor.Pointer}`}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    {dict.setAsDefault}
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.deleteBtn} ${Cursor.Pointer}`}
                  onClick={() => setDeleteTarget(addr.id)}
                >
                  {dict.delete}
                </button>
              </div>
            </Frame>
          ))
        )}
      </div>

      {/* Add button / inline form */}
      {!isFormOpen ? (
        <button
          type="button"
          className={`${styles.addBtn} ${Cursor.Pointer}`}
          onClick={() => setIsFormOpen(true)}
        >
          + {dict.addNew}
        </button>
      ) : (
        <Frame className={styles.formFrame}>
          <div className={styles.formTitle}>{dict.newAddressTitle}</div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.fullName} *</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder={dict.fullNamePlaceholder}
                  className={`${styles.input} ${Cursor.Text}`}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.street} *</label>
                <input
                  required
                  value={form.street}
                  onChange={(e) => handleFieldChange("street", e.target.value)}
                  placeholder={dict.streetPlaceholder}
                  className={`${styles.input} ${Cursor.Text}`}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.city} *</label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  placeholder={dict.cityPlaceholder}
                  className={`${styles.input} ${Cursor.Text}`}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.state} *</label>
                <input
                  required
                  value={form.state}
                  onChange={(e) => handleFieldChange("state", e.target.value)}
                  placeholder={dict.statePlaceholder}
                  className={`${styles.input} ${Cursor.Text}`}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.zipCode} *</label>
                <input
                  required
                  value={form.zipCode}
                  onChange={(e) => handleFieldChange("zipCode", e.target.value)}
                  placeholder={dict.zipCodePlaceholder}
                  className={`${styles.input} ${Cursor.Text}`}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.country} *</label>
                <input
                  required
                  value={form.country}
                  onChange={(e) => handleFieldChange("country", e.target.value)}
                  placeholder={dict.countryPlaceholder}
                  className={`${styles.input} ${Cursor.Text}`}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{dict.phone}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder={dict.phonePlaceholder}
                className={`${styles.input} ${Cursor.Text}`}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="addr-isDefault"
                checked={form.isDefault}
                onChange={(e) =>
                  handleFieldChange("isDefault", e.target.checked)
                }
                className={styles.checkbox}
              />
              <label
                htmlFor="addr-isDefault"
                className={`${styles.checkboxLabel} ${Cursor.Pointer}`}
              >
                {dict.setAsDefault}
              </label>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isSaving}
                className={`${styles.saveBtn} ${Cursor.Pointer}`}
              >
                {isSaving ? dict.saving : dict.save}
              </button>
              <button
                type="button"
                className={`${styles.cancelBtn} ${Cursor.Pointer}`}
                onClick={handleCancelForm}
              >
                {dict.cancelAdd}
              </button>
            </div>
          </form>
        </Frame>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={dict.delete}
        message={dict.confirmDelete}
        confirmText={dict.confirm}
        cancelText={dict.cancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDangerous
        isLoading={isDeleting}
      />
    </div>
  );
}
