// Fictitious local records to demonstrate the reception workflow without a backend.
const appointments = [
  ["A-104", "28456789", "Lucía Gómez", "Femenino", "Salud Plus", "Activa", "351 555-0142", "Control anual", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:00 am", 8500],
  ["A-105", "30112456", "Martín López", "Masculino", "Salud Plus", "Activa", "351 555-0188", "Dolor de pecho", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:15 am", 0],
  ["A-107", "26345891", "Sofía Torres", "Femenino", "Salud Plus", "Vencida", "351 555-0121", "Electrocardiograma", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:30 am", 12500],
  ["A-110", "33882145", "Diego Fernández", "Masculino", "Salud Plus", "Activa", "351 555-0194", "Seguimiento", "Dra. María Pérez", "Cardiología", "31/10/2026", "09:45 am", 5000],
  ["A-112", "27903218", "Valentina Ruiz", "Femenino", "Salud Plus", "Activa", "351 555-0109", "Consulta clínica", "Dr. Pablo Sosa", "Clínica médica", "31/10/2026", "10:00 am", 0],
  ["A-115", "32457890", "Tomás Castro", "Masculino", "Salud Plus", "Activa", "351 555-0163", "Primera consulta", "Dra. María Pérez", "Cardiología", "31/10/2026", "10:15 am", 8500],
];

export const demoPatients = appointments.map(([id, dni, nombre, sexo, obraSocial, estadoObraSocial, telefono, motivo, medico, especialidad, fecha, hora, monto]) => ({
  id, dni, nombre, sexo, obraSocial, estadoObraSocial, telefono, motivo, medico, especialidad, fecha, hora, monto,
  nroAfiliado: `${dni.slice(-6)}-${id.slice(-3)}`,
  arrived: hora,
  priority: id === "A-110" ? "Prioridad" : "Normal",
  status: ["A-104", "A-105", "A-107"].includes(id) ? "Recepción" : "Esperando",
}));

const recordsByDni = new Map(demoPatients.map((patient) => [patient.dni, patient]));

export function patientFromDni(dni, id, arrived) {
  const record = recordsByDni.get(dni);
  if (record) return { ...record, id, arrived, status: "Recepción" };

  const [hourText, minuteText] = arrived.split(":");
  const hour24 = Number(hourText) || 0;
  const hour12 = hour24 % 12 || 12;
  const meridiem = hour24 >= 12 ? "pm" : "am";
  return {
    id, dni, nombre: "Paciente nuevo", sexo: "No especificado",
    obraSocial: "Salud Plus", nroAfiliado: `${dni.slice(-6)}-001`,
    estadoObraSocial: "Activa", telefono: "351 555-0000",
    motivo: "Consulta programada", medico: "Dra. María Pérez",
    especialidad: "Cardiología", fecha: "31/10/2026", hora: `${String(hour12).padStart(2, "0")}:${minuteText || "00"} ${meridiem}`,
    monto: 8500, arrived, priority: "Normal", status: "Recepción",
  };
}
