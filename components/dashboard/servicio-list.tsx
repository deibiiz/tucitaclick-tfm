'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Clock, Euro, Trash2, Loader2 } from 'lucide-react'
import type { Servicio } from '@/lib/type'

export default function ServicioList({ servicios }: { servicios: Servicio[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('servicios').delete().eq('id', id)
    setDeleting(null)
    if (error) { toast.error(error.message); return }
    toast.success('Servicio eliminado')
    router.refresh()
  }

  if (servicios.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-8">
        Aún no has añadido ningún servicio.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {servicios.map(s => (
        <li key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{s.nombre}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />{s.duracion} min
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Euro className="h-3 w-3" />{s.precio.toFixed(2)}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
            onClick={() => handleDelete(s.id)}
            disabled={deleting === s.id}
          >
            {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </li>
      ))}
    </ul>
  )
}
