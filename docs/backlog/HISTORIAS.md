1. Historias de usuario
E2-H01 — Indicar tiempo disponible
Como usuario autenticado de Mi Cartelera Personal, quiero indicar el tiempo libre del que dispongo, para planificar una sesión de películas que pueda completar.

Criterios de aceptación

CA-01 — Tiempo válido
- DADO que accedí a Noche de película con mi sesión iniciada,
- CUANDO ingreso un número entero entre 30 y 600 minutos, incluidos ambos límites,
- ENTONCES el sistema acepta ese tiempo para calcular las películas que caben.
CA-02 — Tiempo inválido
- DADO que el campo está vacío o contiene un valor decimal, no numérico, menor que 30 o mayor que 600,
- CUANDO intento utilizarlo,
- ENTONCES el sistema no continúa con el cálculo y muestra un mensaje de validación comprensible.
E2-H02 — Consultar películas que caben
Como usuario con películas pendientes en mi colección, quiero conocer cuáles caben dentro del tiempo disponible, para elegir qué ver esa noche.

Criterios de aceptación

CA-03 — Películas elegibles
- DADO que tengo películas en estado por_ver y he indicado un tiempo válido,
- CUANDO consulto la disponibilidad,
- ENTONCES veo las películas elegibles ordenadas alfabéticamente, con su duración en minutos y la indicación de si caben en el tiempo restante de la sesión.
CA-04 — Duración desconocida
- DADO que TMDB no devuelve una duración válida para una película,
- CUANDO consulto las películas disponibles,
- ENTONCES la película aparece como no disponible y se explica que no tiene una duración conocida.
CA-05 — Restricción de títulos
- DADO que mi colección contiene series o películas en estado viendo o vista,
- CUANDO consulto qué películas puedo añadir,
- ENTONCES esos títulos no son seleccionables para Noche de película.
CA-06 — Consulta externa
- DADO que se están obteniendo las duraciones desde TMDB,
- CUANDO la consulta está pendiente o falla,
- ENTONCES la aplicación muestra un estado de carga o un mensaje de error, respectivamente, sin presentar una duración inventada.
E2-H03 — Armar una sesión
Como usuario que organiza una noche de películas, quiero agregar y quitar películas de una sesión, para aprovechar el tiempo libre sin excederlo.

Criterios de aceptación

CA-07 — Agregar y quitar películas
- DADO que selecciono una película elegible que cabe en mi tiempo disponible,
- CUANDO la agrego o la quito de la sesión,
- ENTONCES se actualizan inmediatamente la duración total y el tiempo restante.
CA-08 — Pausas entre películas
- DADO que mi sesión contiene n películas,
- CUANDO se calcula la duración total,
- ENTONCES se suman sus duraciones y 10 minutos por cada pausa entre películas; con una sola película no se agrega ninguna pausa.
CA-09 — Película que no cabe
- DADO que agregar otra película haría superar el tiempo disponible, incluyendo la pausa que corresponda,
- CUANDO intento agregarla,
- ENTONCES la aplicación impide agregarla y explica por qué.
CA-10 — Límite exacto
- DADO que una combinación de películas y pausas ocupa exactamente el tiempo disponible,
- CUANDO agrego la última película,
- ENTONCES la sesión se acepta y el tiempo restante es cero.
CA-11 — Selección duplicada
- DADO que una película ya está en mi sesión en preparación,
- CUANDO intento agregarla nuevamente,
- ENTONCES el sistema evita duplicarla en esa misma sesión.
CA-12 — Cambio de tiempo
- DADO que tengo películas seleccionadas,
- CUANDO reduzco el tiempo disponible por debajo del total de la sesión,
- ENTONCES la aplicación indica que el plan excede el nuevo límite y no permite guardarlo hasta que vuelva a ser válido.
E2-H04 — Guardar una sesión
Como usuario autenticado, quiero guardar una sesión que preparé, para conservar mi plan de películas.

Criterios de aceptación

CA-13 — Guardado válido
- DADO que preparé una sesión no vacía, dentro del límite de tiempo y con un nombre válido,
- CUANDO la guardo,
- ENTONCES queda asociada a mi cuenta, con su fecha de creación, películas, duraciones y pausas.
CA-14 — Guardado inválido
- DADO que la sesión está vacía, excede el tiempo o tiene un nombre inválido,
- CUANDO intento guardarla,
- ENTONCES la aplicación impide el guardado y muestra el motivo.
CA-15 — Estados sin cambios
- DADO que guardo una sesión,
- CUANDO regreso a mi colección,
- ENTONCES las películas conservan su estado por_ver y los demás datos personales que ya tenían.
E2-H05 — Consultar sesiones guardadas
Como usuario autenticado, quiero consultar los planes que guardé, para revisar su contenido posteriormente.

