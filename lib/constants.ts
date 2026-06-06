export const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const DIAS_LARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const DIA_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const DEFAULT_HORARIOS: {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
}[] = [
  { dia_semana: 0, hora_inicio: '09:00', hora_fin: '19:00', activo: false },
  { dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 5, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { dia_semana: 6, hora_inicio: '09:00', hora_fin: '14:00', activo: true },
]
