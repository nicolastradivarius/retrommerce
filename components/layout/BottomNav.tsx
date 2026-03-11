"use client";

import { Frame, List, Cursor } from "@react95/core";
import {
  User1,
  Signup,
  Computer,
  Msnstart1,
  FolderSettings,
  PowerOn,
  PowerOff,
  Sndvol32304,
  Sndvol32303,
  Network2,
  Internat151,
  Msrating106,
  Folder,
  Awschd32402,
} from "@react95/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, cloneElement } from "react";
import { useRouter } from "next/navigation";
import { type Locale, LOCALES, LOCALE_LABELS } from "@/lib/locales";
import type { UserWithAvatar } from "@/lib/auth";
import styles from "./BottomNav.module.css";

interface BottomNavProps {
  lang: Locale;
  dict: {
    start: string;
    home: string;
    products: string;
    myProfile: string;
    userPanel: string;
    login: string;
    favorites: string;
    cart: string;
  };
  user?: UserWithAvatar | null;
}

export default function BottomNav({ lang, dict, user }: BottomNavProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSoundIconToggled, setIsSoundIconToggled] = useState(false);
  const [isPowerToggled, setIsPowerToggled] = useState(false);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const localeMenuRef = useRef<HTMLDivElement>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => {
    return new Date()
      .toLocaleTimeString(lang, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/a\.?\s?m\.?/gi, "AM")
      .replace(/p\.?\s?m\.?/gi, "PM");
  });
  const pathname = usePathname();

  useEffect(() => {
    const formatTime = () => {
      return new Date()
        .toLocaleTimeString(lang, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/a\.?\s?m\.?/gi, "AM")
        .replace(/p\.?\s?m\.?/gi, "PM");
    };

    // Actualizar cada segundo
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  // Fetch cart item count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartItemCount(0);
        return;
      }

      try {
        const response = await fetch("/api/cart/count");
        const data = await response.json();
        setCartItemCount(data.count || 0);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartItemCount(0);
      }
    };

    fetchCartCount();

    // Escuchar evento de actualización del carrito
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [user]);

  const menuItems = [
    {
      icon: <Msnstart1 variant="16x16_4" />,
      label: dict.home,
      href: `/${lang}/home`,
      basePath: "home",
    },
    {
      icon: <Computer variant="16x16_4" />,
      label: dict.products,
      href: `/${lang}/products`,
      basePath: "products",
    },
    ...(user
      ? [
          {
            icon: <Folder variant="16x16_4" />,
            label:
              cartItemCount > 0 ? `${dict.cart} (${cartItemCount})` : dict.cart,
            href: `/${lang}/cart`,
            basePath: "cart",
          },
          {
            icon: <FolderSettings variant="16x16_4" />,
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
            icon: <Signup variant="16x16_4"/>,
            label: dict.login,
            href: `/${lang}/login`,
            basePath: "login",
          },
        ]),
  ];

  // Close locale menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (localeMenuRef.current && !localeMenuRef.current.contains(e.target as Node)) {
        setLocaleMenuOpen(false);
      }
    };
    if (localeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [localeMenuOpen]);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLocale}`);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    setLocaleMenuOpen(false);
    router.push(newPath);
  };

  // Función para determinar si una ventana está activa
  const isActive = (basePath: string) => {
    if (!pathname) return false;
    // Remove the lang prefix from pathname
    const pathWithoutLang = pathname.replace(`/${lang}`, "");
    if (basePath === "home") {
      return (
        pathWithoutLang === "" ||
        pathWithoutLang === "/" ||
        pathWithoutLang === "/home"
      );
    }
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
            // Prevent click events from propagating to the overlay
            onClick={(e) => e.stopPropagation()}
          >
            <Frame className={styles.mobileMenuFrame}>
              <List className={styles.mobileMenuList}>
                {menuItems.map((item, index) => (
                  <List.Item
                    key={index}
                    // Clone the icon element to change the variant prop
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

      {/* Barra de tareas en la parte inferior */}
      <div className={styles.taskbar}>
        <Frame className={styles.taskbarFrame}>
          <div className={styles.taskbarContent}>
            {/* Botón Start */}
            <button
              className={`${styles.startButton} ${Cursor.Pointer}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className={`${styles.startButtonInner} ${Cursor.Pointer}`}>
                <User1 variant="16x16_4" />
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
                    className={`${styles.windowButton} ${active ? styles.windowButtonPressed : styles.windowButtonInactive} ${Cursor.Pointer}`}
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
                <Network2 variant="16x16_4" />
                <button
                  className={`${styles.trayIcon} ${Cursor.Auto}`}
                  onClick={() => setIsSoundIconToggled(!isSoundIconToggled)}
                  aria-label="Toggle sound icon"
                >
                  {isSoundIconToggled ? (
                    <Sndvol32303 variant="16x16_4" />
                  ) : (
                    <Sndvol32304 variant="16x16_4" />
                  )}
                </button>
                <button
                  className={`${styles.trayIcon} ${Cursor.Auto}`}
                  onClick={() => setIsPowerToggled(!isPowerToggled)}
                  aria-label="Toggle power"
                >
                  {isPowerToggled ? (
                    <PowerOff variant="16x16_4" />
                  ) : (
                    <PowerOn variant="16x16_4" />
                  )}
                </button>
                <div className={styles.localeSelector} ref={localeMenuRef}>
                  <button
                    className={`${styles.trayIcon} ${Cursor.Pointer}`}
                    onClick={() => setLocaleMenuOpen(!localeMenuOpen)}
                    aria-label="Change language"
                  >
                    <Awschd32402 variant="16x16_4" />
                  </button>
                  {localeMenuOpen && (
                    <div className={styles.localeMenu}>
                      <Frame className={styles.localeMenuFrame}>
                        {LOCALES.map((loc) => (
                          <button
                            key={loc}
                            className={`${styles.localeOption} ${lang === loc ? styles.localeOptionActive : ""} ${Cursor.Pointer}`}
                            onClick={() => switchLocale(loc)}
                          >
                            {LOCALE_LABELS[loc]}
                          </button>
                        ))}
                      </Frame>
                    </div>
                  )}
                </div>
                <div className={styles.clock}>{currentTime}</div>
              </div>
            </div>
          </div>
        </Frame>
      </div>
    </>
  );
}
