// src/app/layout.js
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { RefreshProvider } from "@/context/RefreshContext";

export const metadata = {
  title: "GRC Dashboard",
  description: "GRC Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RefreshProvider>
            {children}
          </RefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
