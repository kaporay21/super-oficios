---
name: evaluar-ideas-de-usuario
description: Metodología obligatoria para analizar, potenciar, dar estructura arquitectónica en Super Oficios y emitir una opinión experta ante cada idea o propuesta expresada por el usuario.
---

# Evaluación y Potenciación de Ideas del Usuario

Cada vez que el usuario exprese una idea, sugerencia, característica o mejora conceptual para la plataforma, se DEBE aplicar el siguiente protocolo antes de pasar a la fase de desarrollo:

## 1. Protocolo de Análisis y Potenciación
1. **Análisis de Impacto y Propósito**: Evaluar qué problema resuelve en el ecosistema (clientes, profesionales o administración).
2. **Potenciación y Mejoras (Boosts)**: Ampliar la idea con mejores prácticas de producto, UI/UX moderna, automatización y acciones directas.
3. **Lógica de Integración en Super Oficios**: Mapear exactamente cómo se acopla a las páginas (`src/app/...`), componentes existentes y la base de datos de Supabase.
4. **Respeto a las Reglas del Proyecto**: Garantizar que la propuesta cumpla 100% con datos reales desde Supabase (`dbHelper`), AuthGuard y vacíos limpios (*empty states*).
5. **Opinión Experta Sintetizada**: Presentar un resumen claro con pros, observaciones estratégicas y recomendaciones antes de proceder.

## 2. Estructura de Respuesta Recomendada
- **Diagnóstico y Valor**: Por qué la idea es relevante.
- **Mejoras Sugeridas**: Agregados estratégicos (Scores, alertas visuales, botones de acción rápida).
- **Arquitectura e Integración**: Ubicación técnica y flujo de datos con Supabase.
- **Conclusión y Pregunta Abierta**: Confirmar aprobación del usuario antes de ejecutar.
