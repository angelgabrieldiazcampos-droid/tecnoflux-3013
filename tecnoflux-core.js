/* ============================================================================
   TECNOFLUX 3013 — NÚCLEO CENTRALIZADO DE DATOS, SINCRONIZACIÓN Y RFID (v3)
   Archivo: js/tecnoflux-core.js
   Propósito: Base única compartida por index.html y todas las subpáginas (/pages/).
   ============================================================================ */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tecnoflux_master_state_v4';
  const SESSION_KEY = 'tecnoflux_active_session_v1';

  // 1. CATÁLOGO DE MÓDULOS / SUBPÁGINAS (Controlable desde el Dashboard)
  const DEFAULT_MODULES = [
    {
      id: 'dashboard',
      code: 'MOD-00',
      title: 'Dashboard Taller',
      desc: 'Panel general, Días Sin Accidentes, turnos M-X-J y marcador de cooperativas.',
      icon: '📊',
      pathRoot: 'index.html',
      pathSub: '../index.html',
      enabled: true,
      ready: true
    },
    {
      id: 'expediente',
      code: 'MOD-01',
      title: 'Expediente & Nómina Cr',
      desc: 'Zona privada del operario por PIN/RFID: notas (70%/30%), logros y nómina en Cr.',
      icon: '🔐',
      pathRoot: 'pages/expediente.html',
      pathSub: 'expediente.html',
      enabled: true,
      ready: true
    },
    {
      id: 'mapa',
      code: 'MOD-02',
      title: 'Mapa Sevilla & Clientes',
      desc: '27 edificios geolocalizados, chat con clientes NPC y muro social X-Teknoflux.',
      icon: '🗺️',
      pathRoot: 'pages/mapa-clientes.html',
      pathSub: 'mapa-clientes.html',
      enabled: true,
      ready: true
    },
    {
      id: 'tpv',
      code: 'MOD-03',
      title: 'Terminal TPV Almacén',
      desc: 'Pedidos de materiales, alquiler de herramientas y descuentos por roturas/mermas.',
      icon: '📦',
      pathRoot: 'pages/tpv-materiales.html',
      pathSub: 'tpv-materiales.html',
      enabled: true,
      ready: true
    },
    {
      id: 'cargos',
      code: 'MOD-04',
      title: 'Cargos & Calendario Dual',
      desc: 'Histórico y proyección de mandos, radar de mérito y cuenta atrás a empresa.',
      icon: '🏛️',
      pathRoot: 'pages/cargos-rotaciones.html',
      pathSub: 'cargos-rotaciones.html',
      enabled: true,
      ready: false
    },
    {
      id: 'aduana',
      code: 'MOD-05',
      title: 'Permisos & Buzón RRHH',
      desc: 'Control de salidas al servicio (lavabo) y canal confidencial con Tutoría.',
      icon: '🚽',
      pathRoot: 'pages/aduana-rrhh.html',
      pathSub: 'aduana-rrhh.html',
      enabled: true,
      ready: false
    },
    {
      id: 'profesor',
      code: 'MOD-99',
      title: 'Excel Maestro & Retos',
      desc: 'Sincronización total con Google Sheets, gestión de logros, retos y tarjetas RFID.',
      icon: '⚙️',
      pathRoot: 'pages/panel-profesor.html',
      pathSub: 'panel-profesor.html',
      enabled: true,
      ready: false
    }
  ];

  // 2. CATÁLOGO OFICIAL DE LOS 10 EXÁMENES (RD 127/2014 · 70% Criterios)
  const UNITS_EXAM_CATALOG = [
    { ut: 'UT1',  col: 'EX1_UT1',   title: 'Herramientas y Equipación',               evalTerm: '1.ª Eval', examDate: '2026-10-22', ce: '1a, 1g, 1h, 1i, 2b, 2c' },
    { ut: 'UT2',  col: 'EX2_UT2',   title: 'Circuitos Eléctricos y Magnitudes',       evalTerm: '1.ª Eval', examDate: '2026-11-12', ce: '1b, 1g, 1j, 2a, 2h, 2i, 3a, 3d, 3g, 3i, 4e, 5d' },
    { ut: 'UT3',  col: 'EX3_UT3',   title: 'Esquemas Eléctricos y Simbología',        evalTerm: '1.ª Eval', examDate: '2026-11-26', ce: '1a, 1d, 1e, 1h, 1i, 2c, 2e, 2f, 2g, 2j, 3c, 3e, 3f, 3h, 4c, 4f, 5h' },
    { ut: 'UT4',  col: 'EX4_UT4',   title: 'Canalizaciones y Mecanismos',             evalTerm: '1.ª Eval', examDate: '2026-12-10', ce: '1a, 1c, 1d, 1e, 2a, 2b, 2c, 2d, 2e, 2f, 2j, 3b, 3d, 3e, 3i, 4a, 4b, 4c, 4d, 4e, 4f, 4h, 4i, 5f' },
    { ut: 'UT5',  col: 'EX5_UT5',   title: 'Conductores Eléctricos',                  evalTerm: '2.ª Eval', examDate: '2027-01-21', ce: '1b, 2a, 2d, 3a, 3b, 3c, 3d, 3e, 3f, 3g, 3h, 3i, 4e, 4f, 5f' },
    { ut: 'UT6',  col: 'EX6_UT6',   title: 'Instalaciones de Enlace y Protecciones',  evalTerm: '2.ª Eval', examDate: '2027-02-11', ce: '1b, 1c, 1d, 1f, 1j, 2b, 2d, 2e, 2f, 2g, 2h, 3a, 3b, 3c, 3f, 3j, 4g, 5a, 5c, 5d, 5e, 5g' },
    { ut: 'UT7',  col: 'EX7_UT7',   title: 'Cargas y Alumbrados',                     evalTerm: '2.ª Eval', examDate: '2027-03-04', ce: '1e, 1f, 4a, 4b, 4d, 4h, 5b' },
    { ut: 'UT8',  col: 'EX8_UT8',   title: 'Seguridad y PRL Avanzada',                evalTerm: '2.ª Eval', examDate: '2027-03-18', ce: '2h, 2i, 3j, 4g, 4i, 5a, 5c, 5e, 5g, 5h' },
    { ut: 'UT9',  col: 'EX9_UT9',   title: 'Domótica y Automatismos',                 evalTerm: '2.ª Eval', examDate: '2027-04-08', ce: '1c, 1f, 1i, 2g, 4a, 4b, 4c, 4d, 4h, 5b' },
    { ut: 'UT10', col: 'EX10_UT10', title: 'Mantenimiento y Averías (CSI)',           evalTerm: '2.ª Eval', examDate: '2027-04-22', ce: '1g, 1h, 1j, 2i, 2j, 3g, 3h, 3j, 4g, 4i, 5a, 5b, 5c, 5d, 5e, 5f, 5g, 5h' }
  ];

  // 3. CATÁLOGO OFICIAL DE LAS 27 PRÁCTICAS + GEOLOCALIZACIÓN SEVILLA + CLIENTES NPC
  const PRACTICES_CATALOG = [
    {
      code: 'P1', name: 'Construcción de un alargador con manguera y regletero', ut: 'UT1-UT3',
      ce: '1b,g,h,j 3a,g,h 4e,f,i 6e,g', client: 'Manolo "El Chispas" · Salesianos Trinidad', rewardCr: 120,
      lat: 37.3968, lng: -5.9832, hood: 'Trinidad · Salesianos (C/ María Auxiliadora)',
      npcName: 'Manolo "El Chispas"', npcAvatar: '👨‍🔧', npcTrait: 'Veterano implacable del REBT',
      npcQuote: '«¡Escuchadme bien! Antes de pisar la calle en Sevilla tenéis que fabricarme un alargador con manguera H05VV-F 3G1,5 mm² y regletero para mi banco de pruebas. Como vea cobre asomando fuera del prensaestopas, no salís del taller.»',
      npcTrap: 'Olvidar sujetar la cubierta exterior de la manguera con la abrazadera prensacables o no conectar el hilo Verde-Amarillo al borne central de Tierra.',
      video: ''
    },
    {
      code: 'P2', name: 'Instalación de un punto de luz simple (1 lámpara)', ut: 'UT4-UT5',
      ce: '1a,c,e 2a,d,e,g 3c,f 4a,b,d,f 5d', client: 'Valeria Montes · Boutique Sierpes', rewardCr: 130,
      lat: 37.3905, lng: -5.9942, hood: 'Centro · Calle Sierpes (Boutique Moda)',
      npcName: 'Valeria Montes', npcAvatar: '👩‍💼', npcTrait: 'Perfeccionista con la estética y seguridad',
      npcQuote: '«Hola equipo Tecnoflux. Necesito un punto de luz simple impecable en el probador principal de mi tienda en Calle Sierpes. Exijo que el interruptor corte siempre la Fase para cambiar la bombilla sin peligro.»',
      npcTrap: 'Cortar el Neutro en lugar de la Fase en el interruptor S1: la lámpara apaga, pero el casquillo sigue energizado a 230V.',
      video: ''
    },
    {
      code: 'P3', name: 'Instalación de dos lámparas en serie', ut: 'UT2-UT5',
      ce: '1g,h,j 2i 3a,c,f 4b,f 5d,e', client: 'Valeria Montes · Plaza Nueva', rewardCr: 140,
      lat: 37.3888, lng: -5.9955, hood: 'Centro · Plaza Nueva (Escaparate Vintage)',
      npcName: 'Valeria Montes', npcAvatar: '👩‍💼', npcTrait: 'Exigente con los ambientes de luz',
      npcQuote: '«Quiero un efecto de luz cálida y tenue a media tensión (115V por bombilla) con dos lámparas en serie para mi escaparate de Plaza Nueva. Explicadme antes qué ocurre si una bombilla se funde.»',
      npcTrap: 'No medir los ~115V parciales en cada receptor con el polímetro o usar bombillas LED no preparadas que parpadean.',
      video: 'https://www.youtube.com/watch?v=yb7TxevHMiI'
    },
    {
      code: 'P4', name: 'Instalación de dos lámparas en paralelo', ut: 'UT2-UT5',
      ce: '1c,i 2a,h 3b,c,f 4f,i 5d', client: 'Valeria Montes · Sede Nervión', rewardCr: 140,
      lat: 37.3826, lng: -5.9731, hood: 'Nervión · Av. Eduardo Dato (Oficinas)',
      npcName: 'Valeria Montes', npcAvatar: '👩‍💼', npcTrait: 'Cero tolerancia a apagones',
      npcQuote: '«En el pasillo de oficinas de Nervión necesito dos puntos de luz en paralelo a 230V reales. Si una bombilla se funde en plena jornada, la otra debe seguir luciendo al 100%.»',
      npcTrap: 'Empalmar sin conectores Wago/regleta dentro de la caja de registro o cruzar el retorno con el neutro.',
      video: 'https://www.youtube.com/watch?v=94YF-X_WUIA'
    },
    {
      code: 'P5', name: 'Instalación de tres lámparas en serie', ut: 'UT2-UT5',
      ce: '1c,j 2e 3b,f 4c,f 5c,d', client: 'Valeria Montes · Showroom Macarena', rewardCr: 150,
      lat: 37.4025, lng: -5.9891, hood: 'Macarena · Arco de la Macarena',
      npcName: 'Valeria Montes', npcAvatar: '👩‍💼', npcTrait: 'Auditora de caídas de tensión',
      npcQuote: '«Para el panel señalizador del showroom necesito tres lámparas en serie (~76,6V cada una). Quiero ver en el albarán la medición real con el voltímetro en cada portalámparas.»',
      npcTrap: 'Colocar el polímetro en serie en lugar de en paralelo al medir tensión.',
      video: 'https://www.youtube.com/watch?v=gvnwv1j847A'
    },
    {
      code: 'P6', name: 'Instalación de cuatro lámparas en paralelo', ut: 'UT5',
      ce: '1h,i 2h,i 3b,f,h 4c,f 5a,e', client: 'Don Carlos Alvear · Hotel Patio de Triana', rewardCr: 160,
      lat: 37.3834, lng: -6.0035, hood: 'Triana · Calle Betis (Hotel Patio de Triana)',
      npcName: 'Don Carlos Alvear', npcAvatar: '🎩', npcTrait: 'Anfitrión obsesionado con el confort',
      npcQuote: '«Bienvenidos al Hotel Patio de Triana. Necesito cuatro luminarias en paralelo en la recepción. Exijo usar conectores rápidos de 5 entradas y comprobar con pinza amperimétrica la corriente total.»',
      npcTrap: 'Dejar peladuras de cobre fuera de las clemas de 5 vías dentro de la caja de derivación.',
      video: 'https://www.youtube.com/watch?v=ea1aANwokbo'
    },
    {
      code: 'P7', name: 'Instalación de dos lámparas en serie, en paralelo con otra lámpara', ut: 'UT5',
      ce: '1c,i 2e,j 3f,i 4b,f 5d,h', client: 'Don Carlos Alvear · Salón Mudéjar Triana', rewardCr: 170,
      lat: 37.3852, lng: -6.0078, hood: 'Triana · Calle San Jacinto (Salón Mudéjar)',
      npcName: 'Don Carlos Alvear', npcAvatar: '🎩', npcTrait: 'Crítico con el equilibrio lumínico',
      npcQuote: '«En nuestro Salón Mudéjar quiero un circuito mixto: una lámpara principal E3 a 230V en paralelo con dos apliques laterales E1 y E2 en serie (115V). Si falla un aplique, la lámpara central sigue encendida.»',
      npcTrap: 'Conectar las tres en serie o equivocarse en el nodo de bifurcación dentro de la caja de registro.',
      video: 'https://www.youtube.com/watch?v=zF0pCxsD4AQ'
    },
    {
      code: 'P8', name: 'Dos lámparas en serie con su interruptor y dos en paralelo con su interruptor', ut: 'UT5',
      ce: '1a,c 2a,g,i 3f 4a,b,d,f 5d', client: 'Don Carlos Alvear · Suites Plaza de Cuba', rewardCr: 170,
      lat: 37.3765, lng: -6.0021, hood: 'Los Remedios · Plaza de Cuba (Suites Hotel)',
      npcName: 'Don Carlos Alvear', npcAvatar: '🎩', npcTrait: 'Exigente con el mando independiente',
      npcQuote: '«En las suites de Plaza de Cuba el huésped necesita dos interruptores independientes (S1 y S2): uno para la luz tenue de cortesía (2 en serie) y otro para la luz principal (2 en paralelo).»',
      npcTrap: 'Cruzar los retornos de S1 y S2 haciendo que un interruptor dependa del otro.',
      video: 'https://www.youtube.com/watch?v=e18irNw19Mc'
    },
    {
      code: 'P9', name: 'Instalación de un timbre accionado por dos pulsadores', ut: 'UT5',
      ce: '1a,c 2d,f 3c 4b,d,f 5c,d', client: 'Sargento Morales · Parque Tecnológico Cartuja', rewardCr: 160,
      lat: 37.4095, lng: -6.0062, hood: 'Isla de la Cartuja · Parque Tecnológico PCT',
      npcName: 'Sargento Morales', npcAvatar: '👮‍♂️', npcTrait: 'Estricto con los avisos acústicos',
      npcQuote: '«En el almacén de la Cartuja necesito un zumbador accionado indistintamente desde dos pulsadores NA: puerta principal y muelle de carga. ¡Usad pulsadores con retorno, jamás interruptores!»',
      npcTrap: 'Conectar los pulsadores en serie (obligaría a pulsar ambos a la vez) o montar un interruptor fijo que queme la bobina del timbre.',
      video: 'https://www.youtube.com/watch?v=TPcOpognwdA'
    },
    {
      code: 'P10', name: 'Punto de luz simple con toma de corriente con toma de tierra', ut: 'UT6',
      ce: '1b,c 2g 3a,c 4a,e,f,h 5e,g', client: 'Sargento Morales · Polígono Carretera Amarilla', rewardCr: 180,
      lat: 37.3948, lng: -5.9565, hood: 'San Pablo · Polígono Carretera Amarilla',
      npcName: 'Sargento Morales', npcAvatar: '👮‍♂️', npcTrait: 'Inflexible con la separación C1 / C2',
      npcQuote: '«En la garita de Carretera Amarilla quiero un punto de luz (Circuito C1, PIA 10A, 1,5 mm²) y una base Schuko con Tierra (Circuito C2, PIA 16A, 2,5 mm²). ¡Como mezcléis los neutros os cierro la obra!»',
      npcTrap: 'Unir el neutro azul de 1,5 mm² (alumbrado) con el neutro azul de 2,5 mm² (enchufe) o usar cable de 1,5 mm² en la toma de 16A.',
      video: 'https://www.youtube.com/watch?v=AjheFsRJirM'
    },
    {
      code: 'P11', name: 'Punto de luz simple, toma de corriente con tierra y timbre con pulsador', ut: 'UT6',
      ce: '1c,h 2h,i 3a,b,c 4e,f 6d,g', client: 'Sargento Morales · El Plantinar', rewardCr: 185,
      lat: 37.3742, lng: -5.9715, hood: 'El Plantinar · Av. Ramón y Cajal',
      npcName: 'Sargento Morales', npcAvatar: '👮‍♂️', npcTrait: 'Auditor de aislamiento galvánico',
      npcQuote: '«Cabina de control en Ramón y Cajal: necesito alumbrado simple, timbre con pulsador en la línea de 10A y base de enchufe Schuko independiente en la línea de 16A con su conductor PE verde-amarillo.»',
      npcTrap: 'Alimentar el timbre desde el circuito de fuerza de 16A o dejar la patilla de tierra del Schuko sin conectar.',
      video: 'https://www.youtube.com/watch?v=3jtXFKN_XcY'
    },
    {
      code: 'P12', name: 'Dos lámparas en serie y dos en paralelo (con interruptores) y tomas de corriente', ut: 'UT6',
      ce: '1c,i 2e,f,g 3f,h 4d,f,h 5e', client: 'Sargento Morales · Taller Amate', rewardCr: 190,
      lat: 37.3758, lng: -5.9482, hood: 'Amate · Av. de los Gavilanes (Taller)',
      npcName: 'Sargento Morales', npcAvatar: '👮‍♂️', npcTrait: 'Inspector de par de apriete',
      npcQuote: '«En el banco electrotécnico de Amate quiero alumbrado sectorizado (serie + paralelo con 2 interruptores en C1) y dos tomas Schuko en paralelo en C2 (2,5 mm²). Haré la prueba del tirón en cada borna.»',
      npcTrap: 'Dejar bornas flojas en el puente entre TC1 y TC2 o no respetar las secciones de 1,5 mm² y 2,5 mm².',
      video: 'https://www.youtube.com/watch?v=k5IxeLREFyE'
    },
    {
      code: 'P13', name: 'Dos lámparas en paralelo, timbre con dos pulsadores y dos tomas de corriente', ut: 'UT6',
      ce: '1a,h 2h,j 3c,g,i 4b,f 5c,d', client: 'Sargento Morales · Heliópolis', rewardCr: 195,
      lat: 37.3585, lng: -5.9868, hood: 'Heliópolis · Av. de la Palmera',
      npcName: 'Sargento Morales', npcAvatar: '👮‍♂️', npcTrait: 'Supervisor de oficinas de planta',
      npcQuote: '«Dotación completa para la oficina de seguridad en Heliópolis: dos lámparas en paralelo, timbre accionado desde dos accesos y dos bases de enchufe Schuko de 16A.»',
      npcTrap: 'Confundir los retornos de los pulsadores del timbre con el retorno del interruptor de alumbrado.',
      video: 'https://www.youtube.com/watch?v=8JhxQJuDdW4'
    },
    {
      code: 'P14', name: 'Tres lámparas en paralelo, dos timbres con un pulsador y dos tomas de corriente', ut: 'UT6',
      ce: '1c,j 2d,i 3b,c,f 4f,g 5a,h', client: 'Sargento Morales · Parque Torneo Pino Montano', rewardCr: 200,
      lat: 37.4172, lng: -5.9745, hood: 'Pino Montano · Parque Empresarial Torneo',
      npcName: 'Sargento Morales', npcAvatar: '👮‍♂️', npcTrait: 'Exigente con la potencia sonora',
      npcQuote: '«Nave logística en Pino Montano: hay mucho ruido de carretillas, así que necesito que un solo pulsador active DOS timbres (Z1 y Z2) en paralelo a 230V, además de tres lámparas y dos tomas.»',
      npcTrap: 'Conectar los dos timbres Z1 y Z2 en serie haciendo que reciban solo 115V y apenas suenen.',
      video: 'https://www.youtube.com/watch?v=GDkhzrVCixY'
    },
    {
      code: 'P15', name: 'Lámparas en serie conmutadas desde 2 puntos y tomas de corriente lateral', ut: 'UT8',
      ce: '1c,i 2b,c 3d,e,f 4a,b,f 5a,c,d', client: 'Amparo "La del 5.º" · Calle Asunción', rewardCr: 200,
      lat: 37.3728, lng: -6.0005, hood: 'Los Remedios · Calle Asunción (Piso 5.º)',
      npcName: 'Amparo "La del 5.º"', npcAvatar: '👵', npcTrait: 'Indecisa y miedosa de la oscuridad',
      npcQuote: '«¡Ay hijos míos, menos mal que venís! Mi pasillo de Calle Asunción es muy largo y me da miedo ir a oscuras. Quiero encender desde la entrada y apagar desde el fondo, con un enchufe al lado.»',
      npcTrap: 'Conectar mal el borne común (L) de los conmutadores S1 y S2 con los dos puentes viajeros.',
      video: 'https://www.youtube.com/watch?v=RrSryTzlAzw'
    },
    {
      code: 'P16', name: 'Cuatro lámparas en paralelo conmutadas desde 3 puntos y dos timbres', ut: 'UT8',
      ce: '1c,g 2f,j 3e,f 4b,d,f 6d,f', client: 'Amparo "La del 5.º" · Santa Justa', rewardCr: 220,
      lat: 37.3918, lng: -5.9762, hood: 'Santa Justa · Av. Kansas City',
      npcName: 'Amparo "La del 5.º"', npcAvatar: '👵', npcTrait: 'Cambia de opinión a mitad de obra',
      npcQuote: '«Oye, que lo he pensado mejor: además de la entrada y el salón, quiero un TERCER punto en mitad del pasillo (conmutador de cruzamiento) para las 4 lámparas en paralelo, y dos timbres.»',
      npcTrap: 'No cruzar correctamente las entradas y salidas en el mecanismo de cruzamiento S2 de 4 bornes.',
      video: 'https://www.youtube.com/watch?v=YqCop7rm4M4'
    },
    {
      code: 'P17', name: 'Tres lámparas en serie conmutadas desde 4 puntos', ut: 'UT8',
      ce: '1h,i 2e,h 3f,i 4c,e,f 5c,d', client: 'Amparo "La del 5.º" · Ático Paseo Colón', rewardCr: 230,
      lat: 37.3812, lng: -5.9875, hood: 'Arenal · Paseo de Cristóbal Colón',
      npcName: 'Amparo "La del 5.º"', npcAvatar: '👵', npcTrait: 'Exige control desde 4 puertas',
      npcQuote: '«En el ático tengo tres dormitorios y el salón dando al mismo distribuidor. Quiero encender y apagar las tres lámparas desde los CUATRO puntos (2 conmutadores simples + 2 de cruzamiento).»',
      npcTrap: 'Olvidar la regla N puntos = 2 conmutadores simples + (N-2) cruzamientos, o cruzar los puentes entre S2 y S3.',
      video: 'https://www.youtube.com/watch?v=ISC92Q5V17M'
    },
    {
      code: 'P18', name: 'Cuatro lámparas en paralelo accionadas mediante telerruptor (4 pulsadores) y base', ut: 'UT9',
      ce: '1f,i 2g 3c 4a,b,c,f 5b,d', client: 'Don Julio · Comunidad Cerro del Águila', rewardCr: 240,
      lat: 37.3715, lng: -5.9618, hood: 'Cerro del Águila · C/ Afán de Ribera',
      npcName: 'Don Julio (Pdte. Comunidad)', npcAvatar: '📋', npcTrait: 'Ahorrador y cronómetro en mano',
      npcQuote: '«Pasar 6 cables por todo el bloque para conmutar desde 4 sitios sale carísimo. Montadme un TELERRUPTOR en carril DIN gobernado por 4 pulsadores en paralelo a 2 hilos y una base de servicio.»',
      npcTrap: 'Confundir los bornes de la bobina del telerruptor (A1-A2) con el contacto seco de potencia (1-2).',
      video: 'https://www.youtube.com/watch?v=aRy4NMtJs_8'
    },
    {
      code: 'P19', name: 'Dos lámparas en paralelo accionadas mediante minutero con pulsadores y tomas', ut: 'UT9',
      ce: '1f 2g 3a,c 4e,f 5b,d', client: 'Don Julio · Comunidad Los Bermejales', rewardCr: 240,
      lat: 37.3524, lng: -5.9838, hood: 'Los Bermejales · Av. de Finlandia',
      npcName: 'Don Julio (Pdte. Comunidad)', npcAvatar: '📋', npcTrait: 'Obsesionado con el recibo de la luz',
      npcQuote: '«¡Los vecinos se dejan la luz de la escalera encendida toda la noche! Instaladme un MINUTERO DE ESCALERA en carril DIN (esquema a 4 hilos) con pulsadores y tomas de limpieza.»',
      npcTrap: 'No revisar el selector 3 hilos / 4 hilos en el lateral del minutero antes de dar tensión.',
      video: 'https://www.youtube.com/watch?v=HqHuFC6JSEc'
    },
    {
      code: 'P20', name: 'Lámparas accionadas mediante Interruptor Horario analógico y Digital', ut: 'UT9',
      ce: '1f 2g,j 3c 4a,b,c,f 5d', client: 'Don Julio · Zona Comercial Sevilla Este', rewardCr: 240,
      lat: 37.3922, lng: -5.9275, hood: 'Sevilla Este · Av. Emilio Lemos',
      npcName: 'Don Julio (Comunidad Este)', npcAvatar: '📋', npcTrait: 'Puntualidad suiza en fachadas',
      npcQuote: '«Para el rótulo y fachada de los locales de Sevilla Este necesitamos un INTERRUPTOR HORARIO programable en el cuadro que encienda automáticamente de 20:00 a 02:00.»',
      npcTrap: 'Alimentar el motor del reloj (L-N) pero olvidar puentear la Fase al borne común del contacto conmutado.',
      video: ''
    },
    {
      code: 'P21', name: 'Instalación de un tubo fluorescente con reactancia magnética', ut: 'UT8',
      ce: '1e,g 2i 3a 4c,f 6a,c,f', client: 'Ing. Elena Vargas · Polígono Store', rewardCr: 230,
      lat: 37.4148, lng: -5.9675, hood: 'Polígono Store · Sede Industrial',
      npcName: 'Ing. Elena Vargas', npcAvatar: '👷‍♀️', npcTrait: 'Inspectora técnica municipal',
      npcQuote: '«Antes de modernizar los talleres municipales del Polígono Store, debéis montar y diagnosticar una pantalla fluorescente clásica con REACTANCIA MAGNÉTICA y CEBADOR midiendo su consumo.»',
      npcTrap: 'Conectar el cebador en paralelo directo con la red de 230V en lugar de en serie entre los filamentos de ambos extremos.',
      video: ''
    },
    {
      code: 'P22', name: 'Instalación de un tubo fluorescente con reactancia electrónica', ut: 'UT8',
      ce: '1e 2h 3f 4c,f 5d,f', client: 'Ing. Elena Vargas · Puerto de Sevilla', rewardCr: 235,
      lat: 37.3645, lng: -6.0145, hood: 'Puerto de Sevilla · Zona Franca',
      npcName: 'Ing. Elena Vargas', npcAvatar: '👷‍♀️', npcTrait: 'Enemiga del parpadeo a 50 Hz',
      npcQuote: '«En las oficinas técnicas del Puerto necesitamos eliminar el parpadeo y el zumbido. Instalad el tubo fluorescente con REACTANCIA ELECTRÓNICA de alta frecuencia (sin cebador).»',
      npcTrap: 'Intentar intercalar un cebador en un balasto electrónico o cruzar los pares de salida de los zócalos G13.',
      video: ''
    },
    {
      code: 'P23', name: 'Cambio de luminaria: Tubo LED con alimentación por los dos extremos', ut: 'UT8',
      ce: '1e,g 2i 3c,f 4d,f,i 5e,f,g', client: 'Ing. Elena Vargas · Hangares Tablada', rewardCr: 240,
      lat: 37.3782, lng: -6.0195, hood: 'Tablada · Hangares Logísticos',
      npcName: 'Ing. Elena Vargas', npcAvatar: '👷‍♀️', npcTrait: 'Auditora de Ahorro Energético',
      npcQuote: '«Plan de ahorro en Tablada: anulad y retirad por completo la reactancia y el cebador de la pantalla antigua y recableadla para un TUBO LED CON ALIMENTACIÓN POR LOS DOS EXTREMOS.»',
      npcTrap: 'No etiquetar la pantalla modificada advirtiendo que ya va a 230V directos o meter Fase y Neutro en el mismo extremo.',
      video: ''
    },
    {
      code: 'P24', name: 'Cambio de luminaria: Tubo LED con alimentación por un extremo', ut: 'UT8',
      ce: '1e,j 2i 3c,f 4f,i 5e,f,g', client: 'Ing. Elena Vargas · Centro Cívico Bellavista', rewardCr: 250,
      lat: 37.3385, lng: -5.9788, hood: 'Bellavista · Centro Cívico Municipal',
      npcName: 'Ing. Elena Vargas', npcAvatar: '👷‍♀️', npcTrait: 'Máxima alerta ante cortocircuitos',
      npcQuote: '«¡Mucho cuidado en Bellavista! Estos nuevos TUBOS LED SE ALIMENTAN POR UN SOLO EXTREMO (INPUT L-N en el mismo zócalo). Comprobad con el polímetro antes de insertar el tubo.»',
      npcTrap: 'Insertar el extremo del tubo LED que lleva el puente interno en el zócalo alimentado con Fase y Neutro, provocando un cortocircuito franco.',
      video: ''
    },
    {
      code: 'P25', name: 'Regulador de luz (dimmer) actuando sobre dos lámparas en paralelo (con conmutador)', ut: 'UT9',
      ce: '1c,f 2f 3c 4b,d,f 5a', client: 'Chef Roberto · Restaurante Mirador del Río', rewardCr: 250,
      lat: 37.3845, lng: -5.9995, hood: 'Arenal · Restaurante Mirador del Río',
      npcName: 'Chef Roberto', npcAvatar: '👨‍🍳', npcTrait: 'Dramático con la atmósfera VIP',
      npcQuote: '«En mi comedor privado junto al río no puedo deslumbrar a los comensales. Necesito regular la intensidad de dos lámparas en paralelo con un DIMMER ROTATIVO conmutado.»',
      npcTrap: 'Montar bombillas LED normales no regulables (Non-Dimmable) haciendo que parpadeen al girar la ruleta.',
      video: ''
    },
    {
      code: 'P26', name: 'Regulador de luz (dimmer) en pastilla actuando sobre lámparas (por pulsación)', ut: 'UT9',
      ce: '1c,f,g 2f 3f 4d,e,f 5c', client: 'Chef Roberto · Terraza Plaza de España', rewardCr: 260,
      lat: 37.3772, lng: -5.9869, hood: 'Plaza de España · Terraza Real',
      npcName: 'Chef Roberto', npcAvatar: '👨‍🍳', npcTrait: 'Fanático del diseño minimalista',
      npcQuote: '«Para el reservado junto a Plaza de España no quiero ruletas feas en la pared. Ocultad una PASTILLA REGULADORA gobernada por un pulsador normal: toque corto enciende/apaga, largo regula brillo.»',
      npcTrap: 'No alimentar la pastilla con Neutro o equivocar el borne de entrada de pulsación (S) con la salida modulada (~).',
      video: ''
    },
    {
      code: 'P27', name: 'Interruptor crepuscular y detector de movimiento (actuando sobre lámparas distintas)', ut: 'UT9',
      ce: '1f 2g 3c 4a,b,d,f 6b,d', client: 'Don Eusebio · Nave Agroindustrial Alcosa', rewardCr: 280,
      lat: 37.4012, lng: -5.9185, hood: 'Parque Alcosa · Nave Agroindustrial',
      npcName: 'Don Eusebio', npcAvatar: '🏭', npcTrait: 'Vigilante nocturno implacable',
      npcQuote: '«Terminamos en mi nave de Alcosa. Quiero dos circuitos inteligentes separados: un INTERRUPTOR CREPUSCULAR para las balizas exteriores E1-E2 y un DETECTOR PIR para los focos E3-E4 del muelle.»',
      npcTrap: 'Mezclar las salidas conmutadas de la fotocélula (cable rojo) y del sensor PIR (L') o no ajustar los potenciómetros de LUX y TIME.',
      video: ''
    }
  ];


  // 4B. PROVEEDORES VIRTUALES Y CATÁLOGO OFICIAL TPV (CÓDIGOS DE 3 CIFRAS)
  const TPV_VENDORS = [
    {
      id: 'PACO',
      name: 'Suministros PACO (Almacén de Barrio)',
      avatar: '🧔‍♂️',
      factor: 0.85,
      tag: 'Económico (-15% dto base · Mayor riesgo de rotura si fuerzas)',
      quote: '«¡Pasa, chaval! Aquí tienes el material más barato de Sevilla. Cumple el REBT justito, así que no aprietes los tornillos a lo bruto que me pasas las roscas.»'
    },
    {
      id: 'HISPALIS',
      name: 'Electro-Hispalis S.L. (Distribuidor Oficial)',
      avatar: '🏢',
      factor: 1.00,
      tag: 'Calidad Profesional Estándar (1.0x · Garantía industrial)',
      quote: '«Bienvenido a Electro-Hispalis. Trabajamos primeras marcas (Schneider, Simon, Wago). Dime los códigos de 3 cifras de tu Orden de Trabajo y te preparo el albarán.»'
    },
    {
      id: 'ELITE',
      name: 'Tecno-Élite PRO (Ingeniería & Herramienta VIP)',
      avatar: '💎',
      factor: 1.25,
      tag: 'Alta Gama / Libre de Halógenos / Alquiler VIP (+25%)',
      quote: '«En Tecno-Élite suministramos material libre de halógenos para hospitales, tubo de acero e instrumental Fluke y automático. Calidad máxima para cero fallos.»'
    }
  ];

  const TPV_CATALOG = [
    // Serie 100: Conductores y Tubos Básicos
    { code: '101', cat: 'CABLEADO', name: 'Cable unipolar H07V-K 1,5 mm² (Alumbrado F/N/PE - Tramo 5m)', unitCr: 8,  ra: 'RA3', specs: 'PVC 450/750V · Colores REBT (Marrón, Azul, V/A)' },
    { code: '102', cat: 'CABLEADO', name: 'Cable unipolar H07V-K 2,5 mm² (Fuerza Schuko - Tramo 5m)',   unitCr: 12, ra: 'RA3', specs: 'PVC 450/750V · Circuito C2 Toma 16A' },
    { code: '103', cat: 'CABLEADO', name: 'Manguera flexible H05VV-F 3G1,5 mm² (Alargador P1 - 3m)',     unitCr: 15, ra: 'RA3', specs: 'Cubierta blanca/gris · 3 conductores internos' },
    { code: '104', cat: 'CABLEADO', name: 'Cable Libre de Halógenos H07Z1-K (AS) 1,5 mm² (Tramo 5m)',    unitCr: 14, ra: 'RA3', specs: '0% gases tóxicos · Pública concurrencia' },
    // Serie 200: Canalizaciones y Cajas (UT4)
    { code: '201', cat: 'CANALIZACIÓN', name: 'Tubo PVC Flexible Corrugado Ø 16 mm (Tramo 3m)',          unitCr: 6,  ra: 'RA2', specs: 'Montaje empotrado · Estrías de fijación (Máx 20 ptos)' },
    { code: '202', cat: 'CANALIZACIÓN', name: 'Tubo PVC Flexible Corrugado Ø 20 mm (Tramo 3m)',          unitCr: 8,  ra: 'RA2', specs: 'Montaje empotrado · Admite hasta 5 cables de 2,5 mm²' },
    { code: '203', cat: 'CANALIZACIÓN', name: 'Tubo PVC Rígido "Tubo H" Ø 20 mm (Tramo 2m)',             unitCr: 12, ra: 'RA2', specs: 'Superficie · Curvable en caliente (-5°C a 60°C)' },
    { code: '204', cat: 'CANALIZACIÓN', name: 'Tubo Rígido Libre de Halógenos Ø 25 mm (Tramo 2m)',       unitCr: 18, ra: 'RA2', specs: 'Hospitales/Escuelas · Humo transparente no tóxico' },
    { code: '205', cat: 'CANALIZACIÓN', name: 'Tubo Metálico Rígido de Acero Ø 20 mm (Tramo 2m)',        unitCr: 28, ra: 'RA2', specs: 'Industrial antigolpes · Obligatorio Puesta a Tierra' },
    { code: '206', cat: 'CANALIZACIÓN', name: 'Cajillo Universal de Mecanismos (Bastidor 60 mm)',        unitCr: 5,  ra: 'RA2', specs: 'PVC enlazable · Distancia entre tornillos 60 mm' },
    { code: '207', cat: 'CANALIZACIÓN', name: 'Caja de Registro / Derivación Superficie con Conos',      unitCr: 10, ra: 'RA2', specs: 'Tapa tornillo 1/4 vuelta · Máx 15m en tramo recto' },
    { code: '208', cat: 'CANALIZACIÓN', name: 'Bolsa 10 Grapas / Abrazaderas + Manguitos Unión Ø 20mm',  unitCr: 6,  ra: 'RA2', specs: 'Fijación obligatoria cada 0,50 m (medio metro)' },
    { code: '209', cat: 'CANALIZACIÓN', name: 'Kit Prensaestopas + Racor para Caja de Superficie',       unitCr: 7,  ra: 'RA2', specs: 'Prensaestopas (manguera) y Racor (tubo rígido)' },
    // Serie 300: Mecanismos, Protecciones y Automatismos
    { code: '301', cat: 'MECANISMOS', name: 'Interruptor Simple Unipolar 10AX / 250V~',                  unitCr: 10, ra: 'RA4', specs: 'Corta siempre Fase · Entrada L y salida retorno' },
    { code: '302', cat: 'MECANISMOS', name: 'Conmutador Simple 10AX / 250V~ (Pasillos 2 puntos)',        unitCr: 14, ra: 'RA4', specs: '1 borne común (L) + 2 puentes viajeros' },
    { code: '303', cat: 'MECANISMOS', name: 'Conmutador de Cruzamiento 10AX (3 o más puntos)',           unitCr: 22, ra: 'RA4', specs: '4 bornas · Invierte los dos puentes viajeros' },
    { code: '304', cat: 'MECANISMOS', name: 'Pulsador Normalmente Abierto (NA) + Timbre Zumbador 230V',  unitCr: 16, ra: 'RA4', specs: 'Retorno por muelle · Prohibido usar interruptor' },
    { code: '305', cat: 'MECANISMOS', name: 'Base de Enchufe Schuko 16A / 250V~ con Toma de Tierra',     unitCr: 12, ra: 'RA4', specs: '2P+T lateral · Cableado obligatorio 2,5 mm²' },
    { code: '306', cat: 'MECANISMOS', name: 'Pack 10 Conectores Rápidos Wago (3 y 5 entradas) + Regleta',unitCr: 8,  ra: 'RA3', specs: 'Empalme limpio sin cobre visible en caja' },
    { code: '307', cat: 'PROTECCIONES', name: 'PIA Magnetotérmico Bipolar 2x10A o 2x16A Curva C (DIN)',  unitCr: 25, ra: 'RA2', specs: 'Poder de corte 6kA · C1 (10A) / C2 (16A)' },
    { code: '308', cat: 'AUTOMATISMOS', name: 'Telerruptor Modular Carril DIN 16A / 230V~ (P18)',        unitCr: 35, ra: 'RA4', specs: 'Bobina A1-A2 · Contacto potencia 1-2' },
    { code: '309', cat: 'AUTOMATISMOS', name: 'Minutero de Escalera / Interruptor Horario DIN (P19-P20)',unitCr: 42, ra: 'RA4', specs: 'Esquema 3/4 hilos · Temporización regulable' },
    { code: '310', cat: 'AUTOMATISMOS', name: 'Regulador Dimmer / Fotocélula Crepuscular / Sensor PIR',  unitCr: 48, ra: 'RA4', specs: 'Control lumínico y detección de movimiento (P25-P27)' },
    // Serie 800: Herramientas VIP y Reposición de Roturas / Mermas (Se descuentan de Nómina Individual)
    { code: '812', cat: 'MERMA / ROTURA', name: '⚠️ Reposición Broca HSS Quemada / Material Roto en Taller', unitCr: 30, ra: 'RA1', specs: 'Cargo directo a Nómina Individual por mal uso' },
    { code: '820', cat: 'MERMA / ROTURA', name: '⚠️ Penalización Desperdicio Cable / Tubo Chafado (>0,5m)',  unitCr: 25, ra: 'RA2', specs: 'Merma por error de replanteo o curvado en frío' },
    { code: '855', cat: 'MERMA / ROTURA', name: '⚠️ Bolsa Yeso Rápido Fraguado / Regleta Pasada de Rosca',   unitCr: 15, ra: 'RA1', specs: 'Exceso de par de apriete o mala planificación' },
    { code: '880', cat: 'HERRAMIENTA VIP', name: '🛠️ Alquiler Pelacables Automático Precisión (1 Sesión)',   unitCr: 35, ra: 'RA1', specs: 'Gratis para el Jefe de Herramientas vigente' },
    { code: '885', cat: 'HERRAMIENTA VIP', name: '🛠️ Alquiler Destornillador Eléctrico VDE (1 Sesión)',      unitCr: 50, ra: 'RA1', specs: 'Gratis para el Jefe de Herramientas vigente' },
    { code: '890', cat: 'HERRAMIENTA VIP', name: '⚡ Alquiler Multímetro / Pinza Amperimétrica PRO CSI',     unitCr: 60, ra: 'RA5', specs: 'Diagnóstico de tensión, continuidad y corriente' }
  ];

  // 4. CATÁLOGO DE LOGROS, TÍTULOS E INSIGNIAS
  const BADGES_CATALOG = [
    { id: 'Escudo PRL',          icon: '🛡️', name: 'Escudo PRL & LOTO',      desc: '0 sanciones de EPIs y bloqueo LOTO verificado' },
    { id: 'Polímetro PRO',       icon: '⚡', name: 'Maestro del Polímetro',  desc: 'Medidas de tensión, continuidad y aislamiento OK' },
    { id: 'Intérprete Planos',   icon: '📐', name: 'Intérprete de Planos',   desc: 'Esquemas unifilares y multifilares sin errores' },
    { id: 'Técnico Materiales',  icon: '🔧', name: 'Técnico de Materiales',  desc: 'Dominio de canalizaciones, cotas y Regla 1/3' },
    { id: 'Especialista Cobre',  icon: '🔌', name: 'Especialista en Cobre',  desc: 'Tendido, pelado y embornado REBT perfecto' },
    { id: 'Cuadrista DIN',       icon: '🧰', name: 'Cuadrista Residencial',  desc: 'Montaje limpio de CGMP con IGA, ID y PIAs' },
    { id: 'Ing. Iluminación',    icon: '💡', name: 'Ing. de Iluminación',    desc: 'Conmutadas, cruzamientos y conversión LED' },
    { id: 'Inspector Jefe CSI',  icon: '🏆', name: 'Inspector Jefe CSI',     desc: 'Rango Élite · Apto para Fase Dual en Empresa' }
  ];

  function pad27(arr) {
    const res = new Array(27).fill(null);
    (arr || []).forEach((v, i) => { if (i < 27) res[i] = v; });
    return res;
  }

  function pad10(arr) {
    const res = new Array(10).fill(null);
    (arr || []).forEach((v, i) => { if (i < 10) res[i] = v; });
    return res;
  }

  // 5. ESTADO INICIAL CENTRALIZADO (21 Operarios con datos reales completos)
  const DEFAULT_STATE = {
    webhookUrl: '',
    lastSync: 'Modo Base Local (Sin conectar Webhook)',
    masterRfidUid: '0009805614',
    safety: {
      daysWithoutAccidents: 24,
      recordDays: 42,
      lastIncidentDate: '2026-10-24',
      lastIncidentNote: 'Apercibimiento EPIs (guantes) en Turno Jueves · Relevo #09 -> #10'
    },
    rotationMeta: {
      cycle: 'noviembre',
      week: 1,
      dualStartDate: '2027-05-03'
    },
    rolesCycles: {
      octubre: [
        { key: 'supervisor',   area: '1. SUPERVISOR DE OBRA',   sub: 'Calidad, Polímetro y Nivelación', color: '#1d4ed8', titulares: ['Operario #20', 'Operario #15', 'Operario #08'], reten: 'Retén: Operario #13 · Ciclo Octubre' },
        { key: 'herramientas', area: '2. JEFE DE HERRAMIENTAS', sub: 'Carros VDE 1000V y Equipos',      color: '#059669', titulares: ['Operario #11', 'Operario #18', 'Operario #21'], reten: 'Retén: Operario #04 · Ciclo Octubre' },
        { key: 'materiales',   area: '3. JEFE DE MATERIALES',   sub: 'Almacén, Stock y Albaranes TPV',  color: '#d97706', titulares: ['Operario #01', 'Operario #17', 'Operario #02'], reten: 'Retén: Operario #16 · Ciclo Octubre' },
        { key: 'prl',          area: '4. INSPECTOR PRL Y 5S',   sub: 'EPIs, Guantes, LOTO y Limpieza',  color: '#dc2626', titulares: ['Operario #07', 'Operario #06', 'Operario #10*'], reten: '*Operario #10 relevó al #09 por sanción EPIs' }
      ],
      noviembre: [
        { key: 'supervisor',   area: '1. SUPERVISOR DE OBRA',   sub: 'Mérito 3015 + Ciencias + 3013',     color: '#1d4ed8', titulares: ['Operario #06', 'Operario #11', 'Operario #03'], reten: '1.º Retén: Operario #13' },
        { key: 'herramientas', area: '2. JEFE DE HERRAMIENTAS', sub: 'Destreza Prácticas + Equipos VDE',  color: '#059669', titulares: ['Operario #13', 'Operario #16', 'Operario #04'], reten: '1.º Retén: Operario #20' },
        { key: 'materiales',   area: '3. JEFE DE MATERIALES',   sub: 'Inglés Técnico + Lab. Ciencias',    color: '#d97706', titulares: ['Operario #12', 'Operario #17', 'Operario #19'], reten: '1.º Retén: Operario #01' },
        { key: 'prl',          area: '4. INSPECTOR PRL Y 5S',   sub: 'Seguridad PRL + 0 Ceros Entregas',  color: '#dc2626', titulares: ['Operario #14', 'Operario #15', 'Operario #10'], reten: '1.º Retén: Operario #05 (#09 en reserva PRL)' }
      ],
      diciembre: [
        { key: 'supervisor',   area: '1. SUPERVISOR DE OBRA',   sub: 'Proyección Rotación Diciembre',     color: '#1d4ed8', titulares: ['Operario #13', 'Operario #16', 'Operario #05'], reten: 'Candidato Beca Impulso: Operario #14' },
        { key: 'herramientas', area: '2. JEFE DE HERRAMIENTAS', sub: 'Proyección Rotación Diciembre',     color: '#059669', titulares: ['Operario #06', 'Operario #10', 'Operario #08'], reten: 'Candidato Beca Impulso: Operario #07' },
        { key: 'materiales',   area: '3. JEFE DE MATERIALES',   sub: 'Proyección Rotación Diciembre',     color: '#d97706', titulares: ['Operario #01', 'Operario #04', 'Operario #18'], reten: 'Candidato recuperación: Operario #11' },
        { key: 'prl',          area: '4. INSPECTOR PRL Y 5S',   sub: 'Proyección Rotación Diciembre',     color: '#dc2626', titulares: ['Operario #08', 'Operario #17', 'Operario #21'], reten: 'Condicionado a 0 incidencias PRL/Lavabo' }
      ]
    },
    cooperativas: {
      ALFA:  { name: 'Cooperativa ALFA',  cr: 1280, rating: 1.1, pracsDone: 8, totalPracs: 27, members: ['Operario #01', 'Operario #05', 'Operario #06', 'Operario #11', 'Operario #16', 'Operario #21'] },
      BETA:  { name: 'Cooperativa BETA',  cr: 1050, rating: 1.0, pracsDone: 8, totalPracs: 27, members: ['Operario #02', 'Operario #07', 'Operario #12', 'Operario #13', 'Operario #17'] },
      GAMMA: { name: 'Cooperativa GAMMA', cr: 820,  rating: 0.9, pracsDone: 8, totalPracs: 27, members: ['Operario #03', 'Operario #08', 'Operario #09', 'Operario #14', 'Operario #18'] },
      DELTA: { name: 'Cooperativa DELTA', cr: 1140, rating: 1.0, pracsDone: 8, totalPracs: 27, members: ['Operario #04', 'Operario #10', 'Operario #15', 'Operario #19', 'Operario #20'] }
    },
    operators: [
      { pin: '4725', uid: '',         code: 'Operario #01', coop: 'ALFA',  role: 'Sin Cargo',            shift: 'Turno estándar', ra: [1700,1680,1680,1720,1720], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 120, badges: ['Escudo PRL'], exams: pad10([6.4, 5.05, 5.2]), pracsList: pad27([8.5,8.5,8.0,9.0,8.5,8.5,9.0,8.5]) },
      { pin: '4253', uid: '',         code: 'Operario #02', coop: 'BETA',  role: 'Sin Cargo',            shift: 'Turno estándar', ra: [1480,1450,1720,1700,1680], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 80,  badges: [], exams: pad10([2.1, 1.0, 1.0]), pracsList: pad27([7.5,8.0,8.5,8.5,8.0,8.0,8.5,7.5]) },
      { pin: '9875', uid: '',         code: 'Operario #03', coop: 'GAMMA', role: 'Supervisor de Obra',   shift: 'Jueves (Sem. 1)', ra: [1050,1020,1720,1480,1450], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 60,  badges: [], exams: pad10([null, null, null]), pracsList: pad27([6.0,6.0,7.5,7.0,7.0,6.5,7.0,6.5]) },
      { pin: '1142', uid: '',         code: 'Operario #04', coop: 'DELTA', role: 'Jefe de Herramientas', shift: 'Jueves (Sem. 1)', ra: [1750,1700,1680,1720,1700], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 120, badges: ['Escudo PRL', 'Polímetro PRO', 'Intérprete Planos', 'Técnico Materiales'], exams: pad10([6.15, 1.8, 2.8]), pracsList: pad27([9.0,8.5,8.5,9.0,8.5,8.5,9.0,8.5]) },
      { pin: '1254', uid: '',         code: 'Operario #05', coop: 'ALFA',  role: 'Sin Cargo',            shift: '1.º Retén PRL',  ra: [1520,1480,1450,1500,1500], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 100, badges: ['Escudo PRL'], exams: pad10([9.0, 7.6, 8.0, 7.8]), pracsList: pad27([7.5,7.5,7.0,8.0,7.5,7.5,7.5,7.5]) },
      { pin: '1024', uid: '53BE5211', code: 'Operario #06', coop: 'ALFA',  role: 'Supervisor de Obra',   shift: 'Martes (Sem. 1) · Suplente X-J', ra: [1750,1700,1680,1720,1700], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 150, badges: ['Escudo PRL', 'Polímetro PRO', 'Intérprete Planos', 'Técnico Materiales'], exams: pad10([9.2, 8.8, 9.0, 8.6]), pracsList: pad27([9.0,9.0,8.5,9.0,9.0,9.0,9.5,9.0]) },
      { pin: '6834', uid: '',         code: 'Operario #07', coop: 'BETA',  role: 'Sin Cargo',            shift: 'Turno estándar', ra: [920,1050,1020,1040,880],   exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 80,  badges: [], exams: pad10([8.2, 7.4, 7.5, 7.6]), pracsList: pad27([5.0,5.5,5.0,5.5,5.0,5.0,5.5,5.0]) },
      { pin: '9514', uid: '',         code: 'Operario #08', coop: 'GAMMA', role: 'Sin Cargo',            shift: 'Turno estándar', ra: [1080,1020,960,1010,1050],  exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 100, badges: ['Intérprete Planos'], exams: pad10([9.0, 8.5, 8.8, 8.4]), pracsList: pad27([5.5,5.0,5.0,5.5,5.0,5.5,5.0,5.5]) },
      { pin: '3072', uid: '',         code: 'Operario #09', coop: 'GAMMA', role: 'Reserva PRL (Cese)',   shift: 'Plan Recuperación PRL', ra: [1000,1050,1020,1040,2000], exits: 4, mins: 26, prlPen: 150, tpvPen: 50, attBonus: 0,   badges: ['Polímetro PRO'], exams: pad10([4.0, 5.2, 5.0, 4.8]), pracsList: pad27([5.5,5.5,6.0,6.0,6.0,6.5,6.5,7.0]) },
      { pin: '7558', uid: '',         code: 'Operario #10', coop: 'DELTA', role: 'Inspector PRL y 5S',   shift: 'Jueves (Sem. 1) · Relevó al #09', ra: [1750,1700,1680,1720,1700], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 140, badges: ['Escudo PRL', 'Intérprete Planos'], exams: pad10([9.0, 6.8, 7.0, 6.5]), pracsList: pad27([9.0,8.5,8.5,9.0,8.5,8.5,9.0,8.5]) },
      { pin: '3625', uid: '',         code: 'Operario #11', coop: 'ALFA',  role: 'Supervisor de Obra',   shift: 'Miércoles (Sem. 1)', ra: [1520,1480,1450,1500,1500], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 90,  badges: [], exams: pad10([3.8, 6.2, 6.5, 6.4]), pracsList: pad27([7.5,7.5,7.5,7.0,7.5,8.0,7.5,7.5]) },
      { pin: '2345', uid: '',         code: 'Operario #12', coop: 'BETA',  role: 'Jefe de Materiales',   shift: 'Martes (Sem. 1)', ra: [920,1050,1020,1040,880],   exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 80,  badges: [], exams: pad10([6.8, 6.2, 6.5, 6.4]), pracsList: pad27([5.0,5.0,5.5,5.0,5.5,5.0,5.0,5.5]) },
      { pin: '2048', uid: 'A4C29900', code: 'Operario #13', coop: 'BETA',  role: 'Jefe de Herramientas', shift: 'Martes (Sem. 1) · Suplente X-J', ra: [1520,1480,1450,1500,1500], exits: 1, mins: 3,  prlPen: 0,   tpvPen: 0,  attBonus: 130, badges: ['Escudo PRL', 'Polímetro PRO', 'Intérprete Planos', 'Técnico Materiales'], exams: pad10([9.0, 8.8, 9.2, 9.0]), pracsList: pad27([8.0,8.0,7.5,8.0,7.5,8.0,8.0,8.0]) },
      { pin: '2525', uid: '',         code: 'Operario #14', coop: 'GAMMA', role: 'Inspector PRL y 5S',   shift: 'Martes (Sem. 1)', ra: [1750,1700,1680,1720,1700], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 110, badges: ['Escudo PRL'], exams: pad10([7.8, 7.4, 7.6, 7.5]), pracsList: pad27([8.5,9.0,8.5,9.0,8.5,9.0,8.5,8.5]) },
      { pin: '8652', uid: '',         code: 'Operario #15', coop: 'DELTA', role: 'Inspector PRL y 5S',   shift: 'Miércoles (Sem. 1)', ra: [1520,1480,1450,1500,1500], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 90,  badges: ['Escudo PRL', 'Intérprete Planos'], exams: pad10([6.0, 4.2, 5.5, 5.2]), pracsList: pad27([7.5,7.5,7.0,7.5,7.5,7.5,8.0,7.5]) },
      { pin: '4657', uid: '',         code: 'Operario #16', coop: 'ALFA',  role: 'Jefe de Herramientas', shift: 'Miércoles (Sem. 1)', ra: [1750,1700,1680,1720,1700], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 140, badges: ['Técnico Materiales'], exams: pad10([9.0, 7.8, 8.2, 8.4]), pracsList: pad27([9.0,8.5,9.0,8.5,8.5,9.0,8.5,9.0]) },
      { pin: '4454', uid: '',         code: 'Operario #17', coop: 'BETA',  role: 'Jefe de Materiales',   shift: 'Miércoles (Sem. 1)', ra: [1520,1480,1450,1500,1500], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 110, badges: ['Escudo PRL', 'Intérprete Planos'], exams: pad10([7.4, 6.8, 7.2, 7.4]), pracsList: pad27([7.5,7.5,7.5,7.5,7.0,7.5,7.5,8.0]) },
      { pin: '2528', uid: '',         code: 'Operario #18', coop: 'GAMMA', role: 'Sin Cargo',            shift: 'Turno estándar', ra: [1750,1700,1680,1720,1700], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 90,  badges: [], exams: pad10([4.8, 5.2, 5.8, 5.6]), pracsList: pad27([9.0,8.5,8.5,9.0,9.0,8.5,8.5,9.0]) },
      { pin: '4096', uid: '',         code: 'Operario #19', coop: 'DELTA', role: 'Jefe de Materiales',   shift: 'Jueves (Sem. 1) · Plan Impulso', ra: [2000,1020,960,1010,1050], exits: 3, mins: 17, prlPen: 30,  tpvPen: 0,  attBonus: 60,  badges: ['Escudo PRL', 'Intérprete Planos'], exams: pad10([6.2, 5.8, 6.0, 6.4]), pracsList: pad27([10.0,6.0,5.5,5.5,6.0,5.5,6.0,6.0]) },
      { pin: '6865', uid: '',         code: 'Operario #20', coop: 'DELTA', role: 'Sin Cargo',            shift: '1.º Retén Herramientas', ra: [1520,1480,1450,1500,1500], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 100, badges: [], exams: pad10([7.1, 7.5, 7.5, 7.5]), pracsList: pad27([7.5,7.5,7.5,7.0,7.5,7.5,8.0,7.5]) },
      { pin: '6461', uid: '',         code: 'Operario #21', coop: 'ALFA',  role: 'Sin Cargo',            shift: 'Turno estándar', ra: [1520,1480,1450,1500,1500], exits: 0, mins: 0,  prlPen: 0,   tpvPen: 0,  attBonus: 110, badges: [], exams: pad10([7.5, 7.5, 7.5, 8.0]), pracsList: pad27([7.5,7.5,7.0,7.5,7.5,8.0,7.5,7.5]) }
    ],
    missionsAndChallenges: [
      {
        id: 'RET-01',
        type: 'RETO ACTIVO',
        title: 'Cota 60 mm y Regla del Aire (UT4)',
        desc: 'Superar el simulador de canalizaciones y calcular secciones sin saturar 1/3 del tubo.',
        rewardCr: 150,
        badge: 'Técnico Materiales',
        status: 'ABIERTO'
      },
      {
        id: 'RET-02',
        type: 'SUBMISIÓN O.T.',
        title: 'Circuito Conmutado 2 Puntos · Amparo (Los Remedios)',
        desc: 'Ejecutar P15 en tablero con identificación correcta de bornas comunes y puentes viajeros.',
        rewardCr: 200,
        badge: 'Ing. Iluminación',
        status: 'ABIERTO'
      },
      {
        id: 'RET-03',
        type: 'LOGRO SEGURIDAD',
        title: 'Cero Infracciones EPIs en Noviembre',
        desc: 'Mantener 100% de gafas, guantes y bloqueo LOTO en todas las sesiones M-X-J.',
        rewardCr: 100,
        badge: 'Escudo PRL',
        status: 'EN CURSO'
      }
    ],
    clientFeed: [
      {
        id: 'MSG-1',
        client: 'Valeria Montes (Boutique Sierpes)',
        coop: 'ALFA',
        type: 'OK',
        deltaCr: 130,
        text: 'Punto de luz P2 entregado limpio y cortando fase correctamente. Abonados +130 Cr.',
        time: 'Hace 2h'
      },
      {
        id: 'MSG-2',
        client: 'Don Carlos Alvear (Hotel Triana)',
        coop: 'GAMMA',
        type: 'WARN',
        deltaCr: -50,
        text: 'Queja en recepción: apriete flojo en clemas de caja de registro en P6. Penalización -50 Cr.',
        time: 'Ayer'
      }
    ],
    tpvLogs: [
      { id: 'TPV-101', time: 'Martes 09:15', opCode: 'Operario #06', coop: 'ALFA', vendor: 'Electro-Hispalis S.L.', payer: 'COOP', itemsSummary: '2x Tubo H 20mm (203), 10x Grapas (208)', totalCr: 27, discountNote: 'Rating ALFA 1.1x' },
      { id: 'TPV-102', time: 'Miércoles 10:40', opCode: 'Operario #09', coop: 'GAMMA', vendor: 'Suministros PACO', payer: 'NOMINA_OP', itemsSummary: '1x ⚠️ Merma Tubo Chafado / Regleta rota (820)', totalCr: 50, discountNote: 'Cargo directo a Nómina Individual (#09)' }
    ],
    modules: DEFAULT_MODULES
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      const merged = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
      if (Array.isArray(merged.modules)) {
        ['expediente', 'mapa', 'tpv'].forEach(id => {
          const m = merged.modules.find(x => x.id === id);
          if (m) m.ready = true;
        });
      }
      return merged;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function toast(msg) {
    let el = document.getElementById('tf-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tf-toast';
      el.className = 'tf-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(window._tfToastTimer);
    window._tfToastTimer = setTimeout(() => el.classList.remove('show'), 3800);
  }

  function renderNavBar(activeModuleId, isSubpage) {
    const navEl = document.getElementById('tf-dynamic-nav');
    if (!navEl) return;
    navEl.innerHTML = state.modules.map(m => {
      if (!m.enabled) return '';
      const href = isSubpage ? m.pathSub : m.pathRoot;
      const isAct = m.id === activeModuleId ? ' active' : '';
      return `<a href="${href}" class="nav-link${isAct}" title="${m.desc}"><span>${m.icon}</span><span>${m.title}</span></a>`;
    }).join('');
  }

  function loginStudentByPin(pinInput) {
    const clean = String(pinInput || '').trim();
    const op = state.operators.find(o => o.pin === clean);
    if (!op) return null;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      type: 'STUDENT',
      pin: op.pin,
      code: op.code,
      coop: op.coop,
      loginAt: Date.now()
    }));
    return op;
  }

  function loginByRfidUid(uidInput) {
    const uid = String(uidInput || '').trim().toUpperCase();
    if (!uid) return { role: 'UNKNOWN' };

    if (uid === String(state.masterRfidUid || '').trim().toUpperCase()) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        type: 'TEACHER',
        loginAt: Date.now()
      }));
      return { role: 'TEACHER', uid };
    }

    const op = state.operators.find(o => String(o.uid || '').trim().toUpperCase() === uid);
    if (op) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        type: 'STUDENT',
        pin: op.pin,
        code: op.code,
        coop: op.coop,
        uid: uid,
        loginAt: Date.now()
      }));
      return { role: 'STUDENT', operator: op, uid };
    }

    return { role: 'UNASSIGNED', uid };
  }

  function getActiveSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getOperatorByPin(pin) {
    return state.operators.find(o => o.pin === String(pin || '').trim()) || null;
  }

  function calculateOperatorMetrics(op) {
    const examsArr = Array.isArray(op.exams) ? op.exams : [];
    const validExams = examsArr.filter(v => v !== null && v !== undefined && !isNaN(v));
    const avgExams = validExams.length > 0 ? validExams.reduce((a, b) => a + Number(b), 0) / validExams.length : 0;

    const pracsArr = Array.isArray(op.pracsList) ? op.pracsList : [];
    const validPracs = pracsArr.filter(v => v !== null && v !== undefined && !isNaN(v));
    const avgPracs = validPracs.length > 0 ? validPracs.reduce((a, b) => a + Number(b), 0) / validPracs.length : 0;

    const examPoints = Math.round(avgExams * 700);
    const pracPoints = Math.round(avgPracs * 300);
    const weightedTotalPts = examPoints + pracPoints;
    const finalGrade10 = (weightedTotalPts / 1000).toFixed(2);

    let rankLabel = 'APRENDIZ EN PRÁCTICAS';
    let rankBadgeClass = 'badge-red';
    if (weightedTotalPts >= 8500) {
      rankLabel = 'INSPECTOR JEFE CSI';
      rankBadgeClass = 'badge-ok';
    } else if (weightedTotalPts >= 7000) {
      rankLabel = 'OFICIAL DE 1.ª';
      rankBadgeClass = 'badge-info';
    } else if (weightedTotalPts >= 5000) {
      rankLabel = 'OFICIAL DE 2.ª';
      rankBadgeClass = 'badge-warn';
    }

    const baseCr = Math.round((weightedTotalPts / 1000) * 100);
    const hasActiveRole = op.role && op.role !== 'Sin Cargo' && !op.role.includes('Reserva') && !op.role.includes('Cese');
    const roleBonusCr = hasActiveRole ? 200 : 0;
    const attBonusCr = Number(op.attBonus) || 0;
    const prlDedCr = Number(op.prlPen) || 0;
    const tpvDedCr = Number(op.tpvPen) || 0;
    const bathDedCr = (op.exits > 2 ? (op.exits - 2) * 50 : 0);
    const netCr = Math.max(0, baseCr + roleBonusCr + attBonusCr - prlDedCr - tpvDedCr - bathDedCr);

    const dualApto = weightedTotalPts >= 5000 && prlDedCr === 0 && (op.ra ? op.ra[0] >= 1000 : true);

    return {
      validExams, avgExams, validPracs, avgPracs,
      examPoints, pracPoints, weightedTotalPts, finalGrade10,
      rankLabel, rankBadgeClass,
      baseCr, roleBonusCr, attBonusCr, prlDedCr, tpvDedCr, bathDedCr, netCr, dualApto
    };
  }

  // Registrar interacción social / reseña de cliente que actualiza saldo de cooperativa y feed
  function postClientSocialEvent(coopKey, clientName, type, deltaCr, text) {
    if (state.cooperativas[coopKey]) {
      state.cooperativas[coopKey].cr = Math.max(0, (state.cooperativas[coopKey].cr || 0) + Number(deltaCr));
    }
    state.clientFeed.unshift({
      id: 'MSG-' + Date.now().toString().slice(-5),
      client: clientName,
      coop: coopKey,
      type: type, // 'OK' | 'WARN'
      deltaCr: Number(deltaCr),
      text: text,
      time: 'Ahora mismo'
    });
    saveState();
    pushEventToMasterSheet({
      action: 'CLIENT_SOCIAL_POST',
      coop: coopKey,
      client: clientName,
      type: type,
      deltaCr: deltaCr,
      text: text
    });
  }


  // Procesar pedido o merma en el Terminal TPV (Algoritmo de Costes por Operario y Cooperativa)
  function processTpvTransaction(orderData) {
    // orderData: { pin, vendorId, payerType ('COOP' | 'NOMINA_OP'), lines: [{code, qty}], notes }
    const op = getOperatorByPin(orderData.pin) || state.operators[0];
    const coopKey = op ? op.coop : 'ALFA';
    const coopObj = state.cooperativas[coopKey];
    const vendor = TPV_VENDORS.find(v => v.id === orderData.vendorId) || TPV_VENDORS[1];

    let rawSubtotal = 0;
    const summaryParts = [];

    (orderData.lines || []).forEach(line => {
      const item = TPV_CATALOG.find(c => c.code === line.code);
      if (!item) return;
      const qty = Math.max(1, parseInt(line.qty, 10) || 1);
      // Si es herramienta VIP y el operario es Jefe de Herramientas, sale gratis
      let itemUnitCr = Math.round(item.unitCr * vendor.factor);
      const isToolChief = op && String(op.role || '').toLowerCase().includes('herramientas');
      if (item.cat === 'HERRAMIENTA VIP' && isToolChief) {
        itemUnitCr = 0;
      }
      rawSubtotal += itemUnitCr * qty;
      summaryParts.push(`${qty}x [${item.code}] ${item.name.slice(0, 32)} (${itemUnitCr * qty} Cr)`);
    });

    // Algoritmo de descuentos / recargos:
    // 1. Si el operario es Jefe de Materiales y no es multa/merma, aplica 15% de descuento
    const isMatChief = op && String(op.role || '').toLowerCase().includes('materiales');
    let discountMultiplier = 1.0;
    const discountLabels = [`Prov: ${vendor.factor}x`];

    if (orderData.payerType === 'COOP') {
      // Rating de cooperativa: ALFA 1.1x significa 10% descuento (dividimos por rating)
      const rating = (coopObj && coopObj.rating) ? Number(coopObj.rating) : 1.0;
      if (rating > 1.0) {
        discountMultiplier *= 0.90;
        discountLabels.push('Rating Coop -10%');
      } else if (rating < 1.0) {
        discountMultiplier *= 1.10;
        discountLabels.push('Recargo Riesgo +10%');
      }
      if (isMatChief) {
        discountMultiplier *= 0.85;
        discountLabels.push('Priv. Jefe Materiales -15%');
      }
    } else {
      discountLabels.push('Imputado a Nómina Individual');
    }

    const finalCr = Math.max(0, Math.round(rawSubtotal * discountMultiplier));

    // Descontar de donde corresponda
    if (orderData.payerType === 'NOMINA_OP' && op) {
      op.tpvPen = (Number(op.tpvPen) || 0) + finalCr;
      // También repercute un 50% en la tesorería de la empresa por coste de reposición
      if (coopObj) {
        coopObj.cr = Math.max(0, (coopObj.cr || 0) - Math.round(finalCr * 0.5));
      }
    } else if (coopObj) {
      coopObj.cr = Math.max(0, (coopObj.cr || 0) - finalCr);
    }

    // Guardar historial en el operario y en tpvLogs
    if (!Array.isArray(state.tpvLogs)) state.tpvLogs = [];
    const entry = {
      id: 'ALB-' + Date.now().toString().slice(-5),
      time: new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      opCode: op ? op.code : 'Operario',
      opPin: op ? op.pin : '',
      coop: coopKey,
      vendor: vendor.name,
      payer: orderData.payerType,
      itemsSummary: summaryParts.join(' + '),
      totalCr: finalCr,
      discountNote: discountLabels.join(' · ') + (orderData.notes ? ' · ' + orderData.notes : '')
    };
    state.tpvLogs.unshift(entry);
    saveState();

    pushEventToMasterSheet({
      action: 'LOG_TPV',
      albaranId: entry.id,
      codigoOp: entry.opCode,
      cooperativa: entry.coop,
      proveedor: entry.vendor,
      cargoA: entry.payer,
      concepto: entry.itemsSummary,
      costeCr: entry.totalCr
    });

    return entry;
  }

  function checkTeacherCredential(candidate) {
    const expected = String.fromCharCode(48, 56, 48, 56, 48, 57, 48, 57);
    return String(candidate || '').trim() === expected;
  }

  async function syncWithMasterSheet() {
    const url = (state.webhookUrl || '').trim();
    if (!url) {
      toast('⚠️ Configura primero la URL de tu Webhook en Comando Profesor.');
      return false;
    }
    try {
      const res = await fetch(`${url}?action=SYNC_DASHBOARD`);
      const data = await res.json();
      if (data && data.ok) {
        if (data.safety) Object.assign(state.safety, data.safety);
        if (data.cooperativas) Object.assign(state.cooperativas, data.cooperativas);
        if (Array.isArray(data.missionsAndChallenges) && data.missionsAndChallenges.length > 0) {
          state.missionsAndChallenges = data.missionsAndChallenges;
        }
        if (Array.isArray(data.clientFeed) && data.clientFeed.length > 0) {
          state.clientFeed = data.clientFeed;
        }
        state.lastSync = 'Sincronizado: ' + new Date().toLocaleString('es-ES');
        saveState();
        toast('✅ Dashboard sincronizado con el Excel Maestro.');
        return true;
      }
    } catch (err) {
      toast('❌ No se pudo conectar con el Webhook. Revisa los permisos de Apps Script.');
    }
    return false;
  }

  async function fetchSingleStudentFromSheet(pin) {
    const url = (state.webhookUrl || '').trim();
    if (!url) return null;
    try {
      const res = await fetch(`${url}?action=GET_STUDENT_BY_PIN&pin=${encodeURIComponent(pin)}`);
      const data = await res.json();
      if (data && data.ok && data.student) {
        const op = getOperatorByPin(pin);
        if (op) {
          const s = data.student;
          if (s.Cargo) op.role = s.Cargo;
          if (s.Turno) op.shift = s.Turno;
          if (s.RA1) op.ra[0] = Number(s.RA1) || op.ra[0];
          if (s.RA2) op.ra[1] = Number(s.RA2) || op.ra[1];
          if (s.RA3) op.ra[2] = Number(s.RA3) || op.ra[2];
          if (s.RA4) op.ra[3] = Number(s.RA4) || op.ra[3];
          if (s.RA5) op.ra[4] = Number(s.RA5) || op.ra[4];
          if (s.Salidas_Sem !== undefined) op.exits = Number(s.Salidas_Sem) || 0;
          if (s.Min_Fuera !== undefined) op.mins = Number(s.Min_Fuera) || 0;
          if (s.Multas_PRL !== undefined) op.prlPen = Number(s.Multas_PRL) || 0;
          for (let p = 1; p <= 27; p++) {
            const val = s['P' + p];
            if (val !== undefined && val !== '') {
              op.pracsList[p - 1] = parseFloat(String(val).replace(',', '.'));
            }
          }
          if (data.exams) {
            for (let u = 1; u <= 10; u++) {
              const exVal = data.exams['EX' + u + '_UT' + u];
              if (exVal !== undefined && exVal !== '') {
                op.exams[u - 1] = parseFloat(String(exVal).replace(',', '.'));
              }
            }
          }
          saveState();
          return op;
        }
      }
    } catch (e) { /* Fallback silencioso */ }
    return null;
  }

  async function pushEventToMasterSheet(paramsObj) {
    const url = (state.webhookUrl || '').trim();
    if (!url) return;
    const qs = new URLSearchParams(paramsObj).toString();
    fetch(`${url}?${qs}`, { mode: 'no-cors' }).catch(() => {});
  }

  function initGlobalRfidListener(onCardScannedCallback) {
    let buffer = '';
    let lastKeyTime = 0;

    document.addEventListener('keydown', function (e) {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && !e.target.dataset.rfidCapture) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 90) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 6) {
          e.preventDefault();
          const scannedUid = buffer.toUpperCase();
          buffer = '';
          const result = loginByRfidUid(scannedUid);
          if (typeof onCardScannedCallback === 'function') {
            onCardScannedCallback(result);
          }
        }
        buffer = '';
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        buffer += e.key;
      }
    });
  }

  window.TecnofluxCore = {
    getState: () => state,
    saveState,
    resetToDefault: () => {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
    },
    renderNavBar,
    loginStudentByPin,
    loginByRfidUid,
    getActiveSession,
    clearSession,
    getOperatorByPin,
    calculateOperatorMetrics,
    postClientSocialEvent,
    getUnitsCatalog: () => UNITS_EXAM_CATALOG,
    getPracticesCatalog: () => PRACTICES_CATALOG,
    getBadgesCatalog: () => BADGES_CATALOG,
    getTpvVendors: () => TPV_VENDORS,
    getTpvCatalog: () => TPV_CATALOG,
    processTpvTransaction,
    checkTeacherCredential,
    syncWithMasterSheet,
    fetchSingleStudentFromSheet,
    pushEventToMasterSheet,
    initGlobalRfidListener,
    toast
  };

})(window);
