// ============================================================================
// COMPONENTE: ResponsiveLayout
// ============================================================================
// Propósito: Detectar el tamaño del viewport y renderizar diferentes layouts
// para desktop (≥768px) y mobile (<768px)
//
// Características:
// - Client Component (usa hooks de React)
// - Monitorea cambios de tamaño de ventana en tiempo real
// - Evita hydration mismatch renderizando desktop por defecto en SSR
// - Sin impacto en performance (event listener limpiado en cleanup)
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * Props para el componente ResponsiveLayout
 *
 * @property desktopLayout - El JSX a renderizar en viewport desktop (≥768px)
 * @property mobileLayout - El JSX a renderizar en viewport mobile (<768px)
 */
interface ResponsiveLayoutProps {
  desktopLayout: ReactNode;
  mobileLayout: ReactNode;
}

/**
 * Componente ResponsiveLayout
 *
 * Detecta automáticamente el tamaño del viewport y renderiza el layout apropiado.
 *
 * ## Problema que resuelve:
 * En Next.js, los Server Components renderizan en el servidor sin acceso a `window`.
 * Necesitamos un Client Component que detecte el tamaño de la pantalla del cliente.
 *
 * ## Solución:
 * 1. Durante SSR: renderiza `desktopLayout` (más seguro, sin riesgo de hydration mismatch)
 * 2. Después de hidratación: detecta `window.innerWidth`
 * 3. Si <768px: cambia a `mobileLayout`
 * 4. En resize: escucha cambios y adapta automáticamente
 *
 * ## Flujo de ejecución:
 * ```
 * SSR (Servidor)
 *   ↓ renderiza desktopLayout
 * Cliente (Navegador)
 *   ↓ hidratación
 * useEffect ejecuta
 *   ├─ checkMobile() detecta window.innerWidth
 *   ├─ setIsMobile(true/false)
 *   └─ addEventListener("resize")
 * Usuario redimensiona ventana
 *   ├─ checkMobile() se ejecuta de nuevo
 *   └─ Component actualiza con nuevo layout
 * ```
 *
 * ## Ventajas de este enfoque:
 * - ✅ No hay hydration mismatch (comienza con desktopLayout)
 * - ✅ Responsive dinámico (sin refresco de página)
 * - ✅ Limpia event listeners (no hay memory leaks)
 * - ✅ Performance optimizado (solo un listener)
 */
export default function ResponsiveLayout({
  desktopLayout,
  mobileLayout,
}: ResponsiveLayoutProps) {
  /**
   * Estado que controla qué layout se renderiza
   *
   * Posibles valores:
   * - null: aún no se ha ejecutado el effect (durante SSR/hidratación)
   * - true: viewport es mobile (<768px)
   * - false: viewport es desktop (≥768px)
   *
   * Iniciamos con null para renderizar desktopLayout durante SSR
   * sin riesgo de hydration mismatch
   */
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  /**
   * Effect que se ejecuta SOLO en el cliente después de la hidratación
   * 1. Define función checkMobile() que detecta el tamaño de ventana
   * 2. Ejecuta checkMobile() inmediatamente (valor inicial)
   * 3. Agrega event listener para cambios de tamaño
   * 4. Limpia el listener al desmontar el componente
   *
   * ## Breakpoint:
   * - Usamos 768px como punto de corte
   * - Coincide con media query en CSS: @media (max-width: 768px)
   * - Es el tamaño estándar tablet/desktop en diseño responsivo
   *
   * ## Cleanup:
   * El return () => ... limpia el listener cuando el componente se desmonta
   * Previene memory leaks en aplicaciones de una sola página (SPA)
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Establecer el valor inicial basado en el tamaño actual de la ventana
    checkMobile();

    // Escuchar cambios de tamaño de ventana (ej: usuario redimensiona navegador)
    window.addEventListener("resize", checkMobile);

    // Cleanup: Remover el event listener para prevenir memory leaks
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Durante SSR, renderizar desktop con display: none para evitar flash visual
   * Esto previene que el usuario vea el layout de desktop por un segundo en mobile
   *
   * El style inline con display: none se aplica solo durante SSR
   * React lo remueve cuando se ejecuta el effect y detecta el viewport real
   */
  if (isMobile === null) {
    // Renderizar desktop layout pero ocultarlo visualmente durante la hidratación
    return (
      <div suppressHydrationWarning style={{ display: "none" }}>
        {desktopLayout}
      </div>
    );
  }

  // Después de la hidratación, renderizar el layout correcto sin estilos inline
  return isMobile ? mobileLayout : desktopLayout;
}
