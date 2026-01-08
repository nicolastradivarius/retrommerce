'use client';

import { useState, useEffect } from 'react';
import { Frame, Button } from '@react95/core';
import { User, Notepad } from '@react95/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setName(data.user.name || '');
        setAvatarUrl(data.user.avatar || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || null,
          avatar: avatarUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexion' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <Frame className={styles.profileFrame}>
            <p>Cargando perfil...</p>
          </Frame>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <Frame className={styles.profileFrame}>
            <p>No se pudo cargar el perfil</p>
            <Link href="/login">
              <Button>Iniciar sesion</Button>
            </Link>
          </Frame>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Frame className={styles.profileFrame}>
          <div className={styles.header}>
            <Notepad variant="32x32_4" />
            <div>
              <h1 className={styles.title}>Mi Perfil</h1>
              <p className={styles.subtitle}>Edita tu informacion personal</p>
            </div>
          </div>

          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Foto de perfil" 
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User variant="32x32_4" />
                </div>
              )}
            </div>
            <p className={styles.avatarHint}>Foto de perfil (estilo clasico)</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <Frame className={styles.inputFrame}>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className={styles.inputDisabled}
                />
              </Frame>
              <p className={styles.hint}>El email no se puede modificar</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre</label>
              <Frame className={styles.inputFrame}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className={styles.input}
                />
              </Frame>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>URL de foto de perfil</label>
              <Frame className={styles.inputFrame}>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  className={styles.input}
                />
              </Frame>
              <p className={styles.hint}>Ingresa la URL de una imagen cuadrada</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rol</label>
              <Frame className={styles.inputFrame}>
                <input
                  type="text"
                  value={user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  disabled
                  className={styles.inputDisabled}
                />
              </Frame>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Miembro desde</label>
              <Frame className={styles.inputFrame}>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  disabled
                  className={styles.inputDisabled}
                />
              </Frame>
            </div>

            {message && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.actions}>
              <Button type="submit" disabled={saving} className={styles.saveButton}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>

          <div className={styles.navigation}>
            <Link href="/user" className={styles.navLink}>
              Volver al panel de usuario
            </Link>
            <Link href="/" className={styles.navLink}>
              Volver al inicio
            </Link>
          </div>
        </Frame>
      </div>
    </div>
  );
}
