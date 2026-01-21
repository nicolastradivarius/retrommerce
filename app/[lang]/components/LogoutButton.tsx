'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '../dictionaries';

interface LogoutButtonProps {
	className?: string;
	lang: Locale;
	dict: {
		logout: string;
		loggingOut: string;
		logoutError: string;
	};
}

export default function LogoutButton({ className, lang, dict }: LogoutButtonProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	const handleLogout = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch('/api/auth/logout', { method: 'POST' });
			if (!res.ok) throw new Error(dict.logoutError);
			router.push(`/${lang}/login`);
			router.refresh();
		} catch {
			setError(dict.logoutError);
			setLoading(false);
		}
	};

	return (
		<div className={className}>
			<button onClick={handleLogout} disabled={loading}>
				{loading ? dict.loggingOut : dict.logout}
			</button>
			{error && <p style={{ color: '#800000', margin: '6px 0 0 0', fontSize: 12 }}>{error}</p>}
		</div>
	);
}
