import "./globals.css";

export const metadata = {
  title: "GymMane GLP-1 · Fuerza y Salud Metabólica (Mounjaro / Ozempic)",
  description:
    "Aplicación profesional de gimnasio basada en GymMane con seguimiento clínico GLP-1 (Mounjaro / Ozempic), nutrición por macros, semáforo de alimentos, control de síntomas y series en vivo.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: {
    capable: true,
    title: "GymMane GLP-1",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0D0D0F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
