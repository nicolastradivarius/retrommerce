"use client";

import { Frame, List } from "@react95/core";
import { Logo, Mmsys113, Lock, Computer, FolderSettings } from "@react95/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, cloneElement } from "react";
import type { Locale } from "../dictionaries";
import type { UserWithAvatar } from "@/lib/auth";
import styles from "./BottomNav.module.css";

interface BottomNavProps {
  lang: Locale;
  dict: {
    start: string;
    products: string;
    myProfile: string;
    userPanel: string;
    login: string;
  };
  user?: UserWithAvatar | null;
}

export default function BottomNav({ lang, dict, user }: BottomNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      icon: <Computer variant="16x16_4" />,
      label: dict.products,
      href: `/${lang}/products`,
      basePath: "products",
    },
    ...(user
      ? [
          {
            icon: <FolderSettings variant="16x16_4"/>,
            label: dict.userPanel,
            href: `/${lang}/user`,
            basePath: "user",
          },
        ]
      : [
          {
            icon: <Lock variant="16x16_4" />,
            label: dict.login,
            href: `/${lang}/login`,
            basePath: "login",
          },
        ]),
  ];

  // Función para determinar si una ventana está activa
  const isActive = (basePath: string) => {
    if (!pathname) return false;
    // Remove the lang prefix from pathname
    const pathWithoutLang = pathname.replace(`/${lang}`, "");
    // Check if current path starts with the base path
    return pathWithoutLang.startsWith(`/${basePath}`);
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={styles.mobileMenuContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <Frame className={styles.mobileMenuFrame}>
              <List className={styles.mobileMenuList}>
                {menuItems.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={cloneElement(item.icon, { variant: "32x32_4" })}
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
                <span className={styles.startText}>{dict.start}</span>
              </div>
            </button>

            <div className={styles.separator} />

            {/* Ventanas minimizadas / Enlaces rápidos */}
            <div className={styles.windows}>
              {menuItems.map((item, index) => {
                const active = isActive(item.basePath);
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`${styles.windowButton} ${active ? styles.windowButtonActive : styles.windowButtonInactive}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* System Tray */}
            <div className={styles.systemTray}>
              <div className={styles.trayInner}>
                <div className={styles.clock}>
                  {new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
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
