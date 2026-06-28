'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface Props {
  defaultBuscar?: string
  defaultFecha?: string
}

export default function CitasFiltros({ defaultBuscar = '', defaultFecha = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [buscar, setBuscar] = useState(defaultBuscar)
  const [fecha, setFecha] = useState(defaultFecha)

  const apply = (b: string, f: string) => {
    const params = new URLSearchParams()
    if (b.trim()) params.set('buscar', b.trim())
    if (f) params.set('fecha', f)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    apply(buscar, fecha)
  }

  const clearBuscar = () => { setBuscar(''); apply('', fecha) }
  const clearFecha = () => { setFecha(''); apply(buscar, '') }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          placeholder="Nombre o teléfono…"
          className="pl-8 pr-7 h-9 w-52"
        />
        {buscar && (
          <button
            type="button"
            onClick={clearBuscar}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="relative">
        <Input
          type="date"
          value={fecha}
          onChange={e => { setFecha(e.target.value); apply(buscar, e.target.value) }}
          className="h-9 w-40 pr-7"
        />
        {fecha && (
          <button
            type="button"
            onClick={clearFecha}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="h-9 px-3 text-sm font-medium rounded-md border bg-background hover:bg-accent transition-colors"
      >
        Buscar
      </button>
    </form>
  )
}