Criterios de aceptación

CA-16 — Listado y detalle
- DADO que tengo sesiones guardadas,
- CUANDO consulto mi historial,
- ENTONCES veo el nombre, fecha, tiempo disponible y duración total de cada sesión, y puedo abrir el detalle de sus películas.
CA-17 — Conservación histórica
- DADO que elimino de mi colección una película que aparece en una sesión guardada,
- CUANDO consulto esa sesión,
- ENTONCES siguen visibles los datos de la película registrados al guardar la sesión.
CA-18 — Privacidad
- DADO que inicio sesión con una cuenta diferente,
- CUANDO intento consultar o modificar sesiones ajenas,
- ENTONCES no puedo acceder a los datos de otra persona.
CA-19 — Solo lectura
- DADO que abro el detalle de una sesión guardada,
- CUANDO reviso sus datos,
- ENTONCES puedo consultarlos sin cambiar la sesión original.
CA-20 — Historial vacío
- DADO que todavía no he guardado ninguna sesión,
- CUANDO abro el historial,
- ENTONCES veo un mensaje de estado vacío en lugar de un error.
2. Estado y decisiones de refinamiento
Las historias E2-H01 a E2-H05 cubren las funciones principales de la épica y están pendientes de la especificación definitiva. Las siguientes decisiones se proponen para documentarse en el PRD y la spec:
- Una película puede aparecer en sesiones guardadas diferentes, pero no dos veces en la misma sesión.
- Las películas elegibles se muestran alfabéticamente.
- Una sesión guardada es de solo lectura.
- La sesión guarda una copia histórica de los datos necesarios para mostrar cada película aunque se quite de la colección.
- Cada sesión tiene un nombre y una fecha de creación automática.
Los casos borde adicionales, su justificación y la decisión de aceptarlos o rechazarlos se registran en docs/backlog/REFINAMIENTO.md. No se implementará código de E2 antes de revisar las especificaciones.
3. Revisión INVEST
E2-H01 — Indicar tiempo disponible
- Independiente: la validación puede desarrollarse sin guardar sesiones.
- Negociable: los mensajes de error y la presentación pueden refinarse.
- Valiosa: permite indicar el tiempo real disponible.
- Estimable: requiere un campo y reglas acotadas de validación.
- Pequeña: se limita al ingreso y validación del tiempo.
- Testeable: se comprueban los límites y las entradas inválidas.
Resultado: cumple INVEST.
E2-H02 — Consultar películas que caben
- Independiente: ofrece información útil sin requerir persistencia de sesiones.
- Negociable: la forma de mostrar la disponibilidad puede refinarse.
- Valiosa: ayuda a decidir qué película ver.
- Estimable: implica filtrar la colección y consultar duraciones.
- Pequeña: se centra en mostrar películas elegibles.
- Testeable: se verifican estado, tipo, duración y fallos de consulta.
Resultado: cumple INVEST con dependencia funcional del tiempo validado.
E2-H03 — Armar una sesión
- Independiente: el armado puede funcionar sin guardado en base de datos.
- Negociable: el orden visual y la interacción pueden ajustarse.
- Valiosa: convierte la lista de películas en un plan concreto.
- Estimable: incluye selección y un cálculo definido.
- Pequeña: se limita al plan en preparación.
- Testeable: se comprueban pausas, límites exactos y duplicados.
Resultado: cumple INVEST con dependencia de películas elegibles.
E2-H04 — Guardar una sesión
- Independiente: la persistencia puede probarse con una sesión válida preparada como dato de prueba.
- Negociable: la confirmación y validación del nombre pueden refinarse.
- Valiosa: conserva el plan del usuario.
- Estimable: comprende validación y una operación de guardado.
- Pequeña: se centra en guardar, sin incluir el historial visual.
- Testeable: se prueban sesiones válidas, inválidas y estados intactos.
Resultado: cumple INVEST; requiere modelo de datos y políticas RLS especificados.
E2-H05 — Consultar sesiones guardadas
- Independiente: la consulta puede verificarse usando registros de prueba ya existentes.
- Negociable: el formato del historial puede ajustarse.
- Valiosa: permite recuperar los planes.
- Estimable: se limita a listado y detalle de solo lectura.
- Pequeña: no incluye edición ni eliminación de sesiones.
- Testeable: se verifica historial vacío, privacidad y conservación histórica.
Resultado: cumple INVEST; depende de que existan datos persistidos.
4. Conclusión y pendientes
Las cinco historias se encuentran separadas, con criterios observables y sin duplicados. Las dependencias técnicas se describen en docs/backlog/TICKETS.md.
