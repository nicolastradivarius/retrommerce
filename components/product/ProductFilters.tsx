// ============================================================================
// COMPONENTE: ProductFilters
// ============================================================================
// Propósito: Panel de filtros para la página de productos
//
// Características principales:
// - Filtros: búsqueda, categorías, precio, año
// - URLs amigables con slugs de categorías
// - Mensajes de éxito (aplicado/limpiado)
// - Modo dual: desktop (con ventana) y mobile (pestaña)
// - Estados persistidos en URL (shareable, bookmarkable)
// ============================================================================

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Frame,
  TitleBar,
  Button,
  Cursor,
  Checkbox,
  Fieldset,
  Input,
} from "@react95/core";
import { FolderSettings } from "@react95/icons";
import type { Locale } from "@/app/[lang]/dictionaries";
import styles from "./ProductFilters.module.css";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Interfaz que representa una categoría de producto
 *
 * @property id - ID único en base de datos (para queries)
 * @property name - Nombre mostrable de la categoría (ej: "Electronics")
 * @property slug - URL-friendly identifier (ej: "electronics")
 *                  Usado en URLs en lugar de IDs para mejor SEO
 */
interface Category {
  id: string;
  name: string;
  slug: string;
}

/**
 * Props del componente ProductFilters
 *
 * Este componente funciona en dos modos:
 * 1. Desktop: Panel lateral en ventana separada
 * 2. Mobile: Tab dentro de una ventana de pestañas
 *
 * @property lang - Idioma actual (es/en) para construir URLs
 * @property categories - Lista de todas las categorías disponibles
 * @property dict - Diccionario multiidioma para etiquetas y mensajes
 * @property isMobileTab - Si true, renderiza sin TitleBar/Frame (modo pestaña)
 */
interface ProductFiltersProps {
  // ============================================================================
  // Configuración básica
  // ============================================================================
  lang: Locale;
  categories: Category[];

  // ============================================================================
  // Diccionario multiidioma
  // ============================================================================
  dict: {
    title: string;
    search: string;
    searchPlaceholder: string;
    categories: string;
    allCategories: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    yearRange: string;
    minYear: string;
    maxYear: string;
    applyFilters: string;
    clearFilters: string;
    filtersApplied?: string;
    filtersCleared?: string;
  };

  // Modo de renderizado
  /**
   * Si true: Renderiza solo contenido (para usar dentro de una pestaña)
   * Si false: Renderiza con TitleBar y Frame (ventana independiente)
   */
  isMobileTab?: boolean;
}

/**
 * Componente ProductFilters
 *
 * Panel de filtros para productos
 *
 * ## Funcionalidades:
 * - Filtro por nombre (búsqueda)
 * - Filtro por categorías (múltiple selección)
 * - Filtro por rango de precio (min/max)
 * - Filtro por rango de año (min/max)
 * - URLs amigables con slugs de categorías
 * - Mensajes de feedback (aplicado/limpiado)
 * - Modo desktop (ventana) y mobile (pestaña)
 *
 * ## Flujo de datos:
 * Usuario selecciona filtros → setXxx() actualiza estado local
 * Usuario hace click "Aplicar" → applyFilters() → router.push() con nueva URL
 * URL cambia → page.tsx vuelve a renderizar con nuevos parámetros
 *
 * ## Persistencia:
 * Los filtros se guardan en URL, permitiendo:
 * - Compartir enlaces con filtros aplicados
 * - Bookmarkear búsquedas específicas
 * - Navegar con browser back/forward
 */
