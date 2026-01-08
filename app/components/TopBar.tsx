'use client';

import { Frame, Button } from '@react95/core';
import { User } from '@react95/icons';
import Link from 'next/link';
import styles from './TopBar.module.css';

interface TopBarProps {
  user: {
    name: string;
    email: string;
  } | null;
}

export default function TopBar({ user }: TopBarProps) {
  return (
    <div className={styles.topBar}>
      <Frame className={styles.frame}>
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            <h2 className={styles.logoText}>Retrommerce</h2>
          </Link>
          
          <div className={styles.userSection}>
            {user ? (
              <div className={styles.userInfo}>
                <User variant="32x32_4" />
                <span className={styles.welcomeText}>Hola {user.name}</span>
              </div>
            ) : (
              <Link href="/login">
                <Button>Log-in</Button>
              </Link>
            )}
          </div>
        </div>
      </Frame>
    </div>
  );
}
