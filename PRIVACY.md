# Arquitectura de Privacidad y Cumplimiento LOPD

Este documento describe las medidas técnicas implementadas en "Risk Analysis" para cumplir con el **RGPD** y la guía AEPD *"El uso de imágenes de terceros en sistemas de inteligencia artificial"*.

## 1. Declaración de Responsabilidad (Capa Legal)
Antes de analizar cualquier imagen, el sistema exige una **acción afirmativa expresa** del usuario:
*   **Mecanismo**: Checkbox obligatorio en `ImageUploader`.
*   **Alcance**: El usuario certifica tener legitimación (interés legítimo/laboral o consentimiento) para captar la imagen del entorno de trabajo.
*   **Estado**: Sin este consentimiento, el botón de análisis permanece bloqueado técnica y visualmente.

## 2. Anonimización Automática (Privacy by Design)
Para minimizar el tratamiento de datos biométricos (rostros), se aplica una técnica de **anonimización en origen (Client-Side)**.

### Flujo Técnico (`/src/utils/faceAnonymizer.js`)
1.  **Detección Local**: Al seleccionar una foto, el navegador carga modelos de `face-api.js` (Tiny Face Detector).
2.  **Procesamiento**: Se identifican los rostros dentro del navegador del usuario. **La imagen original NUNCA sale del dispositivo sin procesar.**
3.  **Difuminado (Blur)**: Se aplica un filtro de desenfoque fuerte sobre las coordenadas detectadas.
4.  **Envío Seguro**: Solo la versión con caras difuminadas se envía a los servicios de IA (Google Gemini).

Esto convierte efectivamente la imagen en un dato pseudonimizado o no personal respecto a los trabajadores que aparecen incidentalmente.

## 3. Minimización y Retención
*   **No Persistencia**: Las imágenes se procesan en memoria y se descartan tras la sesión. No existe base de datos de almacenamiento de imágenes.
*   **Logs**: El sistema no registra el contenido visual en los logs del servidor.
