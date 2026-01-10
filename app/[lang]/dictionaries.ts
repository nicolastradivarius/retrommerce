import 'server-only'

// Objeto que mapea cada idioma a una función que importa dinámicamente su diccionario.
// Se usa import() dinámico para cargar solo el diccionario necesario (code splitting).
// Esto mejora el rendimiento al no cargar todos los idiomas de una vez.
const dictionaries = {
  // Cada función retorna una Promise que resuelve al módulo del diccionario
  // y extrae la exportación `default` de ese módulo.
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
}

// Definición del tipo de las claves de idioma soportadas ('es' | 'en').
// Esto se infiere automáticamente de las claves del objeto `dictionaries`.
export type Locale = keyof typeof dictionaries;

// Función asíncrona que obtiene el diccionario para un idioma específico.
// Recibe un `locale` (ej: 'es' o 'en') y ejecuta la función correspondiente
// del objeto `dictionaries`, retornando el contenido JSON del diccionario.
export const getDictionary = async (locale: Locale) => dictionaries[locale]();

// Type guard (función de guarda de tipos) que verifica si un string es un idioma válido.
// Retorna `true` si el `locale` existe como clave en el objeto `dictionaries`.
// TypeScript usa esto para narrowing: si retorna true, el tipo se estrecha a `Locale`.
export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;