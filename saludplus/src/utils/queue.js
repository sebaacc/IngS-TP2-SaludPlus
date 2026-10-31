export function sortEligiblePatients(patients) {
  return patients
    .filter((patient) => patient.status === 'Esperando')
    .sort((a, b) => {
      const priorityOrder = Number(b.priority === 'Prioridad') - Number(a.priority === 'Prioridad')
      return priorityOrder || a.arrived.localeCompare(b.arrived)
    })
}

export function formatLocalCallTime(value) {
  return new Date(value).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
