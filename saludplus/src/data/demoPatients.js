// Fictitious local records to demonstrate the reception workflow without a backend.
const appointments = [
  ["A-104", "28456789", "Lucía Gómez", "Femenino", "Salud Plus", "Activa", "351 555-0142", "Control anual", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:00 am", 8500],
  ["A-105", "30112456", "Martín López", "Masculino", "Salud Plus", "Activa", "351 555-0188", "Dolor de pecho", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:15 am", 0],
  ["A-107", "26345891", "Sofía Torres", "Femenino", "Salud Plus", "Vencida", "351 555-0121", "Electrocardiograma", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:30 am", 12500],
  ["A-110", "33882145", "Diego Fernández", "Masculino", "Salud Plus", "Activa", "351 555-0194", "Seguimiento", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:45 am", 5000],
  ["A-112", "27903218", "Valentina Ruiz", "Femenino", "Salud Plus", "Activa", "351 555-0109", "Consulta clínica", "Dr. Pablo Sosa", "Clínica médica", "31/10/2026", "10:00 am", 0],
  ["A-115", "32457890", "Tomás Castro", "Masculino", "Salud Plus", "Activa", "351 555-0163", "Primera consulta", "Dra. María Pérez", "Cardiología", "31/10/2026", "10:15 am", 8500],
];

const extraNames = [
  ["Ana", "Femenino"], ["Juan", "Masculino"], ["Carolina", "Femenino"],
  ["Pablo", "Masculino"], ["Micaela", "Femenino"], ["Andrés", "Masculino"],
  ["Camila", "Femenino"], ["Nicolás", "Masculino"], ["Florencia", "Femenino"],
  ["Mateo", "Masculino"], ["Julieta", "Femenino"], ["Santiago", "Masculino"],
];
const extraSurnames = ["Pereyra", "Gutiérrez", "Romero", "Herrera"];
const specialties = [
  ["Cardiología", "Dra. María Pérez", "Control cardiológico"],
  ["Cardiología", "Dra. María Pérez", "Seguimiento cardiológico"],
  ["Clínica médica", "Dr. Pablo Sosa", "Consulta clínica"],
  ["Pediatría", "Dra. Laura Ríos", "Control de salud"],
  ["Traumatología", "Dr. Martín Acosta", "Dolor articular"],
  ["Dermatología", "Dra. Paula Medina", "Control dermatológico"],
  ["Ginecología", "Dra. Valeria Suárez", "Consulta programada"],
  ["Oftalmología", "Dr. Diego Luna", "Control de visión"],
  ["Endocrinología", "Dra. Sofía Molina", "Seguimiento"],
];

function formatAppointmentTime(minutesAfterMidnight) {
  const hour24 = Math.floor(minutesAfterMidnight / 60);
  const hour12 = hour24 % 12 || 12;
  const minutes = String(minutesAfterMidnight % 60).padStart(2, "0");
  return `${String(hour12).padStart(2, "0")}:${minutes} ${hour24 >= 12 ? "pm" : "am"}`;
}

export function normalizeAppointmentTime(value) {
  const match = String(value || "").match(
    /^(\d{1,2}):(\d{2})(?:\s*([ap])\.?\s*m\.?)?/i,
  );
  if (!match) return value;

  let hour = Number(match[1]);
  const minute = match[2];
  let period = match[3]?.toLowerCase();
  if (!period) {
    period = hour >= 12 ? "p" : "a";
    hour = hour % 12 || 12;
  }
  return `${String(hour).padStart(2, "0")}:${minute} ${period}m`;
}

export function formatLocalAppointmentTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return normalizeAppointmentTime(value);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date).toLowerCase();
}

const extraAppointments = Array.from({ length: 44 }, (_, index) => {
  const [firstName, sexo] = extraNames[index % extraNames.length];
  const surname = extraSurnames[Math.floor(index / extraNames.length)];
  const [especialidad, medico, motivo] = specialties[index % specialties.length];
  const turnNumber = 120 + index;
  const dni = String(20000000 + index * 73421);
  return [
    `A-${turnNumber}`,
    dni,
    `${firstName} ${surname}`,
    sexo,
    "Salud Plus",
    index % 13 === 0 ? "Vencida" : "Activa",
    `351 555-${String(2000 + index).slice(-4)}`,
    motivo,
    medico,
    especialidad,
    "31/10/2026",
    formatAppointmentTime(7 * 60 + index * 12),
    index % 4 === 0 ? 8500 : 0,
  ];
});

export const demoPatients = [...appointments, ...extraAppointments].map(
  ([id, dni, nombre, sexo, obraSocial, estadoObraSocial, telefono, motivo, medico, especialidad, fecha, hora, monto], index) => {
    const status =
      index >= 45
        ? "Pendiente"
        : index >= 32
          ? "Ausente"
          : index < 12 && especialidad !== "Cardiología"
            ? "Recepción"
            : "Esperando";
    const hasPresented = index < 32;
    const minutesWaiting = 8 + ((index * 7) % 49);
    const presentedAt = hasPresented
      ? new Date(Date.now() - minutesWaiting * 60_000).toISOString()
      : null;
    const presentationTime = formatLocalAppointmentTime(presentedAt);
    return {
      id, dni, nombre, sexo, obraSocial, estadoObraSocial, telefono, motivo, medico, especialidad, fecha, hora, monto,
      horaTurno: hora,
      nroAfiliado: `${dni.slice(-6)}-${id.slice(-3)}`,
      email: `${nombre.toLocaleLowerCase("es-AR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".")}@correo.com`,
      arrived: presentationTime,
      horaPresentacion: presentationTime,
      origenIngreso: hasPresented ? "Tótem" : "Agenda",
      presentedAt,
      priority: id === "A-110" ? "Prioridad" : "Normal",
      status,
    };
  },
);

const recordsByDni = new Map(demoPatients.map((patient) => [patient.dni, patient]));

export function patientFromDni(dni, id, arrived) {
  const record = recordsByDni.get(dni);
  if (record)
    return {
      ...record,
      id,
      hora: normalizeAppointmentTime(record.horaTurno || record.hora),
      horaTurno: normalizeAppointmentTime(record.horaTurno || record.hora),
      arrived: normalizeAppointmentTime(arrived),
      horaPresentacion: normalizeAppointmentTime(arrived),
      presentedAt: new Date().toISOString(),
      status: "Recepción",
    };

  return {
    id, dni, nombre: "Paciente nuevo", sexo: "No especificado",
    obraSocial: "Salud Plus", nroAfiliado: `${dni.slice(-6)}-001`,
    estadoObraSocial: "Activa", telefono: "351 555-0000",
    email: "paciente@correo.com",
    motivo: "Consulta programada", medico: "Dra. María Pérez",
    especialidad: "Cardiología", fecha: "31/10/2026", hora: "Sin turno", horaTurno: "Sin turno",
    monto: 8500, arrived: normalizeAppointmentTime(arrived), horaPresentacion: normalizeAppointmentTime(arrived), origenIngreso: "Tótem", presentedAt: new Date().toISOString(), priority: "Normal", status: "Recepción",
  };
}
