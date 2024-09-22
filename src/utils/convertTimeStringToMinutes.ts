export function convertTimeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number) // pega o time e separa em horas e minutos

  return hours * 60 + minutes // dá as horas em minutos
}
