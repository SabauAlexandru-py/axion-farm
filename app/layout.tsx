import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axion Farm · IG + Outlook",
  description: "Phone-farm control plane",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
