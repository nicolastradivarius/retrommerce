'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  className?: string;
};

export default function LogoutButton({ className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo cerrar sesión');
      router.push('/login');
      router.refresh();
    } catch (err) {
      setError('No se pudo cerrar sesión');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button onClick={handleLogout} disabled={loading}>
        {loading ? 'Saliendo...' : 'Cerrar sesión'}
      </button>
      {error && <p style={{ color: '#800000', margin: '6px 0 0 0', fontSize: 12 }}>{error}</p>}
    </div>
  );
}
