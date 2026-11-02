import { useState } from "react";
import PageHeader from "../../components/PageHeader";

const PAGE_SIZE = 20;

const todayLabel = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "full",
}).format(new Date());

const presentStatuses = new Set([
  "Recepción",
  "Llamado recepción",
  "Esperando",
  "Llamado",
  "Atendido",
]);

function isPresent(patient) {
  return (
    patient.status !== "Ausente" &&
    (Boolean(patient.presentedAt) || presentStatuses.has(patient.status))
  );
}

function hasKioskArrival(patient) {
  return (
    patient.origenIngreso === "Tótem" ||
    (!patient.origenIngreso && !patient.ingresoManual && isPresent(patient))
  );
}

function statusLabel(patient) {
  if (patient.status === "Ausente") return "Ausente";
  if (patient.paidAt) return "$ Pagado";
  if (patient.status === "Llamado recepción") return "Llamado en recepción";
  if (patient.status === "Llamado") return "Llamado";
  if (patient.status === "Esperando") return "En espera";
  if (patient.status === "Atendido") return "Atendido";
  return isPresent(patient) ? "Presente" : "Pendiente";
}

export default function DayAppointments({
  patients,
  onMarkPresent,
  onRecall,
  onBack,
}) {
  const [onlyKioskArrivals, setOnlyKioskArrivals] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    turn: "",
    patient: "",
    specialty: "",
    scheduledTime: "",
    presentationTime: "",
    origin: "",
    status: "",
  });
  const sortedPatients = [...patients].sort((a, b) =>
    String(a.horaTurno || a.hora || "").localeCompare(String(b.horaTurno || b.hora || "")),
  );
  const kioskFilteredPatients = onlyKioskArrivals
    ? sortedPatients.filter(hasKioskArrival)
    : sortedPatients;
  const filteredPatients = kioskFilteredPatients.filter((patient) => {
    const values = {
      turn: patient.id,
      patient: patient.nombre,
      specialty: patient.especialidad,
      scheduledTime: patient.horaTurno || patient.hora,
      presentationTime: patient.horaPresentacion || patient.arrived,
      origin:
        patient.origenIngreso ||
        (patient.ingresoManual ? "Manual" : isPresent(patient) ? "Tótem" : "Agenda"),
      status: statusLabel(patient),
    };
    return Object.entries(filters).every(([key, query]) =>
      String(values[key] || "").toLocaleLowerCase("es-AR").includes(query.trim().toLocaleLowerCase("es-AR")),
    );
  });
  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const visiblePatients = filteredPatients.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const columnDefinitions = [
    ["turn", "Turno", "Ej. A-104"],
    ["patient", "Paciente", "Nombre"],
    ["specialty", "Especialidad", "Especialidad"],
    ["scheduledTime", "Horario del turno", "Horario planificado"],
    ["presentationTime", "Presentación", "Hora real"],
    ["origin", "Ingreso", "Origen"],
    ["status", "Estado", "Estado"],
  ];
  const availableStatuses = [...new Set(kioskFilteredPatients.map(statusLabel))].sort(
    (a, b) => a.localeCompare(b, "es-AR"),
  );

  return (
    <>
      <PageHeader
        title="Turnos del día"
        description={`Todas las especialidades · ${todayLabel}`}
        onBack={onBack}
      />
      <section className="panel day-appointments-panel">
        <div className="day-appointments-toolbar">
          <div>
            <h2>Todos los turnos</h2>
            <p>{filteredPatients.length} turnos</p>
          </div>
          <label className="kiosk-arrivals-filter">
            <input
              type="checkbox"
              checked={onlyKioskArrivals}
              onChange={(event) => {
                setOnlyKioskArrivals(event.target.checked);
                setPage(1);
              }}
            />
            <span>Solo ingresados por tótem</span>
          </label>
        </div>
        <div className="table-wrap">
            <table className="day-appointments-table">
              <thead>
                <tr>
                  {columnDefinitions.map(([key, label]) => (
                    <th key={key} scope="col">{label}</th>
                  ))}
                  <th scope="col">Acciones</th>
                </tr>
                <tr className="appointment-filter-row">
                  {columnDefinitions.map(([key, label, placeholder]) => (
                    <th key={key}>
                      {key === "status" ? (
                        <select
                          className="appointment-column-filter"
                          aria-label="Filtrar por estado"
                          value={filters.status}
                          onChange={(event) => updateFilter("status", event.target.value)}
                        >
                          <option value="">Todos los estados</option>
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="appointment-column-filter"
                          type="search"
                          aria-label={`Filtrar por ${label.toLocaleLowerCase("es-AR")}`}
                          placeholder={placeholder}
                          value={filters[key]}
                          onChange={(event) => updateFilter(key, event.target.value)}
                        />
                      )}
                    </th>
                  ))}
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {visiblePatients.map((patient) => {
                  const absent = patient.status === "Ausente";
                  const present = isPresent(patient);
                  const currentStatus = statusLabel(patient);
                  const statusTone = absent
                    ? "is-absent"
                    : patient.paidAt
                      ? "is-paid"
                      : patient.status === "Llamado" ||
                          patient.status === "Llamado recepción"
                        ? "is-called"
                        : present
                          ? "is-present"
                          : "is-pending";
                  return (
                    <tr key={patient.id}>
                      <td><strong className="ticket-number">{patient.id}</strong></td>
                      <td>{patient.nombre}</td>
                      <td>{patient.especialidad}</td>
                      <td>{patient.horaTurno || patient.hora || "Sin turno"}</td>
                      <td>{patient.horaPresentacion || patient.arrived || "—"}</td>
                      <td>{patient.origenIngreso || (patient.ingresoManual ? "Manual" : present ? "Tótem" : "Agenda")}</td>
                      <td>
                        <span className={`appointment-status ${statusTone}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="appointment-actions">
                          {(absent || !present) && (
                            <button type="button" className="appointment-action mark-present" onClick={() => onMarkPresent(patient)}>
                              Marcar presente
                            </button>
                          )}
                          {present && (
                            <button
                              type="button"
                              className="appointment-action recall-turn"
                              disabled={Boolean(patient.paidAt)}
                              title={patient.paidAt ? "El turno ya fue pagado" : "Volver a llamar este turno"}
                              onClick={() => onRecall(patient)}
                            >
                              Volver a llamar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!visiblePatients.length && (
                  <tr>
                    <td className="appointments-no-results" colSpan={8}>
                      No hay turnos que coincidan con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="appointments-pagination">
              <span>
                {filteredPatients.length
                  ? `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredPatients.length)} de ${filteredPatients.length}`
                  : "Sin resultados"}
              </span>
              <div>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </button>
                <strong>Página {page} de {pageCount}</strong>
                <button
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                >
                  Siguiente
                </button>
              </div>
            </div>
        </div>
      </section>
    </>
  );
}
