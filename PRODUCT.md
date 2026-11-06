# 📦 PRODUCT.md — Especificación Funcional Completa: GymMane + GLP-1

## 1. Propósito del Producto
Aplicación integral de entrenamiento de fuerza, nutrición y seguimiento semanal para personas que buscan transformar su composición corporal, con soporte especializado y **100 % gratuito** para quienes utilizan medicación **GLP-1 (Mounjaro / Tirzepatida u Ozempic / Semaglutida)** o siguen un plan natural.

> **Aviso educativo:** La aplicación no prescribe medicamentos ni reemplaza el criterio médico. Ofrece de forma gratuita la información nutricional, de alivio de síntomas y de preservación muscular que otras aplicaciones condicionan a suscripciones de pago.

---

## 2. Módulos Funcionales

### Módulo 1: Gimnasio y Entrenamiento (Recreación Completa de `InlitX/GymMane`)
- **Catálogo de 115 ejercicios en español** con instrucciones paso a paso y animaciones SVG cuadro por cuadro (109 animaciones integradas offline).
- **Mapa Anatómico Interactivo (`BodyMap`)**:
  - Selección de anatomía **Femenina** o **Masculina**, vista **Frontal** y **Posterior** simultánea.
  - 14 grupos musculares interactivos.
- **12 Programas de Entrenamiento**:
  - Los 8 programas originales de GymMane (*PPL*, *Upper/Lower*, *Full Body*, *Bro Split*, *Arnold Split*, *Strength 5x5*, *Bodyweight*, *Dumbbell Only*).
  - 4 programas diseñados para usuarios de Mounjaro/Ozempic enfocados en **evitar la pérdida de masa muscular y la flacidez** (*Glúteos y Piernas Cero Flacidez*, *Fuerza Femenina Completa*, *Día Suave Post-Inyección*, *Casa 25 min*).
- **Sesión de Entrenamiento en Vivo**:
  - Registro por serie de peso (`lb` o `kg`), repeticiones, esfuerzo percibido (`RPE`) y marca de completado.
  - Cronómetro automático de descanso configurable con alerta sonora.
  - Detección automática de **Récords Personales (PR)** y resumen de volumen total levantado.

### Módulo 2: Nutrición y Guía de Dieta GLP-1 (Mounjaro / Ozempic)
- **Calculadora y Anillos de Macros**:
  - Meta prioritaria de **proteína diaria** (`1.6 g – 2.0 g por kg` de peso meta) para proteger músculo y glúteos mientras baja el peso corporal.
  - Registro diario de comidas por bloque (`Desayuno`, `Almuerzo`, `Cena`, `Snacks`) e hidratación (`Vasos de agua` + `Electrolitos`).
- **Semáforo de Alimentos GLP-1**:
  - 🟢 **Priorizar**: Proteínas magras, blandas y fibra soluble que no sobrecargan el vaciamiento gástrico lento.
  - 🟡 **Moderar**: Carbohidratos complejos suaves y grasas saludables en porciones pequeñas.
  - 🔴 **Evitar**: Frituras, grasas saturadas pesadas, azúcares refinados, bebidas carbonatadas y alcohol.
- **Menús Sugeridos según el Día del Ciclo de 7 Días**:
  - Adaptación automática de las comidas sugeridas según cuántos días han pasado desde la última inyección.

### Módulo 3: Seguimiento Semanal de Inyección, Peso y Medidas
- **Control de Dosis Semanal**:
  - Soporte para **Mounjaro** (`2.5 mg`, `5 mg`, `7.5 mg`, `10 mg`, `12.5 mg`, `15 mg`), **Ozempic** (`0.25 mg`, `0.5 mg`, `1.0 mg`, `1.7 mg`, `2.0 mg`, `2.4 mg`) o **Modo Natural**.
  - Línea de tiempo de 7 días que explica qué ocurre en el cuerpo en cada fase de la semana.
- **Rotación Inteligente de 6 Sitios de Inyección**:
  - Abdomen izquierdo/derecho, muslo frontal izquierdo/derecho y brazo superior izquierdo/derecho.
- **Evolución de Peso, Medidas e IMC**:
  - Gráfica histórica de peso (`lb` / `kg`), cintura (`cm`), cadera (`cm`) y medidor visual de **IMC (BMI Gauge)**.
  - **Calendario Heatmap** de constancia mensual de entrenamiento.

### Módulo 4: Control y Alivio de Síntomas
- **Guía Práctica para 8 Síntomas Frecuentes**:
  - Náuseas, reflujo/acidez, eructos de azufre (*sulfur burps*), estreñimiento, llenura extrema, fatiga, mareo y diarrea.
  - Consejos inmediatos de qué comer, qué evitar y por qué sucede.
- **Bitácora de Síntomas**:
  - Registro por fecha e intensidad (`Leve`, `Moderado`, `Fuerte`) para llevar control semana a semana.

### Módulo 5: Privacidad y Funcionamiento 100 % Offline
- **Sin cuentas ni servidores obligatorios**: Todos los datos se guardan localmente en el dispositivo (`localStorage`) con opción de **Exportar / Importar respaldo JSON**.
- **Empaquetado Dual**: Funciona como aplicación web estática (GitHub / Vercel) y como instalador nativo **`.apk` para Android** 100 % offline.
