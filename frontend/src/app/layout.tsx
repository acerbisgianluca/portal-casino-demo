import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth";

export const metadata: Metadata = {
  title: "Casino de Portal",
  description: "Join Casino de Portal, the ultimate gaming experience on the Portal Network. Play your favorite games, earn rewards, and connect with a vibrant community of gamers. Experience the thrill of the casino like never before!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
