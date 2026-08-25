# Reglas del Proyecto Super Oficios

## Integridad de Datos y Seguridad (Estándar Obligatorio)

1. **Datos Reales con Supabase**: Toda pantalla, formulario, dashboard o lista agregada o modificada debe consultar directamente a Supabase vía `dbHelper` o el cliente oficial de Supabase. Queda estrictamente prohibido incluir datos simulados o hardcodeados ("mock data").
2. **Estados Vacíos Reales**: Si la base de datos no contiene registros para una consulta, la aplicación debe renderizar un estado vacío informativo (*empty state*) limpio.

## Evaluación y Potenciación de Propuestas
4. **Análisis Previo de Ideas**: Cada vez que el usuario proponga una nueva idea o característica, el asistente DEBE aplicar la skill `evaluar-ideas-de-usuario`: analizarla, mejorarla con mejores prácticas del producto, darle lógica acorde a la arquitectura de Super Oficios y brindar una opinión experta antes de su implementación.

## Análisis Completo de Flujo de Datos
5. **Trazabilidad de Principio a Fin**: Cada vez que se crea algo, se agrega alguna idea o se modifica algo, el asistente DEBE analizar completamente el flujo de datos: desde dónde ingresa un dato, cómo se procesa o almacena en la base de datos (Supabase), y hasta dónde debe aparecer o reflejarse en la interfaz de usuario para todos los tipos de usuarios involucrados (por ejemplo, si un Cliente publica un trabajo, asegurarse de que se envíe la notificación correcta al Profesional y aparezca en su panel).
