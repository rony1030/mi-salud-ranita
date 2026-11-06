import "./globals.css";

export const metadata = {
  title: "GymMane · Fuerza a tu ritmo",
  description:
    "Entrenamiento de fuerza, nutrición y seguimiento personal en un solo lugar.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    title: "GymMane",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c1021",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
