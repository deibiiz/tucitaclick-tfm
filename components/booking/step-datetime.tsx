'use client'

import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Servicio, Horario } from '@/lib/type'
import type { BookingState } from './booking-flow'

interface Props {
  comercioId: string
  empleados?: number
  servicio: Servicio
  fecha: string
  hora: string
  horarios: Horario[]
  diasAnticipacion?: number
  onChange: (data: Partial<BookingState>) => void
  onBack: () => void
  onNext: () => void
}

type EmpSchedule = { hora_inicio: string; hora_fin: string }

type SlotData = {
  empSchedules: EmpSchedule[] | null
  bookedData: { fecha_hora: string }[]
  bloqueos: { fecha_inicio: string; fecha_fin: string }[]
}

function timeToMin(t: string) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function minToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

function getAvailableDays(activeDias: Set<number>, dias: number): Date[] {
  const days: Date[] = []
  const today = new Date()
  for (let i = 1; i <= dias; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (activeDias.has(d.getDay())) days.push(d)
  }
  return days
}

function generateSlots(horario: Horario, duracionMin: number): string[] {
  const start = timeToMin(horario.hora_inicio)
  const end = timeToMin(horario.hora_fin)
  const slots: string[] = []
  for (let m = start; m + duracionMin <= end; m += 30) slots.push(minToTime(m))
  return slots
}

function generateSlotsFromEmployees(schedules: EmpSchedule[], duracionMin: number): string[] {
  const slotSet = new Set<string>()
  for (const s of schedules) {
    const start = timeToMin(s.hora_inicio)
    const end = timeToMin(s.hora_fin)
    for (let m = start; m + duracionMin <= end; m += 30) slotSet.add(minToTime(m))
  }
  return Array.from(slotSet).sort()
}

function calcCapacities(schedules: EmpSchedule[], slots: string[], duracionMin: number): Record<string, number> {
  const caps: Record<string, number> = {}
  for (const slot of slots) {
    const slotMin = timeToMin(slot)
    caps[slot] = schedules.filter(s =>
      slotMin >= timeToMin(s.hora_inicio) && slotMin + duracionMin <= timeToMin(s.hora_fin)
    ).length
  }
  return caps
}

export default function StepDateTime({ comercioId, empleados = 1, servicio, fecha, hora, horarios, diasAnticipacion = 14, onChange, onBack, onNext }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [slotData, setSlotData] = useState<SlotData | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  //Calcula los días solo cuando cambian los horarios. useMemo evita recalcularlo en cada render.
  const days = useMemo(() => {
    const activeDias = new Set(horarios.filter(h => h.activo).map(h => h.dia_semana))
    return getAvailableDays(activeDias, diasAnticipacion)
  }, [horarios])

  // Fetch calendario trabajadores y slots ocupados cuándo la fecha cambia
  useEffect(() => {
    if (!fecha) { setSlotData(null); return }
    setLoadingSlots(true)
    setSlotData(null)

    const diaSemana = new Date(`${fecha}T00:00:00`).getDay()
    const start = new Date(`${fecha}T00:00:00`).toISOString()
    const end = new Date(`${fecha}T23:59:59`).toISOString()

    Promise.all([
      supabase.rpc('get_empleados_horarios', { p_comercio_id: comercioId, p_dia_semana: diaSemana }),
      supabase.rpc('get_booked_slots', { p_comercio_id: comercioId, p_fecha_inicio: start, p_fecha_fin: end }),
      supabase.rpc('get_bloqueos', { p_comercio_id: comercioId, p_fecha_inicio: start, p_fecha_fin: end }),
    ]).then(([{ data: empData }, { data: bookedData }, { data: bloqueoData }]) => {
      setSlotData({
        empSchedules: empData && empData.length > 0 ? (empData as EmpSchedule[]) : null,
        bookedData: (bookedData ?? []) as { fecha_hora: string }[],
        bloqueos: (bloqueoData ?? []) as { fecha_inicio: string; fecha_fin: string }[],
      })
      setLoadingSlots(false)
    })
  }, [fecha, comercioId, supabase])

  // Slots calculados a partir del calendario de los trabajadores, por defecto es el horario del comercio
  const { slots, capacities } = useMemo(() => {
    if (!fecha) return { slots: [] as string[], capacities: {} as Record<string, number> }

    if (slotData?.empSchedules) {
      const s = generateSlotsFromEmployees(slotData.empSchedules, servicio.duracion)
      const c = calcCapacities(slotData.empSchedules, s, servicio.duracion)
      return { slots: s, capacities: c }
    }

    // Fallback: horario comercio
    const diaSemana = new Date(fecha + 'T00:00:00').getDay()
    const horario = horarios.find(h => h.dia_semana === diaSemana && h.activo)
    if (!horario) return { slots: [] as string[], capacities: {} as Record<string, number> }
    return { slots: generateSlots(horario, servicio.duracion), capacities: {} as Record<string, number> }
  }, [fecha, slotData, horarios, servicio.duracion])

  // Slots reservados
  const bookedCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const row of slotData?.bookedData ?? []) {
      const d = new Date(row.fecha_hora)
      const key = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }, [slotData])

  const isBlockedSlot = (h: string) => {
    const bloqueos = slotData?.bloqueos ?? []
    if (!bloqueos.length) return false
    const slotStart = new Date(`${fecha}T${h}:00`)
    const slotEnd = new Date(slotStart.getTime() + servicio.duracion * 60000)
    return bloqueos.some(b => new Date(b.fecha_inicio) < slotEnd && new Date(b.fecha_fin) > slotStart)
  }

  const isFull = (h: string) => {
    if (isBlockedSlot(h)) return true
    return Object.keys(capacities).length > 0
      ? (bookedCounts[h] ?? 0) >= (capacities[h] ?? 1)
      : (bookedCounts[h] ?? 0) >= empleados
  }

  const formatDay = (d: Date) =>
    d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

  // convierte a UTC, lo que puede dar la fecha anterior en UTC+1/+2.
  // getFullYear/Month/Date para obtener la fecha local sin conversión.
  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Elige fecha y hora</h2>
        <p className="text-sm text-muted-foreground">
          Servicio: <span className="font-medium text-foreground">{servicio.nombre}</span> · {servicio.duracion} min
        </p>
      </div>

      {/* selector días */}
      <div>
        <p className="text-sm font-medium mb-2">Fecha</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {days.map(d => {
            const iso = toISO(d)
            const isSelected = fecha === iso
            return (
              <button
                key={iso}
                onClick={() => onChange({ fecha: iso, hora: '' })}
                className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-white hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                {formatDay(d)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selector horas */}
      {fecha && (
        <div>
          <p className="text-sm font-medium mb-2">Hora</p>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Comprobando disponibilidad…
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slots.map(h => {
                const full = isFull(h)
                return (
                  <button
                    key={h}
                    onClick={() => !full && onChange({ hora: h })}
                    disabled={full}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                      full
                        ? 'border-muted bg-muted/30 text-muted-foreground/40 line-through cursor-not-allowed'
                        : hora === h
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'bg-white hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button
          className="flex-1 flex items-center gap-1.5"
          disabled={!fecha || !hora}
          onClick={onNext}
        >
          Continuar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
