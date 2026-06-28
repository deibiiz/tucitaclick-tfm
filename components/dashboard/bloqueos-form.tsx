'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Bloqueo } from '@/lib/type'

interface Props {
  comercioId: string
  bloqueos: Bloqueo[]
}

function formatBloqueo(b: Bloqueo): string {
  const inicio = new Date(b.fecha_inicio)
  const fin = new Date(b.fecha_fin)
  const mismodia = inicio.toDateString() === fin.toDateString()
  const fmtFecha = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  const fmtHora = (d: Date) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  if (mismodia) {
    const diaCompleto = inicio.getHours() === 0 && fin.getHours() === 23
    return diaCompleto ? fmtFecha(inicio) : `${fmtFecha(inicio)}, ${fmtHora(inicio)}–${fmtHora(fin)}`
  }
  return `${fmtFecha(inicio)} → ${fmtFecha(fin)}`
}

export default function BloqueosForm({ comercioId, bloqueos: initial }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>(initial)
  const [diaCompleto, setDiaCompleto] = useState(true)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFin, setHoraFin] = useState('18:00')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const add = async () => {
    if (!fechaInicio || !fechaFin) { toast.error('Indica las fechas de inicio y fin'); return }

    const inicio = diaCompleto ? `${fechaInicio}T00:00:00` : `${fechaInicio}T${horaInicio}:00`
    const fin = diaCompleto ? `${fechaFin}T23:59:59` : `${fechaFin}T${horaFin}:00`

    if (new Date(inicio) >= new Date(fin)) {
      toast.error('La fecha de fin debe ser posterior a la de inicio')
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('bloqueos')
      .insert({ comercio_id: comercioId, fecha_inicio: inicio, fecha_fin: fin, motivo: motivo.trim() || null })
      .select()
      .single()

    setLoading(false)
    if (error) { toast.error('No se pudo añadir el bloqueo'); return }

    setBloqueos(prev => [...prev, data as Bloqueo].sort(
      (a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
    ))
    setFechaInicio('')
    setFechaFin('')
    setMotivo('')
    toast.success('Bloqueo añadido')
  }

  const remove = async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('bloqueos').delete().eq('id', id)
    setDeletingId(null)
    if (error) { toast.error('No se pudo eliminar el bloqueo'); return }
    setBloqueos(prev => prev.filter(b => b.id !== id))
    toast.success('Bloqueo eliminado')
  }

  return (
    <div className="space-y-4">
      {bloqueos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay bloqueos configurados.</p>
      ) : (
        <div className="space-y-2">
          {bloqueos.map(b => (
            <div key={b.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-sm">
              <div className="min-w-0">
                <span className="font-medium">{formatBloqueo(b)}</span>
                {b.motivo && <span className="text-muted-foreground ml-2">· {b.motivo}</span>}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(b.id)}
                disabled={deletingId === b.id}
              >
                {deletingId === b.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-3 space-y-3">
        <p className="text-sm font-medium">Añadir bloqueo</p>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={diaCompleto} onChange={e => setDiaCompleto(e.target.checked)} className="rounded" />
          Día completo
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Desde</Label>
            <Input
              type="date"
              min={today}
              value={fechaInicio}
              onChange={e => { setFechaInicio(e.target.value); if (!fechaFin) setFechaFin(e.target.value) }}
            />
            {!diaCompleto && (
              <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Hasta</Label>
            <Input
              type="date"
              min={fechaInicio || today}
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
            {!diaCompleto && (
              <Input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Motivo (opcional)</Label>
          <Input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Vacaciones, Formación…" />
        </div>

        <Button size="sm" onClick={add} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
          Añadir bloqueo
        </Button>
      </div>
    </div>
  )
}
