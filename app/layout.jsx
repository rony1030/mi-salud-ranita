import "./globals.css";

export const metadata = {
  title: "Mi Salud · Ranita GLP-1 y Entrenamiento (Mounjaro / Ozempic)",
  description:
    "Guía gratuita de dieta sugerida, control de síntomas, seguimiento semanal de inyecciones Mounjaro/Ozempic y entrenamiento con mapa corporal basado en GymMane.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: {
    capable: true,
    title: "Mi Salud Ranita",
    statusBarStyle: "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c094e",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-DO">
      <body>{children}</body>
    </html>
  );
}
