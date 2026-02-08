import "server-only";

import Link from "next/link";
import { Button, Cursor } from "@react95/core";
import { Back } from "@react95/icons";
import { getDictionary, type Locale } from "../dictionaries";

interface BackToProps {
  /**
   * URL a la que debe regresar el botón.
   * Ej: `/${lang}/products` o `/${lang}/user/favorites`
   */
  href: string;

  lang?: Locale | null;
  /**
   * Texto opcional para el botón. Si no se pasa y `lang` existe, se usa
   * el diccionario; si no, se usa un texto por defecto.
   */
  label?: string | null;
}

/**
 * Componente server reutilizable que renderiza un botón de "volver" hacia `href`.
 * - Si se recibe `lang` y no `label`, obtiene el texto de `dict.common.backToProducts`.
 */
export default async function BackToButton({ href, lang, label }: BackToProps) {
  const dict = lang ? await getDictionary(lang) : undefined;
  const text = label ?? dict?.common?.backToProducts ?? "Back";

  return (
    <Link href={href} className={Cursor.Pointer}>
      <Button className={Cursor.Pointer} aria-label={text}>
        <Back variant="16x16_4" />
        {" " + text}
      </Button>
    </Link>
  );
}
