import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import type { Metadata } from "next";
import { Cursor } from "@react95/core";

export const metadata: Metadata = {
  title: "Retrommerce - Tienda Retro de Tecnología",
  description:
    "Tu tienda de componentes y computadoras vintage de los 90s y 2000s",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        <div className={Cursor.Auto}>{children}</div>
      </body>
    </html>
  );
}