export default function ProductFilters({
  lang,
  categories,
  dict,
  isMobileTab = false,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  /**
   * Estado para controlar visibilidad del mensaje "Filtros aplicados correctamente"
   * - true: Mostrar mensaje
   * - false: Ocultar mensaje (después de 3 segundos)
   */
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Estado para controlar visibilidad del mensaje "Filtros limpiados"
   * - true: Mostrar mensaje
   * - false: Ocultar mensaje (después de 3 segundos)
   */
  const [showCleared, setShowCleared] = useState(false);

  // ============================================================================
  // ESTADO DE FILTROS
  // ============================================================================
  // Todos los estados se inicializan desde query params de URL
  // Esto permite que los filtros persistan al recargar la página
  //
  // Formato de URL:
  // /products?search=...&categories=slug1,slug2&minPrice=10&maxPrice=100&minYear=1990&maxYear=2010&page=1

  /**
   * Búsqueda por nombre de producto
   *
   * Fuente: URL query param "search"
   * Ejemplo: "vintage computer" → busca productos con ese nombre
   */
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  /**
   * Categorías seleccionadas
   *
   * Estructura: Set<string> para búsquedas O(1) con .has()
   * Fuente: URL query param "categories" (separado por comas)
   * Ejemplo: "electronics,furniture" → Set["electronics", "furniture"]
   *
   * ¿Por qué Set?
   * - Cada categoría puede aparecer solo una vez
   * - Búsqueda rápida con .has(slug)
   * - Fácil agregar/quitar con .add()/.delete()
   */
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => {
      const categoryParam = searchParams.get("categories");
      return categoryParam
        ? new Set(categoryParam.split(","))
        : new Set<string>();
    },
  );

  /**
   * Rango de precio: valor mínimo
   *
   * Almacenado como string porque proviene de <input type="number">
   * Se convierte a número en applyFilters() antes de la URL
   *
   * Ejemplo flujo:
   * Input: "10" → minPrice state → "10" en URL → parseFloat("10") en page.tsx
   */
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");

  /**
   * Rango de precio: valor máximo
   * Mismo formato que minPrice
   */
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  /**
   * Rango de año: valor mínimo
   * Almacenado como string, convertido a número en applyFilters()
   */
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "");

  /**
   * Rango de año: valor máximo
   * Mismo formato que minYear
   */
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "");

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  /**
   * Maneja el toggle (marcar/desmarcar) de una categoría en los checkboxes
   *
   * @param categorySlug - Slug de la categoría a alternar
   *
   * ## Lógica de inmutabilidad:
   * 1. Crear una copia del Set anterior (inmutabilidad)
   * 2. Si el slug ya existe: eliminarlo
   * 3. Si el slug no existe: agregarlo
   * 4. Devolver el nuevo Set (React detecta el cambio)
   *
   */
  const handleCategoryToggle = (categorySlug: string) => {
    setSelectedCategories((prev) => {
      // Crear una copia (importante para inmutabilidad en React)
      const newSet = new Set(prev);

      if (newSet.has(categorySlug)) {
        // Ya está seleccionada: quitar
        newSet.delete(categorySlug);
      } else {
        // No está seleccionada: agregar
        newSet.add(categorySlug);
      }

      return newSet;
    });
  };

  /**
   * Aplica los filtros actuales creando una nueva URL con query parameters
   *
   * ## Flujo de ejecución:
   * 1. Construir URLSearchParams con filtros actuales
   * 2. Agregar solo parámetros con valores no-vacíos (URLs limpias)
   * 3. Resetear a página 1 (resultados con nuevos filtros pueden ser menos)
   * 4. Mostrar mensaje de éxito visual
   * 5. Navegar a nueva URL con startTransition (marca como no-urgente)
   *
   * ## URL resultante:
   * /es/products?search=computer&categories=electronics,furniture&minPrice=50&page=1
   *
   * ## Nota sobre URLSearchParams:
   * Automáticamente encoda caracteres especiales:
   * - "," → "%2C"
   * - "?" → "%3F"
   * etc. (navegador decodifica automáticamente)
   */
  const applyFilters = () => {
    // Crear objeto para construir query string
    const params = new URLSearchParams();

    // ========================================================================
    // Agregar parámetros solo si tienen valores (no agregar vacíos)
    // ========================================================================

    // Búsqueda: agregar solo si hay texto
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    // Categorías: agregar solo si hay seleccionadas
    // Convertir Set a array, unir con comas
    if (selectedCategories.size > 0) {
      params.set("categories", Array.from(selectedCategories).join(","));
    }

    // Precio mínimo: agregar solo si tiene valor
    if (minPrice.trim()) {
      params.set("minPrice", minPrice.trim());
    }

    // Precio máximo: agregar solo si tiene valor
    if (maxPrice.trim()) {
      params.set("maxPrice", maxPrice.trim());
    }

    // Año mínimo: agregar solo si tiene valor
    if (minYear.trim()) {
      params.set("minYear", minYear.trim());
    }

    // Año máximo: agregar solo si tiene valor
    if (maxYear.trim()) {
      params.set("maxYear", maxYear.trim());
    }

    // ========================================================================
    // Resetear paginación
    // ========================================================================
    // Importante: siempre volver a página 1 cuando cambien los filtros
    // Razón: con nuevos filtros, puede haber menos resultados que antes
    // Ejemplo: si estábamos en página 5 y ahora hay solo 2 páginas total
    params.set("page", "1");

    // ========================================================================
    // Feedback visual
    // ========================================================================
    // Mostrar mensaje verde "Filtros aplicados correctamente"
    setShowSuccess(true);

    // ========================================================================
    // Navegación
    // ========================================================================
    // startTransition marca esta actualización como "no urgente"
    // Permite que React priorice actualizaciones más urgentes (ej: input typing)
    startTransition(() => {
      // Navegar a nueva URL con todos los parámetros
      router.push(`/${lang}/products?${params.toString()}`);
    });
  };

  /**
   * Limpia todos los filtros y navega a la URL base (sin filtros)
   *
   * ## Flujo:
   * 1. Resetear todos los estados de filtros a valores vacíos
   * 2. Mostrar mensaje "Filtros limpiados"
   * 3. Navegar a /products sin query params
   *
   * ## URL resultante:
   * /es/products (sin parámetros)
   *
   * ## Resultado:
   * Se mostrarán todos los productos sin filtros aplicados
   */
  const clearFilters = () => {
    // Resetear búsqueda
    setSearchQuery("");

    // Resetear categorías (crear nuevo Set vacío)
    setSelectedCategories(new Set());

    // Resetear rangos de precio
    setMinPrice("");
    setMaxPrice("");

    // Resetear rangos de año
    setMinYear("");
    setMaxYear("");

    // Mostrar mensaje visual de confirmación
    setShowCleared(true);

    // Navegar a URL limpia sin parámetros
    startTransition(() => {
      router.push(`/${lang}/products`);
    });
  };

  /**
   * Calcula si hay algún filtro activo
   *
   * ## Uso:
   * - Mostrar/ocultar botón "Limpiar filtros" (solo visible si hay filtros)
   * - En mobile: puede usarse para mostrar badge de filtros activos
   *
   * ## Lógica:
   * Retorna true si AL MENOS UNO de estos tiene valor:
   * - Búsqueda (texto no vacío)
   * - Categorías (al menos una seleccionada)
   * - Precio mínimo (número ingresado)
   * - Precio máximo (número ingresado)
   * - Año mínimo (número ingresado)
   * - Año máximo (número ingresado)
   *
   * Usa operador lógico OR (||) para máxima eficiencia
   * Si alguno es truthy, ya no evalúa los demás
   */
  const hasActiveFilters =
    searchQuery.trim() || // Tiene búsqueda
    selectedCategories.size > 0 || // Tiene categorías
    minPrice.trim() || // Tiene precio mín
    maxPrice.trim() || // Tiene precio máx
    minYear.trim() || // Tiene año mín
    maxYear.trim(); // Tiene año máx

  // ============================================================================
  // EFFECTS - AUTO-OCULTAR MENSAJES
  // ============================================================================

  /**
   * Auto-ocultar mensaje "Filtros aplicados" después de 3 segundos
   *
   * ## Dependencias: [showSuccess]
   * Se ejecuta cada vez que showSuccess cambia a true
   *
   * ## Cleanup:
   * El return () => clearTimeout(timer) limpia el timeout si:
   * - El componente se desmonta antes de 3 segundos
   * - showSuccess cambia a false manualmente (por otro factor)
   *
   * ## Duración: 3 segundos
   * Es el tiempo estándar en UX para notificaciones de feedback
   */
  useEffect(() => {
    if (showSuccess) {
      // Crear timer que ocultará el mensaje después de 3 segundos
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Cleanup: cancelar timeout si el effect se ejecuta de nuevo
      return () => clearTimeout(timer);
    }
    // Se ejecuta cuando showSuccess cambia
  }, [showSuccess]);

  /**
   * Auto-ocultar mensaje "Filtros limpiados" después de 3 segundos
   *
   * Idéntico al efecto anterior pero para el mensaje de filtros limpiados
   *
   * ## Dependencias: [showCleared]
   * Se ejecuta cada vez que showCleared cambia a true
   */
  useEffect(() => {
    if (showCleared) {
      // Crear timer de 3 segundos
      const timer = setTimeout(() => {
        setShowCleared(false);
      }, 3000);

      // Cleanup: cancelar si el effect se ejecuta de nuevo
      return () => clearTimeout(timer);
    }
    // Se ejecuta cuando showCleared cambia
  }, [showCleared]);

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  // Renderizado para pestaña móvil (sin título ni marco adicional)
  if (isMobileTab) {
    return (
      <div className={styles.filtersContent}>
        {/* ============================
            FILTRO: Búsqueda por nombre
            ============================ */}
        <div className={styles.filterSection}>
          <label htmlFor="search-input" className={styles.filterLabel}>
            {dict.search}:
          </label>
          <Input
            id="search-input"
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              // Permitir aplicar filtros presionando Enter
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            className={styles.searchInput}
          />
        </div>

        {/* ============================
            FILTRO: Categorías (checkboxes)
            ============================ */}
        <div className={styles.filterSection}>
          <Fieldset legend={dict.categories}>
            <Frame
              display="flex"
              flexDirection="column"
              className={styles.categoriesList}
            >
              {/* Mapear todas las categorías disponibles */}
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  value={category.slug}
                  label={category.name}
                  checked={selectedCategories.has(category.slug)}
                  onChange={() => handleCategoryToggle(category.slug)}
                />
              ))}
            </Frame>
          </Fieldset>
        </div>

        {/* ============================
            FILTRO: Rango de precio
            ============================ */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>{dict.priceRange}:</label>
          <div className={styles.rangeInputs}>
            {/* Campo: Precio mínimo */}
            <div className={styles.rangeField}>
              <label htmlFor="min-price" className={styles.rangeLabel}>
                {dict.minPrice}
              </label>
              <input
                id="min-price"
                type="number"
                className={styles.numberInput}
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="0"
                step="0.01" // Permitir decimales (ej: 99.99)
              />
            </div>

            {/* Campo: Precio máximo */}
            <div className={styles.rangeField}>
              <label htmlFor="max-price" className={styles.rangeLabel}>
                {dict.maxPrice}
              </label>
              <input
                id="max-price"
                type="number"
                className={styles.numberInput}
                placeholder="9999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* ============================
            FILTRO: Rango de año
            ============================ */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>{dict.yearRange}:</label>
          <div className={styles.rangeInputs}>
            {/* Campo: Año mínimo */}
            <div className={styles.rangeField}>
              <label htmlFor="min-year" className={styles.rangeLabel}>
                {dict.minYear}
              </label>
              <input
                id="min-year"
                type="number"
                className={styles.numberInput}
                placeholder="1990"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="1970" // Límite inferior: productos desde 1970
                max="2010" // Límite superior: productos hasta 2010
                step="1" // Solo años enteros
              />
            </div>

            {/* Campo: Año máximo */}
            <div className={styles.rangeField}>
              <label htmlFor="max-year" className={styles.rangeLabel}>
                {dict.maxYear}
              </label>
              <input
                id="max-year"
                type="number"
                className={styles.numberInput}
                placeholder="2010"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="1970"
                max="2010"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* ============================
            MENSAJE DE ÉXITO
            ============================ */}
        {showSuccess && dict.filtersApplied && (
          <div className={styles.successMessage}>✓ {dict.filtersApplied}</div>
        )}

        {/* ============================
            MENSAJE DE FILTROS LIMPIADOS
            ============================ */}
        {showCleared && dict.filtersCleared && (
          <div className={styles.successMessage}>✓ {dict.filtersCleared}</div>
        )}

        {/* ============================
            BOTONES DE ACCIÓN
            ============================ */}
        <div className={styles.filterActions}>
          {/* Botón: Aplicar filtros */}
          <Button
            onClick={applyFilters}
            disabled={isPending} // Deshabilitar mientras se navega
            className={`${Cursor.Pointer}`}
          >
            {dict.applyFilters}
          </Button>

          {/* Botón: Limpiar filtros (solo se muestra si hay filtros activos) */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              disabled={isPending}
              className={`${Cursor.Pointer}`}
            >
              {dict.clearFilters}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Renderizado para vista de escritorio (con título y marco)
  return (
    <div className={styles.filtersWindow}>
      {/* Barra de título estilo Windows 95 */}
      <TitleBar
        active
        icon={<FolderSettings variant="16x16_4" />}
        title={dict.title}
      >
        <TitleBar.OptionsBox>
          <TitleBar.Minimize />
          <TitleBar.Restore />
          <TitleBar.Close />
        </TitleBar.OptionsBox>
      </TitleBar>

      {/* Contenido del panel de filtros */}
      <Frame className={styles.filtersContent}>
        {/* ============================
            FILTRO: Búsqueda por nombre
            ============================ */}
        <div className={styles.filterSection}>
          <label htmlFor="search-input" className={styles.filterLabel}>
            {dict.search}:
          </label>
          <Input
            id="search-input"
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              // Permitir aplicar filtros presionando Enter
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            className={styles.searchInput}
          />
        </div>

        {/* ============================
            FILTRO: Categorías (checkboxes)
            ============================ */}
        <div className={styles.filterSection}>
          <Fieldset legend={dict.categories}>
            <Frame
              display="flex"
              flexDirection="column"
              className={styles.categoriesList}
            >
              {/* Mapear todas las categorías disponibles */}
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  value={category.slug}
                  label={category.name}
                  checked={selectedCategories.has(category.slug)}
                  onChange={() => handleCategoryToggle(category.slug)}
                />
              ))}
            </Frame>
          </Fieldset>
        </div>

        {/* ============================
            FILTRO: Rango de precio
            ============================ */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>{dict.priceRange}:</label>
          <div className={styles.rangeInputs}>
            {/* Campo: Precio mínimo */}
            <div className={styles.rangeField}>
              <label htmlFor="min-price" className={styles.rangeLabel}>
                {dict.minPrice}
              </label>
              <input
                id="min-price"
                type="number"
                className={styles.numberInput}
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="0"
                step="0.01" // Permitir decimales (ej: 99.99)
              />
            </div>

            {/* Campo: Precio máximo */}
            <div className={styles.rangeField}>
              <label htmlFor="max-price" className={styles.rangeLabel}>
                {dict.maxPrice}
              </label>
              <input
                id="max-price"
                type="number"
                className={styles.numberInput}
                placeholder="9999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* ============================
            FILTRO: Rango de año
            ============================ */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>{dict.yearRange}:</label>
          <div className={styles.rangeInputs}>
            {/* Campo: Año mínimo */}
            <div className={styles.rangeField}>
              <label htmlFor="min-year" className={styles.rangeLabel}>
                {dict.minYear}
              </label>
              <input
                id="min-year"
                type="number"
                className={styles.numberInput}
                placeholder="1990"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="1970" // Límite inferior: productos desde 1970
                max="2010" // Límite superior: productos hasta 2010
                step="1" // Solo años enteros
              />
            </div>

            {/* Campo: Año máximo */}
            <div className={styles.rangeField}>
              <label htmlFor="max-year" className={styles.rangeLabel}>
                {dict.maxYear}
              </label>
              <input
                id="max-year"
                type="number"
                className={styles.numberInput}
                placeholder="2010"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
                min="1970"
                max="2010"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* ============================
            MENSAJE DE ÉXITO
            ============================ */}
        {showSuccess && dict.filtersApplied && (
          <div className={styles.successMessage}>✓ {dict.filtersApplied}</div>
        )}

        {/* ============================
            MENSAJE DE FILTROS LIMPIADOS
            ============================ */}
        {showCleared && dict.filtersCleared && (
          <div className={styles.successMessage}>✓ {dict.filtersCleared}</div>
        )}

        {/* ============================
            BOTONES DE ACCIÓN
            ============================ */}
        <div className={styles.filterActions}>
          {/* Botón: Aplicar filtros */}
          <Button
            onClick={applyFilters}
            disabled={isPending} // Deshabilitar mientras se navega
            className={`${Cursor.Pointer}`}
          >
            {dict.applyFilters}
          </Button>

          {/* Botón: Limpiar filtros (solo se muestra si hay filtros activos) */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              disabled={isPending}
              className={`${Cursor.Pointer}`}
            >
              {dict.clearFilters}
            </Button>
          )}
        </div>
      </Frame>
    </div>
  );
}
