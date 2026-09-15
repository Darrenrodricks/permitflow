import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PermitFlow | NYSDOT Highway Work Permits",
  description:
    "A guided highway work permit prototype: complete applications, structured review, and clear next steps.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
