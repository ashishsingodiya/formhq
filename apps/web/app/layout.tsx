import type { Metadata } from "next";
import "./globals.css";
import { allFontVariables } from "./fonts";
import { GlobalProviders } from "~/providers/global";

export const metadata: Metadata = {
  title: "My App",
  description: "My App Description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={allFontVariables}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
