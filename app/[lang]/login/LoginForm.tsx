"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cursor } from "@react95/core";
import type { Locale } from "../dictionaries";
import styles from "../login/page.module.css";

interface LoginFormProps {
  lang: Locale;
  dict: {
    auth: {
      email: string;
      password: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      loggingIn: string;
      submit: string;
      loginError: string;
      connectionError: string;
    };
    common: {
      cancel: string;
    };
  };
}

export default function LoginForm({ lang, dict }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || dict.auth.loginError);
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push(`/${lang}/admin`);
      } else {
        router.push(`/${lang}`);
      }
    } catch {
      setError(dict.auth.connectionError);
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>{dict.auth.email}:</label>
        <input
          type="email"
          className={styles.input}
          placeholder={dict.auth.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>{dict.auth.password}:</label>
        <input
          type="password"
          className={styles.input}
          placeholder={dict.auth.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={`${styles.buttonPrimary} ${Cursor.Pointer}`}
          disabled={loading}
        >
          {loading ? dict.auth.loggingIn : dict.auth.submit}
        </button>
        <button
          type="button"
          className={`${styles.button} ${Cursor.Pointer}`}
          onClick={() => router.push(`/${lang}`)}
        >
          {dict.common.cancel}
        </button>
      </div>
    </form>
  );
}
