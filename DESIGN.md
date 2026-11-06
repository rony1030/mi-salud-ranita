# 🎨 DESIGN.md — Sistema de Diseño Profesional (Basado en InlitX/GymMane)

## 1. Filosofía Visual
- **Inspiración directa:** [`InlitX/GymMane`](https://github.com/InlitX/GymMane).
- **Estética:** Oscura (*Dark Mode* nativo de alto contraste), deportiva, clínica y moderna.
- **Cero caricaturas:** No utilizar mascotas infantiles ni referencias a "ranita". La interfaz debe verse como una aplicación premium de entrenamiento y salud metabólica.

---

## 2. Paleta de Colores (GymMane Dark Theme)

| Token | Hex | Uso en la Interfaz |
| :--- | :--- | :--- |
| `--bg-primary` | `#0D0D0F` | Fondo principal de la aplicación (Obsidian Dark) |
| `--bg-surface` | `#16161A` | Tarjetas principales, paneles y modales |
| `--bg-elevated` | `#1E1E24` | Inputs, selectores, filas de series y tarjetas secundarias |
| `--border-subtle` | `#2A2A32` | Bordes finos de tarjetas y divisores (`1px solid`) |
| `--accent-primary` | `#FF6B35` | Naranja GymMane: botones principales, músculos activos en `BodyMap`, series completadas, pestaña activa |
| `--accent-secondary` | `#FF8C42` | Ámbar cálido para degradados, rachas y récords personales (PR) |
| `--accent-glp1` | `#10B981` | Verde esmeralda clínico: ciclo de inyección GLP-1, meta de proteína y alimentos recomendados |
| `--accent-hydration` | `#38BDF8` | Azul cian: vasos de agua, hidratación y electrolitos |
| `--status-green` | `#22C55E` | Semáforo de alimentos: **Priorizar** / Síntoma controlado |
| `--status-yellow` | `#F59E0B` | Semáforo de alimentos: **Moderar** / Síntoma moderado |
| `--status-red` | `#EF4444` | Semáforo de alimentos: **Evitar** / Síntoma fuerte / Alerta médica |
| `--text-primary` | `#F4F4F6` | Títulos, métricas principales y nombres de ejercicios |
| `--text-secondary` | `#9CA3AF` | Subtítulos, etiquetas de macros y descripciones |
| `--text-muted` | `#6B7280` | Textos auxiliares y placeholders |

---

## 3. Tipografía y Jerarquía Numérica
- **Fuente principal:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, sans-serif.
- **Números tabulares (`font-variant-numeric: tabular-nums`):** Obligatorio en cronómetros de descanso, pesos (`lb`/`kg`), repeticiones, dosis (`2.5 mg`, `0.5 mg`) y gramos de proteína.
- **Tamaños clave:**
  - Métrica Hero (Calorías / Peso / Cronómetro): `1.75rem – 2.25rem`, `font-weight: 800`.
  - Título de Sección: `1.15rem`, `font-weight: 700`.
  - Nombre de Ejercicio / Alimento: `0.95rem`, `font-weight: 600`.
  - Badges / Chips: `0.75rem`, `font-weight: 600`, `border-radius: 999px`.

---

## 4. Componentes Visuales Clave

1. **Bottom Navigation Bar (5 Pestañas Fijas en Móvil)**:
   - Fondo `#121216` con `backdrop-filter: blur(16px)` y borde superior `#2A2A32`.
   - Pestañas: `Hoy` | `Entrenar` | `Programas` | `Nutrición` | `Seguimiento`.
   - Pestaña activa con ícono y texto en `#FF6B35` e indicador luminoso superior.

2. **Anillos de Macros (Macro Rings de GymMane)**:
   - Gráficos circulares SVG (`stroke-dasharray`) para Calorías, Proteína (`#10B981`), Carbohidratos (`#38BDF8`) y Grasas (`#F59E0B`).

3. **Mapa Muscular Anatómico (`BodyMap`)**:
   - Silueta base en gris oscuro (`#272730` / `#32323E`) sobre contenedor `#16161A`.
   - Músculos seleccionados iluminados en naranja GymMane (`#FF6B35`) y músculos prioritarios anti-flacidez con borde esmeralda (`#10B981`).

4. **Visor de Ejercicios Animados (`ExerciseArt`)**:
   - Contenedor de alto contraste con fondo claro suave (`#F8FAFC`) o silueta invertida para que los trazos anatómicos SVG se vean con máxima nitidez, acompañado de etiquetas de músculo primario y equipamiento.

5. **Tarjeta de Ciclo Semanal GLP-1 y Mapa de Rotación de 6 Zonas**:
   - Barra de progreso segmentada en 7 días (Día 1 a Día 7).
   - Diagrama corporal de 6 puntos de inyección mostrando en `#10B981` la zona sugerida de esta semana y en gris las zonas anteriores.
