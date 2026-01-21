"use client";

import { Frame, List } from "@react95/core";
import {
    User1,
    Mmsys113,
    Lock,
    Computer,
    FolderSettings,
    Systray300,
    KeyboardMouse,
    Fte128,
    Mmsys103,
    Mmsys110,
    Network2,
    Tree,
    FolderOpen,
    Msrating106,
} from "@react95/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, cloneElement } from "react";
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
        favorites: string;
    };
    user?: UserWithAvatar | null;
}

export default function BottomNav({ lang, dict, user }: BottomNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const formatTime = () => {
      return new Date().toLocaleTimeString("es-AR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(/a\.?\s?m\.?/gi, 'AM').replace(/p\.?\s?m\.?/gi, 'PM');
    };

    // Establecer la hora inicial
    setCurrentTime(formatTime());

    // Actualizar cada segundo
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

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
          {
            icon: <Msrating106 variant="16x16_4" />,
            label: dict.favorites,
            href: `/${lang}/user/favorites`,
            basePath: "user/favorites",
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
    if (basePath === "user") {
      return pathWithoutLang === "/user";
    }
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
                <User1 variant="16x16_4"/>
                <span className={styles.startText}>{dict.start}</span>
              </div>
            </button>

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
                <Mmsys103 variant="16x16_4"/>
                <Tree variant="16x16_4"/>
                <Network2 variant="16x16_4"/>
                <Mmsys110 variant="16x16_4"/>
                <Systray300 variant="16x16_4"/>
                <div className={styles.clock}>
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
        </Frame>
      </div>
    </>
  );
}
