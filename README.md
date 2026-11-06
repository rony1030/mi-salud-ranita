# 🐸 Mi Salud Ranita GLP-1 — Guía de Dieta, Seguimiento Semanal, Síntomas y Gym

### 📲 [Descargar APK para Android (`Mi-Salud-Ranita-GLP1.apk` · 1.82 MB)](https://github.com/rony1030/mi-salud-ranita/raw/main/Mi-Salud-Ranita-GLP1.apk)

> **Instalación directa en Android:** Toca el enlace de arriba desde el celular para descargar **`Mi-Salud-Ranita-GLP1.apk`** e instálalo directamente. Funciona **100 % offline** (sin servidor y sin necesidad de internet), guardando todos los datos en el teléfono.

---

Aplicación web / PWA y APK de Android inspirada en la experiencia visual y mascota interactiva de **Mi Finanza** y recreando el sistema de entrenamiento anatómico de **[GymMane by InlitX](https://github.com/InlitX/GymMane)**, adaptada especialmente para personas que utilizan **Mounjaro (Tirzepatida)** u **Ozempic (Semaglutida)** — diseñada con cariño para **Massiel**.

> **Aviso importante:** Esta aplicación es una herramienta **100 % gratuita, informativa y de registro personal**. No prescribe medicamentos ni sustituye la consulta con un médico o nutricionista. Reúne en un solo lugar la información educativa de alimentación, hidratación, alivio de síntomas y preservación muscular que otras aplicaciones de GLP-1 suelen cobrar por suscripción.

---

## ✨ Qué incluye

1. **🐸 La Ranita Compañera con Semáforo Inteligente (`Verde` / `Amarillo` / `Rojo`)**
   - Reacciona en tiempo real a tu hidratación, porciones de proteína, fase de tu inyección semanal y síntomas registrados.
   - Incluye frases motivadoras y cálidas con toque dominicano y consejos prácticos al instante.

2. **💉 Seguimiento Semanal de Inyección GLP-1 (Mounjaro / Ozempic)**
   - Registro de dosis (`2.5 mg` a `15 mg` para Mounjaro; `0.25 mg` a `2.4 mg` para Ozempic).
   - **Mapa de rotación de 6 zonas** (abdomen izquierdo/derecho, muslo izquierdo/derecho, brazo izquierdo/derecho) que sugiere automáticamente dónde toca inyectarse esta semana para cuidar la piel.
   - **Línea de tiempo del ciclo de 7 días** (Día 1-2 Pico de efecto, Día 3-5 Quema activa y fuerza, Día 6-7 Cierre de ciclo, o recordatorio si pasaron más de 7 días).
   - **Registro semanal de peso y medidas** (`lb` / `kg`, cintura y cadera) con gráfica de evolución.

3. **🥗 Guía de Dieta Sugerida para Mounjaro y Ozempic**
   - **Semáforo de alimentos** con búsqueda y filtros:
     - 🟢 **Priorizar siempre**: proteínas magras y suaves (huevos, pollo, pescado, yogurt griego, cottage, caldo, avena con chía) para proteger masa muscular y evitar flacidez.
     - 🟡 **Comer en porciones pequeñas**: aguacate, arroz/víveres cocidos (auyama, yautía, plátano hervido), habichuelas suaves, frutas con piel.
     - 🔴 **Evitar (especialmente los primeros 3 días post-inyección)**: frituras, chicharrón, comidas muy grasosas, salsas cremosas, exceso de azúcar, refrescos con gas y alcohol.
   - **Menú sugerido según el día de tu inyección** y **Reglas de Oro GLP-1** (comer primero la proteína, regla de los 20 minutos, separar líquidos de las comidas).

4. **🌿 Control y Alivio de Síntomas**
   - Guía práctica e inmediata para los 8 síntomas más frecuentes: **náuseas, reflujo/acidez, eructos con sabor a huevo (azufre), estreñimiento, llenura extrema, fatiga, mareo y diarrea**.
   - Qué hacer al instante, qué comer hoy en su lugar y señales de alerta médica.
   - Bitácora diaria de síntomas con nivel (`Leve`, `Moderado`, `Fuerte`).

5. **💪 Gym y Mapa Muscular Anatómico (Basado en GymMane)**
   - **4 Rutinas especializadas GLP-1** (Tonificación y Glúteos Cero Flacidez, Fuerza en Casa sin Equipo, Día Suave Post-Inyección y Cuerpo Completo Express).
   - **Sesión de entrenamiento en vivo** con check de series y **cronómetro automático de descanso**.
   - **Mapa anatómico interactivo Femenino / Masculino (Frente y Espalda)** con **115 ejercicios en español** y animaciones SVG cuadro por cuadro.

---

## 🚀 Desarrollo local y compilación del APK

```bash
npm install
npm test
npm run dev
```

Para regenerar el paquete autónomo y el archivo `Mi-Salud-Ranita-GLP1.apk`:

```bash
node scripts/build-standalone.mjs
node scripts/build-apk.mjs
```

---

## 📜 Créditos y Licencia

- **Arquitectura de entrenamiento, mapas anatómicos SVG y catálogo de ejercicios:** Basado en **[GymMane by InlitX](https://github.com/InlitX/GymMane)** (*Based on GymMane by InlitX*), licenciado bajo GPL-3.0.
- **Ilustraciones de ejercicios:** Derivadas de [Workout Guide](https://github.com/dariuszacheja/workout-guide) por Dariusz Zacheja y [Everkinetic](http://db.everkinetic.com), bajo licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **Concepto de mascota interactiva con semáforo y estética cálida:** Inspirado en [Mi Finanza (`rony1030/mi-finanza`)](https://github.com/rony1030/mi-finanza).
