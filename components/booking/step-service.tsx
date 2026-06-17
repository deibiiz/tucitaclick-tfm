import { Card, CardContent } from '@/components/ui/card'
import { Clock, Euro, ChevronRight } from 'lucide-react'
import type { Servicio } from '@/lib/type'

interface Props {
  servicios: Servicio[]
  selected: Servicio | null
  onSelect: (s: Servicio) => void
}

export default function StepService({ servicios, selected, onSelect }: Props) {
  if (servicios.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 pb-10 text-center">
          <p className="text-muted-foreground">Este negocio aún no tiene servicios disponibles.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">¿Qué servicio necesitas?</h2>
        <p className="text-sm text-muted-foreground">Selecciona uno para continuar</p>
      </div>
      <ul className="space-y-2">
        {servicios.map(s => (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-primary hover:shadow-sm ${
                selected?.id === s.id ? 'border-primary bg-primary/5 shadow-sm' : 'bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{s.nombre}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{s.duracion} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Euro className="h-3 w-3" />{s.precio.toFixed(2)}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
