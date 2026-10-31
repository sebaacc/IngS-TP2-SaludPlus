import { useEffect, useState } from 'react'
import './App.css'

const storageKey = 'saludplus-demo-queue-v1'

const seedPatients = [
  { id: 'A-104', arrived: '08:42', priority: 'Normal', status: 'Esperando' },
  { id: 'A-105', arrived: '08:50', priority: 'Normal', status: 'Esperando' },
  { id: 'A-107', arrived: '09:10', priority: 'Normal', status: 'Esperando' },
  { id: 'A-110', arrived: '09:12', priority: 'Prioridad', status: 'Esperando' },
  { id: 'A-112', arrived: '09:15', priority: 'Normal', status: 'Esperando' },
  { id: 'A-115', arrived: '09:18', priority: 'Normal', status: 'Esperando' },
]

function loadSavedDemo() {
  if (typeof window === 'undefined') return { patients: seedPatients, currentCall: null }
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return { patients: seedPatients, currentCall: null }
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed.patients)) return { patients: seedPatients, currentCall: null }
    return { patients: parsed.patients, currentCall: parsed.currentCall ?? null }
  } catch {
    return { patients: seedPatients, currentCall: null }
  }
}

function sortEligiblePatients(patients) {
  return patients
    .filter((patient) => patient.status === 'Esperando')
    .sort((a, b) => {
      const priorityOrder = Number(b.priority === 'Prioridad') - Number(a.priority === 'Prioridad')
      return priorityOrder || a.arrived.localeCompare(b.arrived)
    })
}

