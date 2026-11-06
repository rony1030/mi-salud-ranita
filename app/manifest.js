export default function manifest() {
  return {
    name: "Mi Salud · Ranita GLP-1 & GymMane",
    short_name: "Mi Salud",
    description:
      "Dieta GLP-1 (Mounjaro y Ozempic), control de síntomas, seguimiento semanal y ejercicios con mapa corporal.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f8fc",
    theme_color: "#0c094e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
