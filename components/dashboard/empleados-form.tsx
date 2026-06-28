'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { UserPlus, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DIAS_LARGO, DEFAULT_HORARIOS } from '@/lib/constants'
import type { Empleado, EmpleadoHorario } from '@/lib/type'

function timeToMin(t: string) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

type HorRow = Omit<EmpleadoHorario, 'id' | 'empleado_id'>

type EmpleadoState = {
  id: string
  nombre: string
  horarios: HorRow[]
  expanded: boolean
  saving: boolean
}

interface Props {
  comercioId: string
  empleados: (Empleado & { empleado_horarios: EmpleadoHorario[] })[]
}

function buildHorarios(saved: EmpleadoHorario[]): HorRow[] {
  return DEFAULT_HORARIOS.map(def => {
    const found = saved.find(h => h.dia_semana === def.dia_semana)
    return found
      ? { dia_semana: found.dia_semana, hora_inicio: found.hora_inicio.slice(0, 5), hora_fin: found.hora_fin.slice(0, 5), activo: found.activo }
      : { ...def }
  })
}

export default function EmpleadosForm({ comercioId, empleados: initial }: Props) {
  const supabase = createClient()

  const [empleados, setEmpleados] = useState<EmpleadoState[]>(
    initial.map(e => ({
      id: e.id,
      nombre: e.nombre,
      horarios: buildHorarios(e.empleado_horarios ?? []),
      expanded: false,
      saving: false,
    }))
  )
  const [adding, setAdding] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [addingLoading, setAddingLoading] = useState(false)

  const patchEmpleado = (id: string, patch: Partial<EmpleadoState>) =>
    setEmpleados(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))

  const patchHorario = (empId: string, dia: number, patch: Partial<HorRow>) =>
    setEmpleados(prev => prev.map(e =>
      e.id === empId
        ? { ...e, horarios: e.horarios.map(h => h.dia_semana === dia ? { ...h, ...patch } : h) }
        : e
    ))

  const handleAdd = async () => {
    if (!newNombre.trim()) return
    setAddingLoading(true)
    const { data, error } = await supabase
      .from('empleados')
      .insert({ comercio_id: comercioId, nombre: newNombre.trim(), activo: true })
      .select()
      .single()
    setAddingLoading(false)
    if (error || !data) { toast.error('No se pudo crear el empleado.'); return }
    setEmpleados(prev => [...prev, {
      id: data.id,
      nombre: data.nombre,
      horarios: DEFAULT_HORARIOS.map(h => ({ ...h })),
      expanded: true,
      saving: false,
    }])
    setNewNombre('')
    setAdding(false)
    toast.success('Empleado añadido')
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('empleados').update({ activo: false }).eq('id', id)
    if (error) { toast.error('No se pudo eliminar.'); return }
    setEmpleados(prev => prev.filter(e => e.id !== id))
    toast.success('Empleado eliminado')
  }

  const handleSaveHorario = async (id: string) => {
    const emp = empleados.find(e => e.id === id)
    if (!emp) return

    const invalid = emp.horarios.filter(h => h.activo && timeToMin(h.hora_fin) <= timeToMin(h.hora_inicio))
    if (invalid.length > 0) {
      toast.error(`Hora de cierre debe ser posterior a la de apertura (${invalid.map(h => DIAS_LARGO[h.dia_semana]).join(', ')}).`)
      return
    }

    patchEmpleado(id, { saving: true })
    const payload = emp.horarios.map(h => ({
      empleado_id: id,
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      activo: h.activo,
    }))
    const { error } = await supabase
      .from('empleado_horarios')
      .upsert(payload, { onConflict: 'empleado_id,dia_semana' })
    patchEmpleado(id, { saving: false })
    if (error) { toast.error('No se pudo guardar el horario.'); return }
    toast.success('Horario guardado')
  }

  return (
    <div className="space-y-2.5">
      {empleados.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground py-1">
          Sin empleados. La capacidad por slot se aplica globalmente según el número configurado arriba.
        </p>
      )}

      {empleados.map(emp => (
        <div key={emp.id} className="rounded-lg border overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={() => patchEmpleado(emp.id, { expanded: !emp.expanded })}
              className="flex items-center gap-2 flex-1 text-left min-w-0"
            >
              {emp.expanded
                ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              }
              <span className="text-sm font-medium truncate">{emp.nombre}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {emp.horarios.filter(h => h.activo).length} días activos
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(emp.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded shrink-0"
              aria-label="Eliminar empleado"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {emp.expanded && (
            <div className="border-t bg-muted/20 px-3 py-3 space-y-1.5">
              {emp.horarios.map(row => (
                <div
                  key={row.dia_semana}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${row.activo ? 'bg-background' : 'bg-muted/40'}`}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.activo}
                    aria-label={DIAS_LARGO[row.dia_semana]}
                    onClick={() => patchHorario(emp.id, row.dia_semana, { activo: !row.activo })}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus-visible:outline-none ${row.activo ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${row.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                  <span className={`w-20 text-sm font-medium shrink-0 ${row.activo ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {DIAS_LARGO[row.dia_semana]}
                  </span>
                  {row.activo ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="time"
                        value={row.hora_inicio}
                        aria-label={`${DIAS_LARGO[row.dia_semana]} apertura`}
                        onChange={e => patchHorario(emp.id, row.dia_semana, { hora_inicio: e.target.value })}
                        className="border rounded px-1.5 py-0.5 text-xs w-24 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <span className="text-muted-foreground text-xs">—</span>
                      <input
                        type="time"
                        value={row.hora_fin}
                        aria-label={`${DIAS_LARGO[row.dia_semana]} cierre`}
                        onChange={e => patchHorario(emp.id, row.dia_semana, { hora_fin: e.target.value })}
                        className={`border rounded px-1.5 py-0.5 text-xs w-24 bg-background focus:outline-none focus:ring-1 focus:ring-ring ${
                          timeToMin(row.hora_fin) <= timeToMin(row.hora_inicio) ? 'border-destructive' : ''
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Libre</span>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                onClick={() => handleSaveHorario(emp.id)}
                disabled={emp.saving}
                className="w-full mt-1"
              >
                {emp.saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Guardar horario
              </Button>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del empleado"
            value={newNombre}
            onChange={e => setNewNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
            className="text-sm"
          />
          <Button size="sm" onClick={handleAdd} disabled={addingLoading || !newNombre.trim()}>
            {addingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Crear'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewNombre('') }}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => setAdding(true)}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Añadir empleado
        </Button>
      )}
    </div>
  )
}
