# NorthPeak · Centro de experiencia del cliente

## Abrir y trabajar

Ruta: `/command-center/` (en producción también `/command-center`).

1. Crea un expediente por estudio. Completa su nombre y prepara la reunión en **Protocolo**.
2. En **Descubrimiento**, usa **Vista para reunión** al compartir tu pantalla o iPad. Oculta navegación, notas internas y datos de otros expedientes. No es un control de acceso: termina la vista antes de volver a información interna.
3. Recorre las cinco secciones. Al terminar revisa la **Minuta** con el cliente.
4. Prepara la propuesta. El botón para usar respuestas solo rellena campos vacíos. Define inversión, impuestos, alcance, revisiones, fechas y dependencias; no hay cotización automática ni aceptación legal.
5. En **Producción**, asigna entregables, responsable, fecha y enlace a evidencia. “Listo” es un estado manual, no una aprobación del cliente.
6. Registra periodos, fuentes y valores de **Antes / después**. Una diferencia no acredita atribución a NorthPeak.
7. En **Entregables**, abre y revisa un documento. Usa **Imprimir / Guardar PDF**; en el diálogo de impresión selecciona A4 y desactiva encabezados/pies del navegador. El cuestionario en blanco deja espacio para escribir y separa las secciones por página.

## Los ocho entregables

Hoja de descubrimiento, minuta, propuesta, bienvenida, plan de trabajo, actualización de avance, dossier de entrega y reporte antes/después. No incluyen notas internas, bitácora ni estimación interna de costos. Los campos vacíos se muestran como pendientes, nunca como acuerdos inventados. Revisa el documento antes de compartirlo.

## Respuestas mediante enlace

Desde **Vista general → Generar enlace de preguntas**. El enlace contiene únicamente un identificador de expediente y abre `/command-center/intake.html#ref=…`. No da acceso al expediente, no contiene respuestas y no autentica a quien contesta.

La persona completa cinco pasos, revisa sus respuestas y descarga un archivo JSON. Debe adjuntarlo manualmente en su conversación contigo; el botón de WhatsApp solo abre un texto preparado. NorthPeak no recibe nada automáticamente. Importa el archivo en el centro, revisa su contenido y confirma. Sustituye el diagnóstico del expediente correspondiente, conserva notas/propuesta/tareas. Un identificador desconocido crea un expediente. No hay envío de datos a una base de datos.

En la vista local, el enlace que se copia apunta al dominio público y requiere que estos archivos estén desplegados. **Probar formulario** abre el equivalente local. `127.0.0.1` no abre esta computadora desde un iPad.

## Guardado y respaldo

El usuario eligió una primera versión con **localStorage**, sin sincronización. La clave es `northpeak-command-center-v1`. Se guarda por navegador y origen: cambiar de dominio, puerto, perfil o equipo crea un espacio diferente. No hay contraseña ni cifrado de aplicación; cualquiera con acceso al mismo navegador puede abrir los datos. El modo reunión no protege datos de personas con acceso al equipo.

Exporta un respaldo antes de salir o borrar datos del navegador. Para moverlo al iPad, abre el centro desplegado allí e importa el archivo. Al regresar, importa la versión actualizada: pide confirmación para reemplazar expedientes con el mismo identificador y conserva los demás. No combina cambios concurrentes. Los respaldos contienen información interna: comparte con el cliente únicamente documentos revisados o su propio archivo de respuestas.

El formulario público conserva borradores en sessionStorage durante dos horas al volver a abrirlo, ofrece borrarlos y nunca almacena contraseñas. Si el almacenamiento falla, avisa y permite descargar. No se garantiza funcionamiento sin conexión; carga el centro antes de la reunión y lleva el cuestionario impreso.

## Evolución posterior

Integrar con el portal administrativo existente, autenticación, permisos por organización, base de datos, recepción de formularios, historial de versiones y archivos con acceso privado. Esta versión no expone expedientes mediante enlaces ni pretende ser el portal autenticado existente.

## Validación

`node tests/command-center.cjs` verifica exportación e importación mediante los controladores de la aplicación, exclusión de notas internas y escape HTML en los ocho documentos, cálculo de esfuerzo, comparación con base cero, rechazo de archivos incompatibles y aviso de fallo de almacenamiento. La vista del navegador se revisa por separado. No requiere librerías adicionales.

## Agenda y presentación comercial

**Qué hago hoy** reúne los siguientes pasos y entregables pendientes de todos los expedientes, ordenados en vencidos, hoy, próximos y sin fecha. Excluye entregables listos y expedientes que no continuaron. Usa la fecha local del equipo; no envía avisos ni marca acciones completadas automáticamente. Abre cada expediente para actualizar el estado o la siguiente fecha.

**Presentar al cliente** prepara cinco pantallas desde el expediente seleccionado: situación, oportunidad, dirección visual, alcance e inversión y próximo paso. Edita esos contenidos en Descubrimiento y Propuesta. Las notas internas, bitácora y costos internos quedan fuera. Los campos vacíos se indican como pendientes de conversación. Incluye navegación anterior/siguiente e impresión de las cinco pantallas. Es una propuesta de conversación, no firma ni aprobación.

