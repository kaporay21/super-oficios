# Reglas del Proyecto Super Oficios

## Integridad de Datos y Seguridad (Estándar Obligatorio)

1. **Datos Reales con Supabase**: Toda pantalla, formulario, dashboard o lista agregada o modificada debe consultar directamente a Supabase vía `dbHelper` o el cliente oficial de Supabase. Queda estrictamente prohibido incluir datos simulados o hardcodeados ("mock data").
2. **Estados Vacíos Reales**: Si la base de datos no contiene registros para una consulta, la aplicación debe renderizar un estado vacío informativo (*empty state*) limpio.

## Evaluación y Potenciación de Propuestas
4. **Análisis Previo de Ideas**: Cada vez que el usuario proponga una nueva idea o característica, el asistente DEBE aplicar la skill `evaluar-ideas-de-usuario`: analizarla, mejorarla con mejores prácticas del producto, darle lógica acorde a la arquitectura de Super Oficios y brindar una opinión experta antes de su implementación.

