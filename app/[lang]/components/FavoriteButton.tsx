"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Msrating106 } from "@react95/icons";
import type { Locale } from "../dictionaries";
import styles from "./FavoriteButton.module.css";

interface FavoriteButtonProps {
    productId: string;
    initialIsFavorite: boolean;
    canFavorite: boolean;
    lang: Locale;
    dict: {
        addToFavorites: string;
        removeFromFavorites: string;
        loginToFavorite: string;
    };
    className?: string;
    showLabel?: boolean;
}

export default function FavoriteButton({
    productId,
    initialIsFavorite,
    canFavorite,
    lang,
    dict,
    className,
    showLabel = false,
}: FavoriteButtonProps) {
    if (!canFavorite) {
        return null;
    }

    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canFavorite) {
            const redirect = encodeURIComponent(pathname || `/${lang}/products`);
            router.push(`/${lang}/login?redirect=${redirect}`);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/user/favorites", {
                method: isFavorite ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });

            if (response.ok) {
                setIsFavorite(!isFavorite);
            }
        } finally {
            setLoading(false);
        }
    };

    const label = isFavorite ? dict.removeFromFavorites : dict.addToFavorites;

    return (
        <button
            type="button"
            className={`${styles.button} ${isFavorite ? styles.active : ""} ${className ?? ""}`}
            onClick={handleClick}
            disabled={loading}
            aria-pressed={isFavorite}
            aria-label={label}
            title={label}
        >
            <Msrating106 variant="16x16_4" />
            {showLabel && <span className={styles.label}>{label}</span>}
        </button>
    );
}