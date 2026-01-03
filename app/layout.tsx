import type { Metadata } from "next";
import "@react95/core/GlobalStyle";

export const metadata: Metadata = {
  title: "RetrOmmerce - Tienda Retro de Tecnología",
  description: "Tu tienda de componentes y computadoras vintage de los 90s y 2000s",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
          {children}
      </body>
    </html>
  );
}
