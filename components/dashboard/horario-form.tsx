'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DIAS_LARGO, DEFAULT_HORARIOS } from '@/lib/constants'
import type { Horario } from '@/lib/type'

function timeToMin(t: string) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function buildInitial(saved: Horario[]): Omit<Horario, 'id' | 'comercio_id'>[] {
  return DEFAULT_HORARIOS.map(def => {
    const found = saved.find(h => h.dia_semana === def.dia_semana)
    return found
      ? { dia_semana: found.dia_semana, hora_inicio: found.hora_inicio.slice(0, 5), hora_fin: found.hora_fin.slice(0, 5), activo: found.activo }
      : def
  })
}

interface Props {
  comercioId: string
  horarios: Horario[]
}

export default function HorarioForm({ comercioId, horarios }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState(() => buildInitial(horarios))

  const update = (dia: number, patch: Partial<typeof rows[0]>) =>
    setRows(prev => prev.map(r => r.dia_semana === dia ? { ...r, ...patch } : r))

  const handleSave = async () => {
    const invalid = rows.filter(r => r.activo && timeToMin(r.hora_fin) <= timeToMin(r.hora_inicio))
    if (invalid.length > 0) {
      toast.error(`Hora de cierre debe ser posterior a la de apertura (${invalid.map(r => DIAS_LARGO[r.dia_semana]).join(', ')}).`)
      return
    }

    setLoading(true)
    const payload = rows.map(r => ({ ...r, comercio_id: comercioId }))
    const { error } = await supabase
      .from('horarios')
      .upsert(payload, { onConflict: 'comercio_id,dia_semana' })
    setLoading(false)
    if (error) { toast.error(error.message || 'No se pudo guardar el horario.'); return }
    toast.success('Horario guardado')
  }

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.dia_semana} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${row.activo ? 'bg-background' : 'bg-muted/40'}`}>
          <button
            type="button"
            onClick={() => update(row.dia_semana, { activo: !row.activo })}
            role="switch"
            aria-checked={row.activo}
            aria-label={DIAS_LARGO[row.dia_semana]}
            className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${row.activo ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${row.activo ? 'translate-x-4.5' : 'translate-x-0'}`} />
          </button>

          <span className={`w-24 text-sm font-medium shrink-0 ${row.activo ? 'text-foreground' : 'text-muted-foreground'}`}>
            {DIAS_LARGO[row.dia_semana]}
          </span>

          {row.activo ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={row.hora_inicio}
                aria-label={`${DIAS_LARGO[row.dia_semana]} apertura`}
                onChange={e => update(row.dia_semana, { hora_inicio: e.target.value })}
                className="border rounded-md px-2 py-1 text-sm w-28 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <input
                type="time"
                value={row.hora_fin}
                aria-label={`${DIAS_LARGO[row.dia_semana]} cierre`}
                onChange={e => update(row.dia_semana, { hora_fin: e.target.value })}
                className={`border rounded-md px-2 py-1 text-sm w-28 bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                  timeToMin(row.hora_fin) <= timeToMin(row.hora_inicio) ? 'border-destructive' : ''
                }`}
              />
            </div>
          ) : (
            <span className="text-sm text-muted-foreground italic">Cerrado</span>
          )}
        </div>
      ))}

      <Button onClick={handleSave} disabled={loading} className="w-full mt-2">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar horario
      </Button>
    </div>
  )
}
