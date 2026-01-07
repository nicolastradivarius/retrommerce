'use client';

import { Frame, TaskBar, List } from '@react95/core';
import { Computer } from '@react95/icons';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame width="400px" height="auto" padding={25} boxShadow="in">
          <div className={styles.header}>
            <Computer variant="32x32_4" />
            <h1 className={styles.title}>Iniciar Sesión</h1>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email:</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="user@retrommerce.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Contraseña:</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.buttonPrimary} disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
              <button type="button" className={styles.button} onClick={() => router.push('/')}>
                Cancelar
              </button>
            </div>
          </form>

          <hr className={styles.divider} />

          <div className={styles.infoBox}>
            <p className={styles.infoTitle}>Credenciales de prueba:</p>
            <p className={styles.infoText}>
              <strong>Usuario:</strong> user@retrommerce.com / user123<br />
              <strong>Admin:</strong> admin@retrommerce.com / admin123
            </p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.roleSection}>
            <p className={styles.roleTitle}>Acceso rápido para pruebas:</p>
            <div className={styles.roleButtons}>
              <Link href="/user" className={styles.roleButton}>
                👤 Entrar como Usuario
              </Link>
              <Link href="/admin" className={styles.roleButton}>
                🔧 Entrar como Admin
              </Link>
            </div>
          </div>

          <Link href="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
        </Frame>
      </div>
    </div>
  );
}
