# Guía de Demostración para Clientes

Esta guía te ayudará a preparar y mostrar el sistema de forma profesional a tu cliente.

## 1. Preparación del Sistema (Antes de la reunión)

Para que el sistema se vea con datos reales y funcional, sigue estos pasos:

1.  Asegúrate de estar en la raíz del proyecto.
2.  Levanta los servicios con Docker:
    ```bash
    docker compose up -d --build
    ```
3.  **Ejecuta la carga de datos de demo**:
    ```bash
    docker compose exec backend npm run seed
    ```
    *Esto llenará el sistema con 5 médicos, 5 pacientes, 15 citas, historiales y facturas.*

## 2. Puntos clave para mostrar

### A. Acceso al Sistema
- **URL**: `http://localhost`
- **Usuario**: `admin`
- **Contraseña**: `123456`

### B. Dashboard Principal
Muestra los gráficos de citas y el resumen de pacientes. Gracias a la carga de datos, el cliente verá estadísticas reales.

### C. Gestión de Médicos
Muestra la lista de médicos creados. Explica que el sistema permite gestionar múltiples especialidades y horarios.

### D. Flujo de Pacientes y Citas
1. Busca a **Juan Pérez** en la sección de pacientes.
2. Muestra su **Historial Médico**.
3. Resalta que las facturas se generan automáticamente al completar una cita.

### E. Documentación de API (Para clientes técnicos)
Si el cliente es técnico, puedes mostrarle el Swagger: `http://localhost:3000/api-docs`

---
> [!TIP]
> Si quieres empezar de cero frente al cliente, puedes volver a ejecutar el comando de `seed` y la base de datos se limpiará y recargará automáticamente.
