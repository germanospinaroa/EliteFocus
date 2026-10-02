# Eli

Eli es una herramienta interna en `/app/eli`, no un producto público ni un chatbot de IA. La landing nunca promociona Eli.

Eli v1 funciona con Knowledge Base aprobada, reglas, decision trees, respuestas prediseñadas, estado del usuario, journey, productos, acciones, seguimientos y roleplays. No utiliza IA generativa ni una caja de texto libre como interfaz principal.

## Entradas guiadas

La experiencia `AMBASSADOR` ofrece: alguien me escribió, seguimiento, duda de producto, iniciar conversación, practicar, entrenamiento y qué hago ahora.

La experiencia `CLIENT_VIP` ofrece: entender el producto, cómo utilizarlo, preguntas, ingredientes, precauciones, FAQs, contenido y hablar con el asesor. Las opciones pueden filtrarse por los productos asociados al cliente.

Otros módulos pueden abrir Eli con contexto, por ejemplo `/app/eli?intent=followup&contact=123`. El flujo conserva el contexto y dirige a opciones aprobadas.

No usa IA generativa en esta fase. La interfaz futura debe aceptar un proveedor de razonamiento detrás de una interfaz estable, con citas de fuente, límites de compliance y control humano.
