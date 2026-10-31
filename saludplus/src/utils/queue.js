export function sortEligiblePatients(patients) {
  return patients
    .filter((patient) => patient.status === 'Esperando')
    .sort((a, b) => {
      const priorityOrder = Number(b.priority === 'Prioridad') - Number(a.priority === 'Prioridad')
      return priorityOrder || a.arrived.localeCompare(b.arrived)
    })
}

export function formatLocalCallTime(value) {
  return formatLocalTime(new Date(value))
}

export function formatLocalTime(value = new Date()) {
  const hour = value.getHours() % 12 || 12
  const minute = String(value.getMinutes()).padStart(2, '0')
  const period = value.getHours() >= 12 ? 'pm' : 'am'

  return `${String(hour).padStart(2, '0')}:${minute} ${period}`
}
