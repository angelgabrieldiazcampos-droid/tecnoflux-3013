/* ============================================================================
   TECNOFLUX 3013 — NÚCLEO CENTRALIZADO DE DATOS, SINCRONIZACIÓN Y RFID
   Archivo: js/tecnoflux-core.js
   Propósito: Servir de base única para index.html y todas las subpáginas (/pages/)
   sin tener que editar HTML individualmente.
   ============================================================================ */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tecnoflux_master_state_v1';
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
      ready: false
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
      ready: false
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
      ready: false
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

  // 2. ESTADO INICIAL CENTRALIZADO (Sincronizable con Google Sheets Maestro)
  const DEFAULT_STATE = {
    webhookUrl: '',
    lastSync: 'Modo Base Local (Sin conectar Webhook)',
    masterRfidUid: '0009805614', // UID editable desde Comando Profesor
    safety: {
      daysWithoutAccidents: 24,
      recordDays: 42,
      lastIncidentDate: '2026-10-24',
      lastIncidentNote: 'Apercibimiento EPIs (guantes) en Turno Jueves · Relevo #09 -> #10'
    },
    rotationMeta: {
      cycle: 'noviembre', // octubre | noviembre | diciembre
      week: 1,            // 1 | 2 | 3
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
      { pin: '4725', uid: '', code: 'Operario #01', coop: 'ALFA',  role: 'Sin Cargo',            pracs: 8, avgExam: 5.55, avgPrac: 8.56, cr: 1280, badges: ['Escudo PRL'] },
      { pin: '4253', uid: '', code: 'Operario #02', coop: 'BETA',  role: 'Sin Cargo',            pracs: 8, avgExam: 1.37, avgPrac: 8.06, cr: 1050, badges: [] },
      { pin: '9875', uid: '', code: 'Operario #03', coop: 'GAMMA', role: 'Supervisor de Obra',   pracs: 8, avgExam: 0.00, avgPrac: 6.69, cr: 820,  badges: [] },
      { pin: '1142', uid: '', code: 'Operario #04', coop: 'DELTA', role: 'Jefe de Herramientas', pracs: 8, avgExam: 3.58, avgPrac: 8.69, cr: 1140, badges: ['Escudo PRL', 'Polímetro PRO'] },
      { pin: '1254', uid: '', code: 'Operario #05', coop: 'ALFA',  role: 'Sin Cargo',            pracs: 8, avgExam: 8.10, avgPrac: 7.50, cr: 1280, badges: ['Escudo PRL'] },
      { pin: '1024', uid: '53BE5211', code: 'Operario #06', coop: 'ALFA',  role: 'Supervisor de Obra',   pracs: 8, avgExam: 8.90, avgPrac: 9.00, cr: 1480, badges: ['Escudo PRL', 'Polímetro PRO', 'Intérprete Planos', 'Técnico Materiales'] },
      { pin: '6834', uid: '', code: 'Operario #07', coop: 'BETA',  role: 'Sin Cargo',            pracs: 8, avgExam: 7.68, avgPrac: 5.19, cr: 1050, badges: [] },
      { pin: '9514', uid: '', code: 'Operario #08', coop: 'GAMMA', role: 'Sin Cargo',            pracs: 8, avgExam: 8.68, avgPrac: 5.25, cr: 820,  badges: ['Intérprete Planos'] },
      { pin: '3072', uid: '', code: 'Operario #09', coop: 'GAMMA', role: 'Reserva PRL (Cese)',   pracs: 8, avgExam: 4.75, avgPrac: 6.13, cr: 670,  badges: ['Polímetro PRO'] },
      { pin: '7558', uid: '', code: 'Operario #10', coop: 'DELTA', role: 'Inspector PRL y 5S',   pracs: 8, avgExam: 7.33, avgPrac: 8.69, cr: 1340, badges: ['Escudo PRL', 'Intérprete Planos'] },
      { pin: '3625', uid: '', code: 'Operario #11', coop: 'ALFA',  role: 'Supervisor de Obra',   pracs: 8, avgExam: 5.73, avgPrac: 7.50, cr: 1280, badges: [] },
      { pin: '2345', uid: '', code: 'Operario #12', coop: 'BETA',  role: 'Jefe de Materiales',   pracs: 8, avgExam: 6.48, avgPrac: 5.19, cr: 1250, badges: [] },
      { pin: '2048', uid: 'A4C29900', code: 'Operario #13', coop: 'BETA',  role: 'Jefe de Herramientas', pracs: 8, avgExam: 9.00, avgPrac: 7.88, cr: 1250, badges: ['Escudo PRL', 'Polímetro PRO', 'Intérprete Planos'] },
      { pin: '2525', uid: '', code: 'Operario #14', coop: 'GAMMA', role: 'Inspector PRL y 5S',   pracs: 8, avgExam: 7.58, avgPrac: 8.69, cr: 1020, badges: ['Escudo PRL'] },
      { pin: '8652', uid: '', code: 'Operario #15', coop: 'DELTA', role: 'Inspector PRL y 5S',   pracs: 8, avgExam: 5.23, avgPrac: 7.50, cr: 1340, badges: ['Escudo PRL'] },
      { pin: '4657', uid: '', code: 'Operario #16', coop: 'ALFA',  role: 'Jefe de Herramientas', pracs: 8, avgExam: 8.35, avgPrac: 8.75, cr: 1480, badges: ['Técnico Materiales'] },
      { pin: '4454', uid: '', code: 'Operario #17', coop: 'BETA',  role: 'Jefe de Materiales',   pracs: 8, avgExam: 7.20, avgPrac: 7.50, cr: 1250, badges: ['Escudo PRL'] },
      { pin: '2528', uid: '', code: 'Operario #18', coop: 'GAMMA', role: 'Sin Cargo',            pracs: 8, avgExam: 5.35, avgPrac: 8.75, cr: 820,  badges: [] },
      { pin: '4096', uid: '', code: 'Operario #19', coop: 'DELTA', role: 'Jefe de Materiales',   pracs: 8, avgExam: 6.10, avgPrac: 6.31, cr: 1340, badges: ['Escudo PRL'] },
      { pin: '6865', uid: '', code: 'Operario #20', coop: 'DELTA', role: 'Sin Cargo',            pracs: 8, avgExam: 7.40, avgPrac: 7.50, cr: 1140, badges: [] },
      { pin: '6461', uid: '', code: 'Operario #21', coop: 'ALFA',  role: 'Sin Cargo',            pracs: 8, avgExam: 7.63, avgPrac: 7.50, cr: 1280, badges: [] }
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
        text: 'Punto de luz P2 entregado limpio y cortando fase correctamente. +130 Cr abonados.',
        time: 'Hace 2h'
      },
      {
        id: 'MSG-2',
        client: 'Don Carlos Alvear (Hotel Triana)',
        coop: 'GAMMA',
        type: 'WARN',
        text: 'Revisar apriete en clemas de caja de registro en P6 antes de auditoría final.',
        time: 'Ayer'
      }
    ],
    modules: DEFAULT_MODULES
  };

  // Cargar y fusionar estado persistente
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Toast universal
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

  // Renderizado dinámico de la barra de navegación superior
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

  // Autenticación de Alumnado (por PIN de 4 dígitos o UID RFID)
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

  // Verificación de clave docente sin dejar rastro literal en el DOM
  function checkTeacherCredential(candidate) {
    const expected = String.fromCharCode(48, 56, 48, 56, 48, 57, 48, 57);
    return String(candidate || '').trim() === expected;
  }

  // Sincronización con el Excel Maestro (Google Apps Script Webhook)
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

  async function pushEventToMasterSheet(paramsObj) {
    const url = (state.webhookUrl || '').trim();
    if (!url) return;
    const qs = new URLSearchParams(paramsObj).toString();
    fetch(`${url}?${qs}`, { mode: 'no-cors' }).catch(() => {});
  }

  // Escucha Global de Lector RFID USB (Emulación de teclado rápida + Enter)
  function initGlobalRfidListener(onCardScannedCallback) {
    let buffer = '';
    let lastKeyTime = 0;

    document.addEventListener('keydown', function (e) {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      // Si el usuario está escribiendo manualmente en un textarea o input normal (salvo el input dedicado RFID)
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

  // Exponer API Global
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
    checkTeacherCredential,
    syncWithMasterSheet,
    pushEventToMasterSheet,
    initGlobalRfidListener,
    toast
  };

})(window);
