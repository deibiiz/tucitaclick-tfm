'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ServicioForm({ comercioId }: { comercioId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', duracion: '', precio: '' })

  const duracion = parseInt(form.duracion)
  const precio = parseFloat(form.precio)

  const duracionError = form.duracion !== '' && (isNaN(duracion) || duracion < 5 || duracion > 480)
    ? 'Entre 5 y 480 minutos.'
    : ''
  const precioError = form.precio !== '' && (isNaN(precio) || precio < 0 || precio > 9999)
    ? 'Precio entre 0 € y 9999 €.'
    : ''

  const canSubmit = form.nombre.trim() && !duracionError && !precioError &&
    form.duracion !== '' && form.precio !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)

    const { error } = await supabase.from('servicios').insert({
      comercio_id: comercioId,
      nombre: form.nombre.trim(),
      duracion,
      precio,
    })

    setLoading(false)
    if (error) { toast.error(error.message); return }

    toast.success('Servicio añadido')
    setForm({ nombre: '', duracion: '', precio: '' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre del servicio</Label>
        <Input
          id="nombre"
          placeholder="Ej: Corte de cabello"
          required
          value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="duracion">Duración (min)</Label>
          <Input
            id="duracion"
            type="number"
            placeholder="30"
            min="5"
            max="480"
            required
            value={form.duracion}
            onChange={e => setForm(f => ({ ...f, duracion: e.target.value }))}
            className={duracionError ? 'border-destructive' : ''}
          />
          {duracionError && <p className="text-xs text-destructive">{duracionError}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="precio">Precio (€)</Label>
          <Input
            id="precio"
            type="number"
            placeholder="15.00"
            min="0"
            max="9999"
            step="0.01"
            required
            value={form.precio}
            onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
            className={precioError ? 'border-destructive' : ''}
          />
          {precioError && <p className="text-xs text-destructive">{precioError}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Añadir servicio
      </Button>
    </form>
  )
}
