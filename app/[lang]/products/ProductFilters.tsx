"use client";

import { useState, useTransition } from "react";
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
import type { Locale } from "../dictionaries";
import styles from "./ProductFilters.module.css";

/**
 * Interfaz para representar una categoría de producto.
 */
interface Category {
  id: string;
  name: string;
  slug: string;
}

/**
 * Props del componente ProductFilters.
 * Este componente muestra un panel lateral con filtros para productos.
 */
interface ProductFiltersProps {
  lang: Locale; // Idioma actual (es/en) para construir las URLs
  categories: Category[]; // Lista de categorías disponibles para filtrar
  dict: {
    // Diccionario de traducciones para las etiquetas del filtro
    filters: {
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
    };
  };
}

/**
 * Componente ProductFilters
 *
 * Panel de filtros para la página de productos con estilo Windows 95.
 * Permite filtrar productos por:
 * - Búsqueda por nombre
 * - Categorías (múltiple selección)
 * - Rango de precio (mínimo y máximo)
 * - Rango de año (mínimo y máximo)
 *
 * Los filtros se sincronizan con la URL mediante query parameters,
 * permitiendo compartir búsquedas y mantener el estado al navegar.
 */
export default function ProductFilters({
  lang,
  categories,
  dict,
}: ProductFiltersProps) {
  // Hook de Next.js para navegación programática
  const router = useRouter();

  // Hook para leer los parámetros de la URL actual
  const searchParams = useSearchParams();

  // useTransition nos permite marcar actualizaciones de navegación como transiciones,
  // dándonos un estado de "pending" para mostrar feedback visual al usuario
  const [isPending, startTransition] = useTransition();

  // ============================================================================
  // ESTADO DEL COMPONENTE
  // Todos los estados se inicializan desde los query params de la URL,
  // permitiendo que los filtros persistan al recargar la página
  // ============================================================================

  /**
   * Estado para la búsqueda por texto (nombre de producto).
   * Se inicializa con el valor del query param "search" si existe.
   */
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  /**
   * Estado para las categorías seleccionadas.
   * Usamos un Set para facilitar operaciones de agregar/quitar categorías.
   * Se inicializa parseando el query param "categories" (formato: "id1,id2,id3").
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
   * Estados para el rango de precio.
   * Se almacenan como strings porque provienen de inputs tipo "number".
   * Se convertirán a números al aplicar los filtros.
   */
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  /**
   * Estados para el rango de año.
   * Similar a los precios, se almacenan como strings.
   */
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "");
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "");

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  /**
   * Maneja el toggle (marcar/desmarcar) de una categoría en los checkboxes.
   *
   * @param categoryId - ID de la categoría a toggle
   *
   * Lógica:
   * - Si la categoría ya está en el Set, la elimina
   * - Si no está, la agrega
   * - React detecta el cambio porque creamos un nuevo Set (inmutabilidad)
   */
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev); // Crear una copia del Set anterior
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId); // Quitar si ya existe
      } else {
        newSet.add(categoryId); // Agregar si no existe
      }
      return newSet; // Retornar el nuevo Set
    });
  };

  /**
   * Aplica los filtros actuales navegando a una nueva URL con query parameters.
   *
   * Flujo:
   * 1. Crea un objeto URLSearchParams vacío
   * 2. Agrega solo los filtros que tienen valores (no vacíos)
   * 3. Siempre resetea a página 1 cuando cambian los filtros
   * 4. Navega a la nueva URL usando router.push dentro de una transición
   *
   * La transición (startTransition) marca esta navegación como de baja prioridad,
   * permitiendo que React priorice actualizaciones más urgentes si es necesario.
   */
  const applyFilters = () => {
    const params = new URLSearchParams();

    // Solo agregar parámetros si tienen valores
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (selectedCategories.size > 0) {
      // Convertir el Set a array y unir con comas: "id1,id2,id3"
      params.set("categories", Array.from(selectedCategories).join(","));
    }

    if (minPrice.trim()) {
      params.set("minPrice", minPrice.trim());
    }

    if (maxPrice.trim()) {
      params.set("maxPrice", maxPrice.trim());
    }

    if (minYear.trim()) {
      params.set("minYear", minYear.trim());
    }

    if (maxYear.trim()) {
      params.set("maxYear", maxYear.trim());
    }

    // Siempre resetear a la primera página cuando se aplican filtros nuevos
    // para evitar estar en una página que ya no existe con los nuevos resultados
    params.set("page", "1");

    // Navegar a la nueva URL con los filtros aplicados
    // startTransition permite que React maneje esta navegación como no urgente
    startTransition(() => {
      router.push(`/${lang}/products?${params.toString()}`);
    });
  };

  /**
   * Limpia todos los filtros y vuelve a la página de productos sin filtros.
   *
   * Flujo:
   * 1. Resetea todos los estados locales a sus valores vacíos
   * 2. Navega a la URL base de productos (sin query params)
   */
  const clearFilters = () => {
    // Resetear todos los estados a valores vacíos
    setSearchQuery("");
    setSelectedCategories(new Set());
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");

    // Navegar a la URL limpia sin filtros
    startTransition(() => {
      router.push(`/${lang}/products`);
    });
  };

  /**
   * Calcula si hay algún filtro activo actualmente.
   * Se usa para mostrar condicionalmente el botón "Limpiar filtros".
   *
   * Retorna true si al menos uno de los filtros tiene un valor no vacío.
   */
  const hasActiveFilters =
    searchQuery.trim() ||
    selectedCategories.size > 0 ||
    minPrice.trim() ||
    maxPrice.trim() ||
    minYear.trim() ||
    maxYear.trim();

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  return (
    <div className={styles.filtersWindow}>
      {/* Barra de título estilo Windows 95 */}
      <TitleBar
        active
        icon={<FolderSettings variant="16x16_4" />}
        title={dict.filters.title}
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
            {dict.filters.search}:
          </label>
          <Input
            id="search-input"
            type="text"
            placeholder={dict.filters.searchPlaceholder}
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
          <Fieldset legend={dict.filters.categories}>
            <Frame
              display="flex"
              flexDirection="column"
              className={styles.categoriesList}
            >
              {/* Mapear todas las categorías disponibles */}
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  value={category.id}
                  label={category.name}
                  checked={selectedCategories.has(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
              ))}
            </Frame>
          </Fieldset>
        </div>

        {/* ============================
            FILTRO: Rango de precio
            ============================ */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>
            {dict.filters.priceRange}:
          </label>
          <div className={styles.rangeInputs}>
            {/* Campo: Precio mínimo */}
            <div className={styles.rangeField}>
              <label htmlFor="min-price" className={styles.rangeLabel}>
                {dict.filters.minPrice}
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
                {dict.filters.maxPrice}
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
          <label className={styles.filterLabel}>
            {dict.filters.yearRange}:
          </label>
          <div className={styles.rangeInputs}>
            {/* Campo: Año mínimo */}
            <div className={styles.rangeField}>
              <label htmlFor="min-year" className={styles.rangeLabel}>
                {dict.filters.minYear}
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
                {dict.filters.maxYear}
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
            BOTONES DE ACCIÓN
            ============================ */}
        <div className={styles.filterActions}>
          {/* Botón: Aplicar filtros */}
          <Button
            onClick={applyFilters}
            disabled={isPending} // Deshabilitar mientras se navega
            className={`${Cursor.Pointer}`}
          >
            {dict.filters.applyFilters}
          </Button>

          {/* Botón: Limpiar filtros (solo se muestra si hay filtros activos) */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              disabled={isPending}
              className={`${Cursor.Pointer}`}
            >
              {dict.filters.clearFilters}
            </Button>
          )}
        </div>
      </Frame>
    </div>
  );
}
