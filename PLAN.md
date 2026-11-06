# 📋 PLAN MAESTRO DE REDISEÑO Y CONSTRUCCIÓN: GymMane + Módulo Clínico GLP-1 (Mounjaro / Ozempic)

> **Propósito de este documento:** Este plan está diseñado para abrir un **nuevo chat** y reconstruir la aplicación de principio a fin con un **diseño 100 % profesional idéntico a [`InlitX/GymMane`](https://github.com/InlitX/GymMane)**, conservando todas sus funciones originales de gimnasio e integrando de forma seria y clínica el seguimiento semanal de **Mounjaro / Ozempic**, la **guía de dieta sugerida GLP-1** y el **control de síntomas**.
>
> ⚠️ **Regla estricta de diseño y marca:**
> - **NO usar ícono de ranita, mascota animada ni la palabra "Ranita" en ningún lugar.**
> - Usar una estética **oscura, moderna, limpia y profesional** basada directamente en **GymMane** (`#0D0D0F` fondo principal, `#16161A` tarjetas, `#FF6B35` acento principal naranja deportivo, `#10B981` esmeralda clínico para indicadores GLP-1).
> - Nombre profesional de la aplicación: **GymMane GLP-1** (o **VitalFit GLP-1**).

---

## 🎯 1. Visión General del Proyecto

Recrear la experiencia completa de **[`InlitX/GymMane`](https://github.com/InlitX/GymMane)** (entrenamiento anatómico, rutinas, series en vivo, cronómetro, progreso, IMC y nutrición por macros) y potenciarla con un **Módulo Especializado GLP-1 (Mounjaro / Tirzepatida y Ozempic / Semaglutida)** que ofrece de manera **100 % gratuita e informativa** todo lo que otras aplicaciones de pago cobran por suscripción:
1. Qué alimentos priorizar, moderar o evitar según el día del ciclo de la inyección.
2. Seguimiento semanal de dosis, rotación anatómica de sitios de inyección y evolución de peso/medidas.
3. Control y guía de alivio inmediato de síntomas digestivos y de energía.
4. Entrenamiento de fuerza enfocado en **preservar masa muscular y evitar la flacidez** durante la pérdida de peso.

---

## 🧭 2. Estructura de Navegación (Las 5 Pestañas de GymMane + GLP-1)

La aplicación debe tener exactamente las **5 pestañas inferiores (Bottom Navigation)** de **GymMane**, enriquecidas con las funciones GLP-1:

### Pestaña 1: `Hoy` (Dashboard Diario — Estilo GymMane)
- **Header profesional**: Saludo al usuario (ej. *Massiel*), perfil rápido (peso actual, meta, tratamiento activo: `Mounjaro` / `Ozempic` / `Modo Natural`).
- **Tarjeta de Estado del Ciclo GLP-1 (7 Días)**:
  - Día actual desde la última inyección (ej. *Día 2 de 7 · Fase de máxima saciedad*).
  - Cuenta regresiva para la próxima dosis semanal y zona anatómica sugerida de rotación.
  - Botón rápido para registrar la dosis o reportar un síntoma del día.
- **Resumen de Nutrición e Hidratación (Macro Rings de GymMane)**:
  - Anillo circular de Calorías y barra prioritaria de **Proteína diaria** (`g` consumidos vs. meta para proteger músculo).
  - Control rápido de **Vasos de Agua** (`+250 ml` / `+1 vaso`) y check de electrolitos.
- **Entrenamiento de Hoy**:
  - Tarjeta del programa activo con el día que toca entrenar hoy y botón **"Iniciar Entrenamiento"**.

### Pestaña 2: `Entrenar` (Sesión en Vivo + Biblioteca Anatómica GymMane)
- **Sub-vista A: Sesión de Entrenamiento Activa (`Workout Screen`)**:
  - Cronómetro de duración total del entrenamiento en la barra superior.
  - Lista de ejercicios de la sesión con su animación SVG (`ExerciseArt`).
  - Tabla profesional de series por ejercicio: `Serie` | `Anterior` | `Peso (lb/kg)` | `Reps` | `RPE` | `✓ Completar`.
  - **Temporizador automático de descanso** flotante (60s / 90s / 120s con alerta sonora y controles `+15s` / `Saltar`).
  - Detección automática de **Récord Personal (PR)** de peso o volumen al finalizar la sesión.
- **Sub-vista B: Mapa Muscular Anatómico Interactivo (`BodyMap` + 115 Ejercicios)**:
  - Selector **Femenino / Masculino** y vista **Frente / Espalda** usando los vectores exactos de GymMane (`lib/body-svg-data.mjs`).
  - Filtro rápido de los **14 grupos musculares** (`glutes`, `quads`, `hamstrings`, `abdomen`, `obliques`, `back`, `shoulders`, `chest`, `biceps`, `triceps`, `calves`, `trapezius`, `lowerback`, `forearm`).
  - Buscador y filtro por equipo (`Peso corporal`, `Mancuernas`, `Máquina`, `Polea`, `Barra`, `Bandas`, `Pesa rusa`).
  - Ficha modal de cada ejercicio con animación cuadro por cuadro (`public/art/*.txt`) e instrucciones paso a paso en español.

### Pestaña 3: `Programas` (Plantillas de GymMane + Programas GLP-1 Anti-Flacidez)
- **8 Programas Clásicos de GymMane**:
  1. *Push / Pull / Legs (PPL — 6 días)*
  2. *Upper / Lower Split (Torso / Pierna — 4 días)*
  3. *Full Body 3x (Cuerpo Completo — 3 días)*
  4. *5-Day Muscle Split*
  5. *Arnold Split*
  6. *Strength 5x5 (Fuerza Base)*
  7. *Home Bodyweight (En Casa sin Equipo)*
  8. *Dumbbell Only (Solo Mancuernas)*
- **4 Programas Especializados GLP-1 (Mounjaro / Ozempic)**:
  9. *GLP-1 Glúteos y Piernas Firmes (Cero Flacidez — 3 días)*
  10. *GLP-1 Preservación Muscular Femenina (Cuerpo Completo — 3 días)*
  11. *GLP-1 Día Suave Post-Inyección (Días 1–2 de baja energía / náusea)*
  12. *GLP-1 Tonificación en Casa 25 min*
- **Creador de Rutinas Personalizadas**: Posibilidad de armar o editar días y ejercicios propios.

### Pestaña 4: `Nutrición` (Macros GymMane + Guía de Dieta GLP-1)
- **Sub-vista A: Diario de Comidas y Macros (Estilo GymMane)**:
  - Anillos de Calorías, Proteína, Carbohidratos, Grasas y Fibra.
  - Registro por tiempos de comida: `Desayuno`, `Almuerzo`, `Cena`, `Snacks`.
  - Registro de hidratación diaria en ml / vasos.
- **Sub-vista B: Guía Informativa de Alimentos para Mounjaro y Ozempic (Semáforo Clínico)**:
  - 🟢 **Alimentos Recomendados (Priorizar)**: Proteínas magras de fácil digestión (pechuga de pollo, pescado blanco, salmón, huevos, yogur griego, requesón/cottage, caldo de pollo, avena con chía, papaya/lechosa) con explicación de por qué protegen el músculo y caen bien al estómago.
  - 🟡 **Alimentos a Moderar (Porción pequeña)**: Aguacate, víveres suaves (auyama, yautía, puré de papa), arroz blanco en porción medida, habichuelas suaves sin grasa.
  - 🔴 **Alimentos a Evitar (Especialmente Días 1–3 post-inyección)**: Frituras, chicharrón, carnes muy grasosas, salsas cremosas, exceso de azúcar, bebidas con gas y alcohol (explicando cómo el vaciamiento gástrico lento provoca reflujo, náuseas o eructos de azufre si se consumen).
- **Sub-vista C: Menú Sugerido por Fase del Ciclo Semanal**:
  - Sugerencias prácticas de comidas según el día del ciclo:
    - *Día de Inyección (Preparación e hidratación)*
    - *Días 1–2 (Pico de efecto y máxima saciedad: porciones pequeñas, blandas y frías/tibias)*
    - *Días 3–5 (Ventana óptima de proteína y entrenamiento de fuerza)*
    - *Días 6–7 (Control de apetito al cierre de semana: alto en fibra soluble y proteína)*

### Pestaña 5: `Seguimiento` (Progreso GymMane + Control Semanal GLP-1 y Síntomas)
- **Sub-vista A: Inyección Semanal y Rotación Anatómica**:
  - Registro de aplicación semanal: medicamento (`Mounjaro` / `Ozempic`), dosis (`2.5 mg` a `15 mg` o `0.25 mg` a `2.4 mg`), fecha, peso del día y notas.
  - **Mapa Anatómico de Rotación de 6 Zonas** (Abdomen Izq/Der, Muslo Izq/Der, Brazo Superior Izq/Der) que calcula y sugiere automáticamente la siguiente zona para evitar lipodistrofia o irritación.
  - Historial completo de dosis aplicadas.
- **Sub-vista B: Control y Alivio de Síntomas GLP-1**:
  - Catálogo interactivo de los **8 síntomas más frecuentes**:
    1. Náuseas o estómago revuelto
    2. Reflujo, acidez o ardor
    3. Eructos con sabor a azufre (*sulfur burps*) o gases
    4. Estreñimiento o tránsito lento
    5. Llenura extrema con pocos bocados
    6. Fatiga o baja energía
    7. Mareo leve al levantarse
    8. Diarrea o estómago suelto
  - Para cada síntoma muestra: **Por qué ocurre**, **Qué comer o hacer hoy para aliviarlo** y **Qué evitar**.
  - Bitácora diaria de síntomas con severidad (`Leve`, `Moderada`, `Fuerte`) y alertas de seguridad médica.
- **Sub-vista C: Progreso Corporal y Calendario de Entrenamiento (GymMane)**:
  - Gráfica lineal de evolución de **Peso (`lb` / `kg`)** vs. Meta.
  - Registro de medidas corporales (**Cintura** y **Cadera** en cm) y medidor visual de **IMC (BMI Gauge)**.
  - **Calendario Heatmap de Entrenamientos** (días entrenados en el mes, racha semanal y récords personales).
  - **Exportación e Importación de Respaldo JSON** en ajustes.

---

## 🛠️ 3. Activos Técnicos Ya Listos en Este Repositorio (Reutilizables al 100 %)

En el repositorio ya están extraídos y convertidos desde `InlitX/GymMane` los datos pesados para no perder tiempo:
- [`lib/body-svg-data.mjs`](file:///home/antigravity/rony1030/mi-salud-ranita/lib/body-svg-data.mjs): Todos los trazos vectoriales SVG del mapa anatómico **Femenino y Masculino (Frente y Espalda)** para los 14 grupos musculares.
- [`lib/exercise-catalog.mjs`](file:///home/antigravity/rony1030/mi-salud-ranita/lib/exercise-catalog.mjs): Los **115 ejercicios en español** con grupo muscular primario, secundarios, equipamiento, dificultad e instrucciones paso a paso.
- `public/art/*.txt` (109 archivos): Todas las animaciones SVG cuadro por cuadro de los ejercicios de GymMane.
- [`lib/glp1-data.mjs`](file:///home/antigravity/rony1030/mi-salud-ranita/lib/glp1-data.mjs): Catálogo de medicamentos (Mounjaro/Ozempic), las 6 zonas de inyección, los 8 síntomas con guía de alivio, el semáforo de alimentos y los planes de comida por fase.

---

## 🚀 4. Pasos de Ejecución para el Nuevo Chat

Cuando abras el nuevo chat, solo debes pedirle al agente:
> *"Ejecuta el plan maestro en `PLAN.md`, `PRODUCT.md` y `DESIGN.md` para reconstruir la aplicación con el diseño oscuro profesional de GymMane (sin ranita), integrando todas las funciones de gimnasio, dieta GLP-1, seguimiento semanal y control de síntomas, y genera el APK y la vista web."*

### Secuencia técnica que ejecutará el agente:
1. **Paso 1 — Limpieza de marca y tema visual (`app/globals.css`, `app/layout.jsx`, `app/manifest.js`, `public/icon.svg`)**:
   - Eliminar `components/RanitaMascot.jsx` y cualquier referencia a "ranita".
   - Implementar el sistema de diseño **Dark Mode de GymMane** (`#0D0D0F`, `#16161A`, `#FF6B35`, `#10B981`) definido en `DESIGN.md`.
   - Crear un ícono vectorial profesional de gimnasio + salud (`icon.svg`).
2. **Paso 2 — Catálogo completo de programas (`lib/glp1-data.mjs`)**:
   - Incluir las 8 plantillas clásicas de `GymMane` + las 4 plantillas especializadas GLP-1 anti-flacidez.
3. **Paso 3 — Componentes modulares estilo GymMane (`components/`)**:
   - `BodyMap.jsx`: Mapa anatómico interactivo en tema oscuro con resaltado naranja `#FF6B35` y esmeralda `#10B981`.
   - `ExerciseArt.jsx`: Visor de animaciones SVG cuadro por cuadro sobre tarjeta limpia con controles de vista.
   - `GymManeApp.jsx`: Interfaz completa con las 5 pestañas (`Hoy`, `Entrenar`, `Programas`, `Nutrición`, `Seguimiento`), calculadora de IMC, gráfica de peso, heatmap de entrenamientos, serie en vivo con RPE y PRs, guía de alimentos GLP-1, rotación de inyección y control de síntomas.
4. **Paso 4 — Pruebas, versión Web en línea (`docs/`) y compilación de `GymMane-GLP1.apk`**:
   - Ejecutar `npm test` y verificar renderizado completo con JSDOM en las 5 pestañas.
   - Generar paquete web en `docs/` y compilar el instalador Android firmado **`GymMane-GLP1.apk`**.
