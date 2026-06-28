'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Servicio, Horario } from '@/lib/type'

type EmpSchedule = { hora_inicio: string; hora_fin: string }

function timeToMin(t: string) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function minToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
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

interface Props {
  comercioId: string
  servicios: Servicio[]
  horarios: Horario[]
  empleados?: number
}

export default function NuevaCitaForm({ comercioId, servicios, horarios, empleados = 1 }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [enviarWA, setEnviarWA] = useState(true)
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<string[]>([])
  const [bookedCounts, setBookedCounts] = useState<Record<string, number>>({})
  const [capacities, setCapacities] = useState<Record<string, number>>({})
  const [bloqueos, setBloqueos] = useState<{ fecha_inicio: string; fecha_fin: string }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!open) {
      setServicio(null); setFecha(''); setHora(''); setNombre(''); setTel('')
      setSlots([]); setBookedCounts({}); setCapacities({}); setBloqueos([])
    }
  }, [open])

  useEffect(() => {
    if (!fecha || !servicio) {
      setSlots([]); setBookedCounts({}); setCapacities({}); setBloqueos([]); setHora('')
      return
    }
    setLoadingSlots(true)
    setHora('')

    const diaSemana = new Date(`${fecha}T00:00:00`).getDay()
    const start = new Date(`${fecha}T00:00:00`).toISOString()
    const end = new Date(`${fecha}T23:59:59`).toISOString()

    Promise.all([
      supabase.rpc('get_empleados_horarios', { p_comercio_id: comercioId, p_dia_semana: diaSemana }),
      supabase.rpc('get_booked_slots', { p_comercio_id: comercioId, p_fecha_inicio: start, p_fecha_fin: end }),
      supabase.rpc('get_bloqueos', { p_comercio_id: comercioId, p_fecha_inicio: start, p_fecha_fin: end }),
    ]).then(([{ data: empData }, { data: bookedData }, { data: bloqueoData }]) => {
      const empSchedules = empData && empData.length > 0 ? (empData as EmpSchedule[]) : null

      let newSlots: string[]
      let newCaps: Record<string, number> = {}

      if (empSchedules) {
        newSlots = generateSlotsFromEmployees(empSchedules, servicio.duracion)
        newCaps = calcCapacities(empSchedules, newSlots, servicio.duracion)
      } else {
        const diaSemanaNum = new Date(`${fecha}T00:00:00`).getDay()
        const horario = horarios.find(h => h.dia_semana === diaSemanaNum && h.activo)
        newSlots = horario ? generateSlots(horario, servicio.duracion) : []
      }

      const counts: Record<string, number> = {}
      for (const row of (bookedData ?? []) as { fecha_hora: string }[]) {
        const d = new Date(row.fecha_hora)
        const key = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        counts[key] = (counts[key] ?? 0) + 1
      }

      setSlots(newSlots)
      setCapacities(newCaps)
      setBookedCounts(counts)
      setBloqueos((bloqueoData ?? []) as { fecha_inicio: string; fecha_fin: string }[])
      setLoadingSlots(false)
    })
  }, [fecha, servicio, comercioId, horarios, supabase])

  const isBlockedSlot = (h: string) => {
    if (!bloqueos.length || !servicio) return false
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

  const submit = async () => {
    if (!servicio || !fecha || !hora || !nombre.trim() || !tel.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    const citaId = crypto.randomUUID()
    const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString()

    const { error } = await supabase.from('citas').insert({
      id: citaId,
      comercio_id: comercioId,
      servicio_id: servicio.id,
      cliente_nombre: nombre.trim(),
      cliente_tel: tel.trim(),
      fecha_hora: fechaHora,
      estado: 'confirmado',
    })

    setLoading(false)
    if (error) { toast.error('No se pudo crear la cita'); return }

    if (enviarWA) {
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citaId }),
      }).catch(() => {})
    }

    fetch('/api/google/sync-cita-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId }),
    }).catch(() => {})

    toast.success('Cita creada correctamente')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="flex items-center gap-1.5" />}>
        <Plus className="h-4 w-4" /> Nueva cita
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Servicio</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={servicio?.id ?? ''}
              onChange={e => {
                const s = servicios.find(s => s.id === e.target.value) ?? null
                setServicio(s)
                setFecha('')
                setHora('')
              }}
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} ({s.duracion} min)</option>
              ))}
            </select>
          </div>

          {servicio && (
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input type="date" min={today} value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
          )}

          {fecha && servicio && (
            <div className="space-y-1.5">
              <Label>Hora</Label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Comprobando disponibilidad…
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay horario disponible para este día.</p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map(h => {
                    const full = isFull(h)
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => !full && setHora(h)}
                        disabled={full}
                        className={`py-1.5 rounded-md border text-sm font-medium transition-all ${
                          full
                            ? 'border-muted bg-muted/30 text-muted-foreground/40 line-through cursor-not-allowed'
                            : hora === h
                            ? 'border-primary bg-primary text-primary-foreground'
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

          <div className="space-y-1.5">
            <Label>Nombre del cliente</Label>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre y apellidos" />
          </div>

          <div className="space-y-1.5">
            <Label>Teléfono</Label>
            <Input value={tel} onChange={e => setTel(e.target.value)} placeholder="612 345 678" type="tel" />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={enviarWA} onChange={e => setEnviarWA(e.target.checked)} className="rounded" />
            Enviar confirmación por WhatsApp
          </label>

          <Button
            className="w-full"
            onClick={submit}
            disabled={loading || !servicio || !fecha || !hora || !nombre.trim() || !tel.trim()}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Crear cita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
