export interface Comercio {
  id: string
  nombre: string
  slug: string
  dueno_id: string
  descripcion?: string | null
  telefono?: string | null
  direccion?: string | null
  foto_portada?: string | null
  empleados?: number
  confirmacion_manual?: boolean
  dias_anticipacion?: number
}

export interface Servicio {
  id: string
  comercio_id: string
  nombre: string
  duracion: number
  precio: number
}

export interface Horario {
  id: string
  comercio_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

export interface Empleado {
  id: string
  comercio_id: string
  nombre: string
  activo: boolean
}

export interface EmpleadoHorario {
  id: string
  empleado_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  activo: boolean
}

export interface Bloqueo {
  id: string
  comercio_id: string
  fecha_inicio: string
  fecha_fin: string
  motivo?: string | null
}

export interface Publicacion {
  id: string
  comercio_id: string
  tipo: 'oferta' | 'anuncio' | 'aviso'
  titulo: string
  contenido: string
  activo: boolean
  fecha_expira: string | null
  created_at: string
}

export interface Cita {
  id: string
  comercio_id: string
  servicio_id?: string
  cliente_nombre: string
  cliente_tel: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmado' | 'cancelado'
  notas?: string | null
  google_event_id?: string | null
  servicios?: Servicio
}
