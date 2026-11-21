# Dirección de diseño

Guía visual del frontend. Se aplica con la skill `frontend-design`
(`.claude/skills/frontend-design`). Cualquier pantalla nueva debe seguir estos tokens.

## Brief

- **Producto:** sistema de recepción y consulta para una clínica de Lima.
- **Audiencia:** recepcionistas (lo usan todo el día), médicos (consultan su agenda) y el administrador.
- **Trabajo principal:** saber quién viene hoy, a qué hora y con qué médico, y actuar sobre ello.

Por eso la pantalla de inicio es la **agenda del día**, no una cuadrícula de métricas.

## Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| Papel | `#F1F4F3` | `#0E1719` | Fondo de la aplicación |
| Superficie | `#FFFFFF` | `#152226` | Paneles, tablas, formularios |
| Tinta | `#16252B` | `#E4ECEE` | Texto principal |
| Tinta suave | `#55666C` | `#93A6AC` | Texto secundario |
| Línea | `#D6DFDF` | `#26383D` | Bordes y divisores |
| Petróleo | `#0B5563` | `#5FB0BB` | Acción principal, selección, marca "ahora" |

Los colores de **estado** sólo aparecen donde hay un estado:
programada `#1F5FA8`, completada `#2D7A55`, cancelada `#A8432F`, pendiente `#9A6A12`.
Nada de gradientes ni de colores decorativos.

## Tipografía

**IBM Plex Sans** (400, 500 y 600), una sola familia. Tiene un aire técnico y legible, propio de la
documentación clínica, sin ser la sans genérica de siempre. Las horas y los montos usan
`font-variant-numeric: tabular-nums` para alinearse en columna.

Escala (tercera mayor, base 14 px): 12 · 14 · 16 · 20 · 25 · 31.
El título de la agenda (la fecha) es el único texto grande de la aplicación.

## Layout

```
┌──────────────┬───────────────────────────────────────────────────┐
│ Clínica      │ Viernes 21 de noviembre       ‹ Hoy ›  Nueva cita │
│              │ 2 citas hoy                                       │
│ Atención     │ ┌──────────────────────────────┐ ┌──────────────┐ │
│  Agenda      │ │ 08:00  Juan Pérez  Programada│ │ Esta semana  │ │
│  Citas       │ │        Dr. Carlos Mendoza    │ │ 10 citas     │ │
│  Pacientes   │ │━━ 09:40 ━━━━━━━━━━━━━━━━━━━━━│ │ S/ 810       │ │
│  Historial   │ │ 10:00  Libre                 │ │              │ │
│ Administración│ │ ...                          │ │ Solicitudes  │ │
│  ...         │ └──────────────────────────────┘ └──────────────┘ │
└──────────────┴───────────────────────────────────────────────────┘
```

- Barra lateral clara, con iconos de línea (lucide) y agrupada por tarea, no por entidad.
- Contenido alineado a la izquierda, con un ancho máximo de 1180 px.
- Las tablas son la superficie principal de las páginas de gestión: sin tarjetas anidadas.

## Principios

1. **El elemento memorable es la línea de tiempo de la agenda** con la marca de "ahora". Todo lo demás es sobrio.
2. El color comunica estado, no decora.
3. Los iconos acompañan a una etiqueta; nunca la reemplazan, y nunca se usan emojis.
4. Radios: 6 px en controles y 10 px en paneles. Sin sombras: la separación la dan las líneas.
5. Textos en voz activa y frases normales: "Nueva cita", "Guardar cambios", "Paciente eliminado".
6. Accesibilidad: foco visible, contraste AA y `prefers-reduced-motion` respetado.

## Defaults descartados

Se descartaron, por genéricos: la cuadrícula de KPIs con gradiente, los emojis como iconos,
las etiquetas en mayúsculas sobre cada título, los metadatos unidos con "·" y la fuente Inter.