function formatLocalCallTime(value) {
  return new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const navItems = [
  { id: 'queue', label: 'Cola de espera', icon: 'queue' },
  { id: 'waiting-room', label: 'Sala de espera', icon: 'display' },
]

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    queue: <><path d="M4 5h16M4 10h16M4 15h10M4 20h7" /><circle cx="18" cy="17" r="3" /></>,
    display: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    brand: <><path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 17 5l3 2M4 17l3 2a7 7 0 0 0 11.5-4" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function LocalClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="clock-block" aria-label={`Hora local ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}>
    <Icon name="clock" size={22} />
    <div><strong>{now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</strong><span>{now.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
  </div>
}

function Brand() {
  return <div className="brand"><span className="brand-mark"><Icon name="brand" size={24} /></span><span><strong>SaludPlus</strong><small>Obra Social</small></span></div>
}

function QueueTable({ patients }) {
  if (!patients.length) return <div className="empty-state"><span className="state-icon"><Icon name="people" size={27} /></span><h3>No hay pacientes en espera</h3><p>Cuando se registren nuevas llegadas, aparecerán en esta lista.</p></div>
  return <div className="table-wrap"><table><thead><tr><th scope="col">N.º de turno</th><th scope="col">Hora de llegada</th><th scope="col">Prioridad</th><th scope="col">Estado</th></tr></thead><tbody>
    {patients.map((patient) => <tr key={patient.id}><td><span className="ticket-number">{patient.id}</span></td><td>{patient.arrived}</td><td><span className={`priority ${patient.priority === 'Prioridad' ? 'priority-high' : ''}`}>{patient.priority === 'Prioridad' && <span className="priority-dot" />}{patient.priority}</span></td><td><span className="status"><span />{patient.status}</span></td></tr>)}
  </tbody></table></div>
}

function QueuePage({ patients, currentCall, setScenario, onCallNext, onReset, loading, error, storageError }) {
  const waiting = sortEligiblePatients(patients)
  return <>
    <header className="page-heading"><div><div className="eyebrow">CENTRO MÉDICO · CENTRO CAPITAL</div><h1>Cola de espera</h1><p>Seguimiento de pacientes para el consultorio asignado.</p></div><LocalClock /></header>
    <section className="context-bar" aria-label="Consultorio actual"><div className="context-item"><span className="context-label">Consultorio</span><strong>3</strong></div><span className="context-divider" /><div className="context-item"><span className="context-label">Especialidad</span><strong>Cardiología</strong></div><span className="live-indicator"><span />Demo con datos ficticios</span></section>
    <section className="stat-grid" aria-label="Resumen de la cola">
      <article className="stat-card"><span className="stat-icon"><Icon name="people" /></span><div><strong>{waiting.length}</strong><span>En espera</span></div></article>
      <article className="stat-card"><span className="stat-icon"><Icon name="clock" /></span><div><strong>12 min</strong><span>Espera promedio</span></div></article>
      <article className="stat-card"><span className="stat-icon"><Icon name="calendar" /></span><div><strong>09:00–13:00</strong><span>Horario del consultorio</span></div></article>
    </section>
    <section className="panel queue-panel">
      <div className="panel-heading"><div><h2>Pacientes en espera</h2><p>Ordenados por prioridad y hora de llegada</p></div><span className="count-badge">{waiting.length} pacientes</span></div>
      {loading ? <div className="loading-state" role="status"><span className="spinner" /><span>Cargando la cola…</span></div> : error ? <div className="empty-state error-state" role="alert"><span className="state-icon"><Icon name="info" size={27} /></span><h3>No pudimos cargar la cola</h3><p>Revisá la conexión e intentá actualizar nuevamente.</p><button className="retry-button" type="button" onClick={() => setScenario('data')}><Icon name="refresh" size={15} />Reintentar</button></div> : <QueueTable patients={waiting} />}
      {!loading && !error && <div className="call-area"><div className="call-note"><Icon name="info" size={18} /><span>Se llama primero a quien tiene prioridad y luego por hora de llegada. La cola se guarda en este navegador.</span></div><button className="primary-button" type="button" disabled={!waiting.length} onClick={onCallNext}><Icon name="bell" />Llamar al siguiente<Icon name="arrow" size={18} /></button></div>}
      {currentCall && !error && <div className="last-call-card" role="status"><span className="last-call-icon"><Icon name="check" size={20} /></span><div><span className="last-call-label">ÚLTIMO TURNO LLAMADO</span><strong>{currentCall.id} <small>· Consultorio 3</small></strong><span className="last-call-time">Llamado a las {formatLocalCallTime(currentCall.calledAt)}</span></div></div>}
      {storageError && <p className="storage-warning" role="status">No se pudo guardar en este navegador. Los cambios se perderán al cerrar la página.</p>}
    </section>
    <section className="demo-tools" aria-label="Controles de demostración"><span>Estados de demo</span><button type="button" onClick={() => setScenario('data')}>Con datos</button><button type="button" onClick={() => setScenario('empty')}>Cola vacía</button><button type="button" onClick={() => setScenario('error')}>Simular error</button><button type="button" onClick={onReset}>Reiniciar demo</button></section>
  </>
}

function WaitingRoomPage({ patients, currentCall }) {
  const waiting = sortEligiblePatients(patients)
  return <>
    <header className="page-heading"><div><div className="eyebrow">CENTRO MÉDICO · CENTRO CAPITAL</div><h1>Sala de espera</h1><p>Información clara para orientar a las personas que esperan.</p></div><LocalClock /></header>
    <section className="public-screen" aria-label="Pantalla pública de turnos">
      <div className="public-call"><div className="public-kicker"><span className="public-pulse" />LLAMADO ACTUAL</div><p className={`no-call ${currentCall ? 'has-call' : ''}`}>{currentCall ? currentCall.id : 'Aún no hay un turno llamado'}</p><div className="public-room"><Icon name="display" size={24} /><span>Diríjase al consultorio 3</span></div><p className="public-caption">{currentCall ? `Turno llamado a las ${formatLocalCallTime(currentCall.calledAt)}` : 'Por favor, espere a que su número aparezca en pantalla.'}</p></div>
      <aside className="upcoming"><div className="upcoming-heading"><div><span className="eyebrow">CONSULTORIO 3</span><h2>Próximos turnos</h2></div><span className="upcoming-count">{waiting.length}</span></div>
        {waiting.length ? <ol className="upcoming-list">{waiting.slice(0, 5).map((patient, index) => <li key={patient.id}><span className="upcoming-position">{String(index + 1).padStart(2, '0')}</span><strong>{patient.id}</strong><span className="upcoming-state">En espera</span></li>)}</ol> : <div className="upcoming-empty">No hay turnos pendientes.</div>}
        <div className="public-message"><Icon name="info" size={19} /><span>Vista de demostración con datos ficticios. Turno actual: {currentCall?.id ?? 'ninguno'}.</span></div>
      </aside>
    </section>
    <div className="privacy-note"><Icon name="check" size={18} /><span>Solo se muestran números de turno; no se publican nombres ni datos clínicos.</span></div>
  </>
}

function App() {
  const [page, setPage] = useState('queue')
  const [scenario, setScenario] = useState('data')
  const [loading, setLoading] = useState(true)
  const [demoState, setDemoState] = useState(loadSavedDemo)
  const [storageError, setStorageError] = useState(false)
  const actualWaiting = sortEligiblePatients(demoState.patients)
  const patients = scenario === 'empty' ? [] : scenario === 'error' ? [] : demoState.patients

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [scenario])

  const selectScenario = (next) => {
    setScenario(next)
    setLoading(true)
  }

  const saveDemoState = (nextState) => {
    setDemoState(nextState)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextState))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }

  const callNext = () => {
    const nextPatient = actualWaiting[0]
    if (!nextPatient) return
    const calledAt = new Date().toISOString()
    saveDemoState({
      ...demoState,
      patients: demoState.patients.map((patient) => patient.id === nextPatient.id
        ? { ...patient, status: 'Llamado', calledAt }
        : patient),
      currentCall: { ...nextPatient, status: 'Llamado', calledAt },
    })
  }

  const resetDemo = () => {
    saveDemoState({ patients: seedPatients.map((patient) => ({ ...patient })), currentCall: null })
    setScenario('data')
  }

  return <div className="app-shell">
    <aside className="sidebar"><div className="sidebar-brand"><Brand /></div><div className="facility"><span className="facility-mark">CC</span><span><strong>Centro Capital</strong><small>Centro médico</small></span></div><nav aria-label="Navegación principal"><span className="nav-label">MÓDULO</span>{navItems.map((item) => <button key={item.id} type="button" className={`nav-link ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{page === item.id && <Icon name="chevron" size={17} />}</button>)}</nav><div className="sidebar-footer"><div className="user-avatar" aria-hidden="true">MP</div><div className="user-details"><strong>María P.</strong><span>Profesional · Cardiología</span></div><span className="online-dot" title="Sesión activa" /></div></aside>
    <main className="main-content"><div className="topbar"><div className="breadcrumb"><span>Operación</span><Icon name="chevron" size={15} /><strong>{page === 'queue' ? 'Cola de espera' : 'Sala de espera'}</strong></div><div className="topbar-right"><span className="topbar-center"><span /> Centro Capital</span><span className="avatar-small">MP</span></div></div><div className="content-wrap">
      {page === 'queue' ? <QueuePage patients={patients} currentCall={demoState.currentCall} setScenario={selectScenario} onCallNext={callNext} onReset={resetDemo} loading={loading} error={scenario === 'error' && !loading} storageError={storageError} /> : <WaitingRoomPage patients={demoState.patients} currentCall={demoState.currentCall} />}
    </div><footer className="app-footer"><Brand /><span>Demo académica · Datos ficticios</span><span>SaludPlus · Gestión de sala de espera</span></footer></main>
  </div>
}

export default App
