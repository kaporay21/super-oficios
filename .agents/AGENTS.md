# Reglas del Proyecto Super Oficios

## Integridad de Datos y Seguridad (Estándar Obligatorio)

1. **Datos Reales con Supabase**: Toda pantalla, formulario, dashboard o lista agregada o modificada debe consultar directamente a Supabase vía `dbHelper` o el cliente oficial de Supabase. Queda estrictamente prohibido incluir datos simulados o hardcodeados ("mock data").
2. **Estados Vacíos Reales**: Si la base de datos no contiene registros para una consulta, la aplicación debe renderizar un estado vacío informativo (*empty state*) limpio.
3. **Seguridad y Roles**: Todas las vistas sensibles deben estar resguardadas mediante `AuthGuard` indicando el rol requerido (`cliente`, `profesional`, `admin`). Las operaciones privilegiadas en base de datos deben ser validadas contra el rol y la sesión del usuario en Supabase Auth.
