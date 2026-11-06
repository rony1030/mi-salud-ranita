export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "GymMane GLP-1 · Fuerza & Salud Metabólica",
    short_name: "GymMane GLP-1",
    description:
      "Entrenamiento de fuerza y seguimiento clínico para Mounjaro / Ozempic con nutrición, control de síntomas y series en vivo.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0F",
    theme_color: "#0D0D0F",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
