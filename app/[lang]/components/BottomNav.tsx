"use client";

import { Frame, List } from "@react95/core";
import { Logo, Mmsys113, Progman34, Computer, User } from "@react95/icons";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "../dictionaries";
import type { UserWithAvatar } from "@/lib/auth";
import styles from "./BottomNav.module.css";

interface BottomNavProps {
  lang: Locale;
  dict: {
    topBar: {
      hello: string;
    };
    auth: {
      login: string;
    };
    navigation: {
      start: string;
      products: string;
      myProfile: string;
      userPanel: string;
      login: string;
    };
  };
  user?: UserWithAvatar | null;
}

export default function BottomNav({ lang, dict, user }: BottomNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: <Computer variant="16x16_4" />, label: dict.navigation.products, href: `/${lang}/products` },
    ...(user 
      ? [
          { icon: <User variant="16x16_4"/>, label: dict.navigation.myProfile, href: `/${lang}/user/profile` },
          { icon: <Mmsys113 variant="16x16_4" />, label: dict.navigation.userPanel, href: `/${lang}/user` }
        ]
      : [
          { icon: <Progman34 variant="32x32_4" />, label: dict.navigation.login, href: `/${lang}/login` }
        ]
    )
  ];

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileMenuContainer} onClick={(e) => e.stopPropagation()}>
            <Frame className={styles.mobileMenuFrame}>
              <List className={styles.mobileMenuList}>
                {menuItems.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={item.icon}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = item.href;
                    }}
                  >
                    {item.label}
                  </List.Item>
                ))}
              </List>
            </Frame>
          </div>
        </div>
      )}

      {/* Barra de tareas estilo Windows 95 en la parte inferior */}
      <div className={styles.taskbar}>
        <Frame className={styles.taskbarFrame}>
          <div className={styles.taskbarContent}>
            {/* Botón Start */}
            <button 
              className={styles.startButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className={styles.startButtonInner}>
                <Logo variant="32x32_4" />
                <span className={styles.startText}>{dict.navigation.start}</span>
              </div>
            </button>

            <div className={styles.separator} />

            {/* Ventanas minimizadas / Enlaces rápidos */}
            <div className={styles.windows}>
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href} className={styles.windowButton}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* System Tray */}
            <div className={styles.systemTray}>
              <div className={styles.trayInner}>
                <div className={styles.clock}>
                  {new Date().toLocaleTimeString('es-AR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </Frame>
      </div>
    </>
  );
}
