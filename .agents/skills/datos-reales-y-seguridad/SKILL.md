---
name: datos-reales-y-seguridad
description: Regla fundamental que exige que todas las pantallas, modificaciones, funciones y características utilicen 100% datos reales consultando a Supabase (sin datos estáticos o falsos) y con verificación estricta de seguridad y AuthGuards.
---

# Regla de Integridad de Datos Reales y Seguridad de Plataforma

Para **TODAS** las páginas, pantallas, componentes, modificaciones o nuevas características creadas en el proyecto:

## 1. Datos 100% Reales desde Supabase
- **Cero Datos Falsos o Hardcodeados**: No utilizar arrays estáticos, objetos mock o textos ficticios de prueba en elementos que deban provenir del sistema o base de datos.
- **Consultas a Supabase (`dbHelper`)**: Toda lista de usuarios, publicaciones, presupuestos, postulaciones, notificaciones, métricas o perfiles debe ser consultada dinámicamente utilizando `supabase` / `dbHelper`.
- **Manejo Transparente de Estado Vacío**: Si la base de datos no contiene registros aún, la interfaz DEBE mostrar un estado vacío informativo (*empty state*) natural (ej. "No hay publicaciones registradas por el momento"), en lugar de recurrir a información simulada.

## 2. Cobertura de Seguridad y Autorización
- **Protección de Rutas (`AuthGuard`)**: Toda ruta protegida (cliente, profesional, admin) DEBE envolverse con el componente `<AuthGuard requiredRole="...">`.
- **Verificación de Roles y Permisos**: Verificar en el cliente y servidor que solo usuarios con el rol adecuado puedan realizar acciones destructivas (ej. eliminar usuarios, moderar trabajos, vaciar registros o acceder al panel admin).
- **Validación de Identidad**: Proteger datos sensibles de perfil, claves de autenticación y notificaciones de usuario.
