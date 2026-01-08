import { Frame, Button } from '@react95/core';
import { User } from '@react95/icons';
import Link from 'next/link';
import styles from './TopBar.module.css';

interface TopBarProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
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
              <Link href="/user" className={styles.userLink}>
                <div className={styles.userInfo}>
                  {user.avatar ? (
                    <div className={styles.avatarContainer}>
                      <img 
                        src={user.avatar} 
                        alt="Foto de perfil" 
                        className={styles.avatarImage}
                      />
                    </div>
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <User variant="16x16_4" />
                    </div>
                  )}
                  <span className={styles.welcomeText}>Hola {user.name}</span>
                </div>
              </Link>
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
