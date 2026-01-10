'use client';

import { useState, useEffect } from 'react';
import { Frame, Button } from '@react95/core';
import { User, Notepad } from '@react95/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
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
          setAvatarFile(null);
          setAvatarPreviewUrl(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
      formData.set('name', name);
      if (avatarFile) {
        formData.set('avatar', avatarFile);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarFile(null);
        setAvatarPreviewUrl(null);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
      }
    } catch {
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
              {avatarPreviewUrl ? (
                <Image
                  src={avatarPreviewUrl}
                  alt="Vista previa"
                  fill
                  sizes="150px"
                  className={styles.avatarImage}
                />
              ) : user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Foto de perfil"
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
            <p className={styles.avatarHint}>Foto de perfil</p>
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
              <label className={styles.label}>Foto de perfil</label>
              <Frame className={styles.inputFrame}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                  className={styles.input}
                />
              </Frame>
              <p className={styles.hint}>Sube una imagen; la optimizamos y la guardamos en Cloudinary</p>
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
            <Link href="/products" className={styles.navLink}>
              Volver al inicio
            </Link>
          </div>
        </Frame>
      </div>
    </div>
  );
}
