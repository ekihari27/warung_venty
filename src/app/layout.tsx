import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warung Venty - Sistem Inventaris & Kasir (POS)",
  description:
    "Kelola Stok dan Penjualan Lebih Mudah. Sistem POS modern untuk UMKM Indonesia.",
  keywords: ["POS", "kasir", "inventaris", "warung", "UMKM", "stok"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
