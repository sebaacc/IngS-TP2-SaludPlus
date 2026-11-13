# SaludPlus - Obra social

Materia: Ingeniería del Software, IES.

Profesor: Marcos Agustín, Galizzi.

Alumnos:
- Carlos, Ponce
- Sebastián Alejo, Markoja

## Manual de usuario

SaludPlus es una aplicación de demostración para gestionar la atención de pacientes en un centro médico. Reúne el registro de llegadas, la recepción, la sala de espera y la atención profesional en distintos perfiles que comparten la misma cola.

La demo usa pacientes y turnos ficticios. Los cambios se guardan en el almacenamiento local del navegador; no se envían a un servidor y no deben cargarse datos reales.

## Video de la aplicación

<a href="https://www.youtube.com/watch?v=BGzDlqejJuc" target="_blank" rel="noopener">Link al video de la app</a>

## Cómo ejecutar la demo

Desde esta carpeta (`saludplus`), instalá las dependencias y levantá el servidor de desarrollo:

```bash
npm install
npm run dev
```

Abrí en el navegador la dirección local que muestra Vite (normalmente `http://localhost:5173`). Para ingresar, usá una de estas cuentas de prueba:

| Correo | Contraseña |
| --- | --- |
| `demo@saludplus.com` | `saludplus` |
| `maria.perez@saludplus.com` | `SaludPlus2026` |

## Guía rápida

1. Iniciá sesión con una cuenta de prueba.
2. En **¿Qué perfil querés explorar?**, elegí el rol que quieras probar. Podés cambiar de perfil desde la barra superior.
3. Completá el flujo del rol. Todos los perfiles comparten los cambios guardados en ese navegador.

### Tótem de entrada

Elegí **Con turno** o **Sin turno**, ingresá un DNI de 7 u 8 números y confirmá la llegada. La demo registra al paciente en la cola y descarga un ticket en PDF; también podés volver a imprimirlo desde la pantalla de confirmación.

### Recepción

- En **Atención en recepción**, llamá al siguiente paciente para consultar sus datos y cobertura. Confirmá el pago para enviarlo a la sala de espera, o marcá que está ausente para continuar con el próximo.
- En **Turnos del día**, buscá y filtrá turnos. Podés marcar a alguien como presente o volver a llamarlo.
- En **Ingreso manual**, cargá el DNI para agregar un paciente a la cola sin pasar por el tótem. Si ya está registrado, la demo informa su estado actual.

### Profesional

En **Pacientes en espera**, revisá la cola de Cardiología y llamá al siguiente para abrir su consulta. Registrá la atención y finalizala, o reanudá una consulta si hace falta. En **Finalizados/Ausentes** podés consultar los casos cerrados.

### Pacientes

Este perfil muestra la sala de espera y el turno llamado, como en una pantalla pública del centro.

### Administrador

En **Resumen** consultá los indicadores generales del centro. **Pacientes en espera** muestra la cola y su historial de llamados; **Sala de espera** presenta los llamados en formato de pantalla pública.

## Controles de prueba

En la cola, el menú **Pruebas** permite cargar la cola con datos, simular una cola vacía, mostrar un error o reiniciar la demo. Reiniciar restaura los datos ficticios iniciales guardados en ese navegador.

## Tecnologías

Interfaz construida con React y Vite. Esta versión es una demo de frontend y persiste el estado con `localStorage`.
